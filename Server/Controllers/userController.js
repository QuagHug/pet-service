const { User, userRegisterSchema, userLoginSchema } = require('../Models/userSchema');
const { Product } = require('../Models/productSchema');
const Order = require('../Models/orderSchema');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { JWT_SECRET } = require('../config/jwtConfig');
let orderDetails = {};

const userController = {
  register: async (req, res) => {
    try {
      console.log("\n=== Register Attempt ===");
      const { name, email, password, pets } = req.body;
      console.log("Email:", email);

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log("User already exists");
        return res.status(400).json({
          status: 'failure',
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed");

      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        pets: pets || [],
        favoriteServices: [],
        clickHistory: [],
        membership: {
          status: 'inactive',
          type: 'free',
          startDate: null,
          endDate: null
        },
        paymentHistory: []
      });

      // Save user to database
      await newUser.save();
      console.log("User saved to database");

      // Generate JWT token
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log("Token generated");
      console.log("=== Register Success ===\n");

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        token,
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error registering user',
        error: error.message
      });
    }
  },

  login: async (req, res) => {
    try {
      console.log("\n=== Login Attempt ===");
      const { email, password } = req.body;
      console.log("Email:", email);

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(401).json({
          status: 'failure',
          message: 'Invalid email or password'
        });
      }
      console.log("User found:", user.email);

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log("Invalid password");
        return res.status(401).json({
          status: 'failure',
          message: 'Invalid email or password'
        });
      }
      console.log("Password valid");

      // Generate JWT token using the shared JWT_SECRET
      console.log("Using JWT_SECRET first 5 chars:", JWT_SECRET.substring(0, 5));
      
      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log("Token generated");
      console.log("=== Login Success ===\n");

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        token,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          membership: user.membership
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error logging in',
        error: error.message
      });
    }
  },

  getAllProducts: async (req, res) => {
    const products = await Product.find();
    if (products.length == 0) {
      return res.json({ message: 'Product collection is empty!' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched products detail.',
      data: products,
    });
  },

  getProductById: async (req, res) => {
    const productID = req.params.id;
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched product details.',
      data: product,
    });
  },

  getTopSellingProducts: async (req, res) => {
    const DogFood = await Product.find({ category: 'Dog' }).limit(4);
    const CatFood = await Product.find({ category: 'Cat' }).limit(4);
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched products.',
      data: [...DogFood, ...CatFood],
    });
  },

  getProductsByCategory: async (req, res) => {
    const category = req.params.categoryname;
    const products = await Product.find({ category });
    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched products details.',
      data: products,
    });
  },

  showCart: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched cart items.',
      data: user.cart,
    });
  },

  addToCart: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { productID } = req.body;
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await User.findByIdAndUpdate(userID, { $addToSet: { cart: { product: productID } } });

    res.status(200).json({
      status: 'success',
      message: 'Product added to cart',
      cart: user.cart,
    });
  },

  updateCartItemQuantity: async (req, res) => {
    const userID = req.params.id;
    const { id, quantityChange } = req.body;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedCart = (user.cart.id(id).quantity += quantityChange);
    if (updatedCart > 0) {
      await user.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Cart item quantity updated',
      data: user.cart,
    });
  },

  removeFromCart: async (req, res) => {
    const userID = req.params.id;
    const productID = req.params.product;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(userID, { $pull: { cart: { product: productID } } });
    res.status(200).json({
      status: 'success',
      message: 'Successfully removed from cart',
    });
  },

  showWishlist: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched wishlist.',
      data: user.wishlist,
    });
  },

  addToWishlist: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { productID } = req.body;
    const product = await Product.findById(productID);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(userID, { $addToSet: { wishlist: productID } }, { new: true });
    res.status(200).json({
      status: 'success',
      message: 'Successfully added to wishlist',
      data: updatedUser.wishlist,
    });
  },

  removeFromWishlist: async (req, res) => {
    const userID = req.params.id;
    const productID = req.params.product;

    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndUpdate(userID, { $pull: { wishlist: productID } });
    res.status(200).json({
      status: 'success',
      message: 'Successfully removed from wishlist',
    });
  },

  payment: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.cart.length === 0) {
      return res.status(404).json({ message: 'Cart is empty' });
    }

    const line_items = user.cart.map((item) => {
      return {
        price_data: {
          currency: 'inr',
          product_data: {
            images: [item.product.image],
            name: item.product.title,
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      success_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel',
    });

    orderDetails = {
      userID,
      user,
      newOrder: {
        products: user.cart.map((item) => new mongoose.Types.ObjectId(item.product._id)),
        order_id: Date.now(),
        payment_id: session.id,
        total_amount: session.amount_total / 100,
      },
    };

    res.status(200).json({
      status: 'success',
      message: 'Stripe Checkout session created',
      sessionId: session.id,
      url: session.url,
    });
  },

  success: async (req, res) => {
    const { userID, user, newOrder } = orderDetails;

    if (newOrder) {
      const order = await Order.create({ ...newOrder });
      await User.findByIdAndUpdate(userID, { $push: { orders: order._id } });
      orderDetails.newOrder = null;
    }
    user.cart = [];
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment was successful',
    });
  },

  cancel: async (req, res) => {
    res.status(200).json({
      status: 'failure',
      message: 'Payment was cancelled',
    });
  },

  showOrders: async (req, res) => {
    const userID = req.params.id;
    const user = await User.findById(userID).populate('orders');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userOrders = user.orders;
    if (userOrders.length === 0) {
      return res.status(404).json({ message: 'You have no orders' });
    }

    const orderDetails = await Order.find({ _id: { $in: userOrders } }).populate('products');

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched order details.',
      data: orderDetails,
    });
  },

  getUserMembership: async (req, res) => {
    const userId = req.params.id;
    
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if membership has expired
      if (user.membership.status === 'active' && user.membership.endDate < new Date()) {
        user.membership.status = 'expired';
        await user.save();
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Membership fetched successfully',
        data: {
          membership: user.membership
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'failure',
        message: 'Error fetching membership',
        error: error.message
      });
    }
  },

  getMembership: async (req, res) => {
    try {
      console.log("\n=== Get Membership ===");
      const userId = req.params.id;
      console.log("Requested user ID:", userId);
      console.log("Authenticated user ID:", req.user._id);
      
      // Check if the authenticated user is requesting their own data
      if (req.user._id.toString() !== userId) {
        console.log("User ID mismatch");
        return res.status(403).json({
          status: 'failure',
          message: 'Unauthorized to access this user\'s data'
        });
      }

      // Find user by ID
      console.log("Looking up user");
      const user = await User.findById(userId);
      
      if (!user) {
        console.log("User not found");
        return res.status(404).json({
          status: 'failure',
          message: 'User not found'
        });
      }

      console.log("User found, returning membership data");
      console.log("Membership:", user.membership);
      
      res.status(200).json({
        status: 'success',
        data: {
          membership: user.membership
        }
      });
    } catch (error) {
      console.error('Get membership error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error getting membership',
        error: error.message
      });
    }
  },

  getFavorites: async (req, res) => {
    try {
      console.log("\n=== Get Favorites ===");
      const userId = req.params.id;
      console.log("Requested user ID:", userId);
      console.log("Authenticated user ID:", req.user._id);
      
      // Check if the authenticated user is requesting their own data
      if (req.user._id.toString() !== userId) {
        console.log("User ID mismatch");
        return res.status(403).json({
          status: 'failure',
          message: 'Unauthorized to access this user\'s data'
        });
      }

      // Find user by ID and populate favorite services
      console.log("Looking up user favorites");
      const user = await User.findById(userId).populate('favoriteServices');
      
      if (!user) {
        console.log("User not found");
        return res.status(404).json({
          status: 'failure',
          message: 'User not found'
        });
      }

      console.log("User found, returning favorites data");
      console.log("Favorites count:", user.favoriteServices.length);
      console.log("=== Get Favorites Success ===\n");
      
      res.status(200).json({
        status: 'success',
        count: user.favoriteServices.length,
        data: user.favoriteServices
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error getting favorites',
        error: error.message
      });
    }
  },

  addToFavorites: async (req, res) => {
    try {
      console.log("\n=== Add to Favorites ===");
      const userId = req.params.id;
      const { serviceId } = req.body;
      console.log("Requested user ID:", userId);
      console.log("Service ID:", serviceId);
      console.log("Authenticated user ID:", req.user._id);
      
      // Check if the authenticated user is updating their own data
      if (req.user._id.toString() !== userId) {
        console.log("User ID mismatch");
        return res.status(403).json({
          status: 'failure',
          message: 'Unauthorized to update this user\'s data'
        });
      }

      // Find user by ID
      console.log("Looking up user");
      const user = await User.findById(userId);
      
      if (!user) {
        console.log("User not found");
        return res.status(404).json({
          status: 'failure',
          message: 'User not found'
        });
      }

      // Check if service is already in favorites
      if (user.favoriteServices.includes(serviceId)) {
        console.log("Service already in favorites");
        return res.status(400).json({
          status: 'failure',
          message: 'Service already in favorites'
        });
      }

      // Add to favorites
      user.favoriteServices.push(serviceId);
      await user.save();
      console.log("Service added to favorites");
      console.log("=== Add to Favorites Success ===\n");

      res.status(200).json({
        status: 'success',
        message: 'Service added to favorites',
        data: {
          favoriteServices: user.favoriteServices
        }
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error adding to favorites',
        error: error.message
      });
    }
  },

  removeFromFavorites: async (req, res) => {
    try {
      console.log("\n=== Remove from Favorites ===");
      const userId = req.params.id;
      const serviceId = req.params.serviceId;
      console.log("Requested user ID:", userId);
      console.log("Service ID:", serviceId);
      console.log("Authenticated user ID:", req.user._id);
      
      // Check if the authenticated user is updating their own data
      if (req.user._id.toString() !== userId) {
        console.log("User ID mismatch");
        return res.status(403).json({
          status: 'failure',
          message: 'Unauthorized to update this user\'s data'
        });
      }

      // Find user by ID
      console.log("Looking up user");
      const user = await User.findById(userId);
      
      if (!user) {
        console.log("User not found");
        return res.status(404).json({
          status: 'failure',
          message: 'User not found'
        });
      }

      // Check if service is in favorites
      if (!user.favoriteServices.includes(serviceId)) {
        console.log("Service not in favorites");
        return res.status(400).json({
          status: 'failure',
          message: 'Service not in favorites'
        });
      }

      // Remove from favorites
      user.favoriteServices = user.favoriteServices.filter(id => id.toString() !== serviceId);
      await user.save();
      console.log("Service removed from favorites");
      console.log("=== Remove from Favorites Success ===\n");

      res.status(200).json({
        status: 'success',
        message: 'Service removed from favorites',
        data: {
          favoriteServices: user.favoriteServices
        }
      });
    } catch (error) {
      console.error('Remove from favorites error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error removing from favorites',
        error: error.message
      });
    }
  },

  updateMembership: async (req, res) => {
    try {
      console.log("\n=== Update Membership ===");
      const userId = req.params.id;
      const { status, type, startDate, endDate } = req.body;
      console.log("Requested user ID:", userId);
      console.log("Authenticated user ID:", req.user._id);
      
      // Check if the authenticated user is updating their own data
      if (req.user._id.toString() !== userId) {
        console.log("User ID mismatch");
        return res.status(403).json({
          status: 'failure',
          message: 'Unauthorized to update this user\'s data'
        });
      }

      // Find user by ID
      console.log("Looking up user");
      const user = await User.findById(userId);
      
      if (!user) {
        console.log("User not found");
        return res.status(404).json({
          status: 'failure',
          message: 'User not found'
        });
      }

      // Update membership
      user.membership = {
        status: status || user.membership.status,
        type: type || user.membership.type,
        startDate: startDate || user.membership.startDate,
        endDate: endDate || user.membership.endDate
      };
      await user.save();
      console.log("Membership updated");
      console.log("=== Update Membership Success ===\n");

      res.status(200).json({
        status: 'success',
        message: 'Membership updated',
        data: {
          membership: user.membership
        }
      });
    } catch (error) {
      console.error('Update membership error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error updating membership',
        error: error.message
      });
    }
  }
};

module.exports = userController;
