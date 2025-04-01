import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PetContext } from '../Context/Context';
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBIcon,
  MDBSpinner
} from 'mdb-react-ui-kit';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';

function SuccessPayment() {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { loginStatus, userID, fetchUserMembership, membership } = useContext(PetContext);
  
  // Use a ref to track if we've already processed this payment
  const paymentProcessed = useRef(false);

  useEffect(() => {
    // Only process once
    if (paymentProcessed.current) return;
    
    const processPayment = async () => {
      try {
        // Get query parameters from URL
        const params = new URLSearchParams(location.search);
        const orderId = params.get('orderId');
        const transId = params.get('transId');
        const resultCode = params.get('resultCode');
        const message = params.get('message');
        
        console.log("Payment data received:", { orderId, transId, resultCode, message });
        
        // Set payment status based on URL parameters
        if (resultCode === '0') {
          setPaymentStatus({
            success: true,
            orderId,
            transId,
            message: message || 'Payment successful'
          });
          
          // Fetch the updated membership status only once
          await fetchUserMembership();
          toast.success('Your membership has been upgraded successfully!');
        } else {
          setPaymentStatus({
            success: false,
            orderId,
            transId,
            message: message || 'Payment failed'
          });
        }
      } catch (err) {
        console.error("Error processing payment:", err);
        setError("Failed to process payment result. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    // Mark as processed to prevent multiple executions
    paymentProcessed.current = true;
    processPayment();
  }, [location.search]); // Remove fetchUserMembership from dependencies

  if (loading) {
    return (
      <MDBContainer className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <MDBSpinner role="status">
            <span className="visually-hidden">Loading...</span>
          </MDBSpinner>
          <p className="mt-3">Processing payment result...</p>
        </div>
      </MDBContainer>
    );
  }

  if (error) {
    return (
      <MDBContainer className="my-5">
        <MDBCard>
          <MDBCardBody className="text-center">
            <MDBIcon fas icon="exclamation-triangle" className="text-warning" size="4x" />
            <MDBCardTitle className="mt-3">Error</MDBCardTitle>
            <MDBCardText>{error}</MDBCardText>
            <MDBBtn color="primary" onClick={() => navigate('/membership')}>
              Back to Membership
            </MDBBtn>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    );
  }

  return (
    <MDBContainer className="my-5">
      <MDBCard>
        <MDBCardBody className="text-center p-5">
          {paymentStatus?.success ? (
            <>
              <MDBIcon fas icon="check-circle" className="text-success" size="4x" />
              <MDBCardTitle className="mt-3 text-success">Payment Successful</MDBCardTitle>
              <MDBCardText className="my-4">
                Thank you for upgrading to premium membership! Your account has been updated.
              </MDBCardText>
              
              {membership && membership.type === 'premium' && (
                <MDBCardText className="text-success">
                  <strong>Membership Status:</strong> Premium
                  {membership.endDate && (
                    <span> (Valid until: {new Date(membership.endDate).toLocaleDateString()})</span>
                  )}
                </MDBCardText>
              )}
            </>
          ) : (
            <>
              <MDBIcon fas icon="times-circle" className="text-danger" size="4x" />
              <MDBCardTitle className="mt-3 text-danger">Payment Failed</MDBCardTitle>
              <MDBCardText className="my-4">
                {paymentStatus?.message || "There was an issue processing your payment."}
              </MDBCardText>
            </>
          )}
          
          {paymentStatus?.orderId && (
            <MDBCardText>
              <strong>Order ID:</strong> {paymentStatus.orderId}
            </MDBCardText>
          )}
          
          {paymentStatus?.transId && (
            <MDBCardText>
              <strong>Transaction ID:</strong> {paymentStatus.transId}
            </MDBCardText>
          )}
          
          <div className="d-flex justify-content-center mt-4">
            <MDBBtn color="primary" onClick={() => navigate('/membership')}>
              Back to Membership
            </MDBBtn>
            
            <MDBBtn color="secondary" className="ms-3" onClick={() => navigate('/')}>
              Go to Home
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCard>
    </MDBContainer>
  );
}

export default SuccessPayment;