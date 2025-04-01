const { User } = require('../Models/userSchema');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();
const { Payment } = require('../Models/paymentSchema');
const { v4: uuidv4 } = require('uuid');

// MoMo API configuration
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const PARTNER_CODE = process.env.PARTNER_CODE || 'MOMOBKUN20180529';
const ACCESS_KEY = process.env.ACCESS_KEY || 'klm05TvNBzhg7h7j';
const SECRET_KEY = process.env.SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa';
const RETURN_URL = process.env.RETURN_URL || 'http://localhost:3000/payment/success';
const NOTIFY_URL = process.env.NOTIFY_URL || 'https://088b-222-254-188-246.ngrok-free.app/payment/momo/notify';
const REQUEST_TYPE = 'payWithATM';

const momoPaymentController = {
  // Create a new payment
  createPayment: async (req, res) => {
    console.log("Payment request received");
    console.log("User ID:", req.params.id);
    
    try {
      const userId = req.params.id;
      console.log("Looking up user with ID:", userId);
      
      const user = await User.findById(userId);
      console.log("User found:", user ? "Yes" : "No");
      
      if (!user) {
        console.log("User not found, returning 404");
        return res.status(404).json({ 
          status: 'failure',
          message: 'User not found' 
        });
      }

      // Generate a unique order ID
      const orderId = `MOMO_${Date.now()}`;
      const requestId = `REQ_${Date.now()}`;
      const amount = '50000'; // 50,000 VND for premium membership
      const orderInfo = 'Premium Membership for Pet Services';
      const extraData = Buffer.from(JSON.stringify({ userId })).toString('base64');

      // Create signature for ATM payment
      const rawSignature = `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${NOTIFY_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${PARTNER_CODE}&redirectUrl=${RETURN_URL}&requestId=${requestId}&requestType=${REQUEST_TYPE}`;
      const signature = crypto.createHmac('sha256', SECRET_KEY)
        .update(rawSignature)
        .digest('hex');

      // Create request body for ATM payment
      const requestBody = {
        partnerCode: PARTNER_CODE,
        partnerName: "Pet Services",
        storeId: "PetServicesStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: RETURN_URL,
        ipnUrl: NOTIFY_URL,
        extraData: extraData,
        requestType: REQUEST_TYPE,
        signature: signature,
        lang: 'vi'
      };

      console.log("Sending request to MoMo:", MOMO_ENDPOINT);
      console.log("Request body:", requestBody);

      // Send request to MoMo
      const response = await axios.post(MOMO_ENDPOINT, requestBody);
      const jsonResponse = response.data;
      
      console.log("MoMo response:", jsonResponse);

      // Return payment URL to client
      res.status(200).json({
        status: 'success',
        message: 'Payment created successfully',
        data: jsonResponse
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(500).json({
        status: 'failure',
        message: 'Error creating payment',
        error: error.message
      });
    }
  },

  // Handle payment notification from MoMo
  handleNotification: async (req, res) => {
    try {
      console.log("MoMo notification received:", req.body);
      
      // Skip authentication check for MoMo webhook
      // MoMo doesn't send authorization headers, so we need to validate the request differently
      
      const {
        partnerCode,
        orderId,
        requestId,
        amount,
        orderInfo,
        orderType,
        transId,
        resultCode,
        message,
        payType,
        responseTime,
        extraData
      } = req.body;
      
      // Validate that this is a legitimate MoMo request
      // You should implement additional security checks here
      if (!partnerCode || !orderId || !transId) {
        console.log("Invalid MoMo notification - missing required fields");
        return res.status(400).json({
          status: 'error',
          message: 'Invalid notification data'
        });
      }
      
      // Check if payment was successful
      if (resultCode === 0) {
        console.log("Payment successful, updating user membership");
        
        // Extract user ID from extraData (base64 encoded)
        let userId;
        try {
          const decodedData = Buffer.from(extraData, 'base64').toString('utf-8');
          userId = JSON.parse(decodedData).userId;
          console.log("Extracted user ID from extraData:", userId);
        } catch (error) {
          console.error("Failed to extract user ID from extraData:", error);
          return res.status(400).json({
            status: 'error',
            message: 'Invalid extraData format'
          });
        }
        
        if (!userId) {
          console.log("No user ID found in extraData");
          return res.status(400).json({
            status: 'error',
            message: 'No user ID in extraData'
          });
        }
        
        // Find the user and update membership
        const user = await User.findById(userId);
        if (!user) {
          console.log("User not found:", userId);
          return res.status(404).json({
            status: 'error',
            message: 'User not found'
          });
        }
        
        // Calculate membership end date (30 days from now)
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        
        // Update user membership
        user.membership = {
          status: 'active',
          type: 'premium',
          startDate: startDate,
          endDate: endDate,
          transactionId: transId,
          createdAt: new Date()
        };
        
        await user.save();
        console.log("User membership updated successfully");
        console.log("New membership status:", user.membership);
        
        // Create a payment record
        const payment = new Payment({
          userId: userId,
          orderId: orderId,
          transactionId: transId,
          amount: amount,
          paymentMethod: 'momo',
          status: 'completed',
          details: {
            orderInfo,
            orderType,
            payType,
            responseTime
          },
          createdAt: new Date()
        });
        
        await payment.save();
        console.log("Payment record created successfully");
      } else {
        console.log("Payment failed with result code:", resultCode);
        console.log("Message:", message);
      }
      
      // Always return 200 OK to MoMo to acknowledge receipt
      return res.status(200).json({
        status: 'success',
        message: 'Notification received'
      });
    } catch (error) {
      console.error("Error processing MoMo notification:", error);
      // Still return 200 to MoMo to prevent retries
      return res.status(200).json({
        status: 'error',
        message: 'Error processing notification'
      });
    }
  },

  // Handle payment result
  handlePaymentResult: async (req, res) => {
    try {
      console.log("\n=== MoMo Payment Result (Redirect) ===");
      console.log("Request headers:", JSON.stringify(req.headers, null, 2));
      console.log("Query parameters:", JSON.stringify(req.query, null, 2));
      console.log("Request method:", req.method);
      console.log("Request URL:", req.originalUrl);
      
      // Extract parameters from the query
      const { 
        partnerCode, 
        orderId, 
        requestId,
        amount, 
        orderInfo, 
        orderType,
        transId, 
        resultCode, 
        message, 
        payType, 
        responseTime, 
        extraData, 
        signature 
      } = req.query;
      
      console.log("Order ID:", orderId);
      console.log("Transaction ID:", transId);
      console.log("Result Code:", resultCode);
      console.log("Message:", message);
      console.log("Extra Data:", extraData);
      
      // Verify the signature
      const rawSignature = `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
      
      const computedSignature = crypto.createHmac('sha256', SECRET_KEY)
        .update(rawSignature)
        .digest('hex');
      
      console.log("Computed signature:", computedSignature);
      console.log("Received signature:", signature);
      
      let userId = null;
      let membershipType = 'premium'; // Default to premium
      
      // Try to extract user ID from extraData
      try {
        if (extraData) {
          const decodedData = JSON.parse(Buffer.from(extraData, 'base64').toString());
          userId = decodedData.userId;
          console.log("Decoded user ID:", userId);
          console.log("Decoded extra data:", decodedData);
        }
      } catch (error) {
        console.error("Error decoding extraData:", error);
      }
      
      // Redirect to the client with the payment result
      // Use PaymentSuccess page for successful payments
      if (resultCode === '0') {
        const successUrl = `http://localhost:3000/payment/success?type=${membershipType}&orderId=${orderId}&transId=${transId || ''}&userId=${userId || ''}`;
        console.log("Redirecting to success page:", successUrl);
        res.redirect(successUrl);
      } else {
        // For failed payments, still use the PaymentResult page
        const failureUrl = `http://localhost:3000/payment/result?status=failure&message=${encodeURIComponent(message)}&orderId=${orderId}&transId=${transId || ''}&userId=${userId || ''}`;
        console.log("Redirecting to result page (failure):", failureUrl);
        res.redirect(failureUrl);
      }
    } catch (error) {
      console.error("Payment result handling error:", error);
      console.error("Error stack:", error.stack);
      
      // Redirect to client with error
      const redirectUrl = `http://localhost:3000/payment/result?status=error&message=${encodeURIComponent('Error processing payment result')}`;
      console.log("Error redirect to:", redirectUrl);
      res.redirect(redirectUrl);
    }
  },

  createMomoPayment: async (req, res) => {
    try {
      const userId = req.params.userId;
      
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      // MoMo payment configuration
      const requestId = uuidv4();
      const orderId = `MOMO_${Date.now()}`;
      const orderInfo = "Premium Membership for Pet Services";
      const redirectUrl = RETURN_URL;
      const ipnUrl = NOTIFY_URL;
      const amount = "50000";
      const requestType = REQUEST_TYPE;
      const extraData = Buffer.from(JSON.stringify({ userId })).toString('base64');
      
      // Create signature using existing constants
      const rawSignature = `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const signature = crypto.createHmac('sha256', SECRET_KEY)
        .update(rawSignature)
        .digest('hex');
      
      // Create payment request body
      const requestBody = {
        partnerCode: PARTNER_CODE,
        accessKey: ACCESS_KEY,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        extraData,
        requestType,
        signature
      };
      
      // Send request to MoMo
      const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/create', requestBody);
      
      return res.status(200).json({
        status: 'success',
        message: 'Payment URL created successfully',
        data: response.data
      });
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'An error occurred while creating payment'
      });
    }
  },
  
  checkMomoPaymentStatus: async (req, res) => {
    try {
      const orderId = req.params.orderId;
      
      // MoMo configuration
      const partnerCode = process.env.MOMO_PARTNER_CODE;
      const accessKey = process.env.MOMO_ACCESS_KEY;
      const secretKey = process.env.MOMO_SECRET_KEY;
      const requestId = uuidv4();
      
      // Create signature
      const rawSignature = `accessKey=${accessKey}&orderId=${orderId}&partnerCode=${partnerCode}&requestId=${requestId}`;
      const signature = crypto.createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');
      
      // Create request body
      const requestBody = {
        partnerCode,
        accessKey,
        requestId,
        orderId,
        signature
      };
      
      // Send request to MoMo
      const response = await axios.post('https://test-payment.momo.vn/v2/gateway/api/query', requestBody);
      
      return res.status(200).json({
        status: 'success',
        data: response.data
      });
    } catch (error) {
      console.error('Error checking MoMo payment status:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message || 'An error occurred while checking payment status'
      });
    }
  },

  handleMomoNotification: async (req, res) => {
    console.log('==========================================');
    console.log('MOMO NOTIFICATION HANDLER STARTED');
    console.log('==========================================');
    
    try {
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      console.log('Request headers:', JSON.stringify(req.headers, null, 2));
      
      // Extract data from MoMo notification
      const { 
        partnerCode, 
        orderId, 
        requestId,
        amount, 
        orderInfo, 
        orderType,
        transId, 
        resultCode, 
        message, 
        payType, 
        responseTime,
        extraData,
        signature 
      } = req.body;
      
      console.log('Extracted fields:');
      console.log('- partnerCode:', partnerCode);
      console.log('- orderId:', orderId);
      console.log('- requestId:', requestId);
      console.log('- amount:', amount);
      console.log('- resultCode:', resultCode, 'type:', typeof resultCode);
      console.log('- extraData:', extraData);
      
      // Decode the extraData to get userId
      let userId = null;
      try {
        if (extraData) {
          console.log('Attempting to decode extraData:', extraData);
          const decodedString = Buffer.from(extraData, 'base64').toString();
          console.log('Decoded string:', decodedString);
          
          const decodedData = JSON.parse(decodedString);
          console.log('Parsed JSON:', decodedData);
          
          userId = decodedData.userId;
          console.log('Extracted userId:', userId);
        } else {
          console.log('WARNING: No extraData provided in the notification');
        }
      } catch (error) {
        console.error('ERROR decoding extraData:', error);
        console.error('Error stack:', error.stack);
      }
      
      // If payment successful and we have a userId, update membership
      console.log('Checking payment status - resultCode:', resultCode, 'userId:', userId);
      
      // Check for success - resultCode can be either string '0' or number 0
      if ((resultCode === '0' || resultCode === 0) && userId) {
        console.log('Payment successful. Proceeding with membership update');
        
        try {
          console.log('Looking up user with ID:', userId);
          const user = await User.findById(userId);
          
          if (user) {
            console.log('User found:', user._id);
            console.log('Current membership:', JSON.stringify(user.membership, null, 2));
            
            // Set membership to premium for 30 days
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 30);
            
            console.log('Setting new membership:');
            console.log('- type: premium');
            console.log('- status: active');
            console.log('- startDate:', startDate);
            console.log('- endDate:', endDate);
            
            user.membership = {
              type: 'premium',
              status: 'active',
              startDate: startDate,
              endDate: endDate,
              transactionId: transId
            };
            
            console.log('Saving user...');
            await user.save();
            console.log('User saved successfully');
            console.log('Updated membership:', JSON.stringify(user.membership, null, 2));
            
            // Create a payment record
            console.log('Creating payment record...');
            const payment = new Payment({
              userId: userId,
              orderId: orderId,
              transactionId: transId,
              amount: parseInt(amount, 10),
              paymentMethod: 'momo',
              status: 'completed',
              details: {
                orderInfo,
                orderType,
                payType,
                responseTime
              }
            });
            
            console.log('Payment record created, saving to database...');
            await payment.save();
            console.log('Payment record saved successfully:', payment._id);
          } else {
            console.log('ERROR: User with ID', userId, 'not found in database');
          }
        } catch (dbError) {
          console.error('DATABASE ERROR:', dbError);
          console.error('Error stack:', dbError.stack);
        }
      } else {
        console.log('Payment not successful or missing userId. No membership update performed.');
        console.log('resultCode type:', typeof resultCode, 'value:', resultCode);
        console.log('userId type:', typeof userId, 'value:', userId);
      }
      
      console.log('Sending 200 response to MoMo');
      
      // Always return 200 to MoMo
      return res.status(200).json({
        status: 'success',
        message: 'Notification received and processed'
      });
    } catch (error) {
      console.error('CRITICAL ERROR in notification handler:', error);
      console.error('Error stack:', error.stack);
      
      // Still return 200 to MoMo to prevent retries
      return res.status(200).json({
        status: 'error',
        message: 'Error processing notification, but received'
      });
    } finally {
      console.log('==========================================');
      console.log('MOMO NOTIFICATION HANDLER COMPLETED');
      console.log('==========================================');
    }
  }
};

module.exports = momoPaymentController;