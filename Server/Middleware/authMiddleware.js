const jwt = require('jsonwebtoken');
const { User } = require('../Models/userSchema');
const { JWT_SECRET } = require('../config/jwtConfig');

const authMiddleware = async (req, res, next) => {
  try {
    console.log("\n=== Auth Middleware ===");
    console.log("Path:", req.path);
    console.log("Method:", req.method);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    
    // Get token from header
    const authHeader = req.headers.authorization;
    console.log("Authorization header present:", !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("No Bearer token found");
      return res.status(401).json({
        status: 'failure',
        message: 'No token provided'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    console.log("Token extracted, first 10 chars:", token.substring(0, 10) + "...");
    
    // Verify token
    console.log("Verifying token with JWT_SECRET first 5 chars:", JWT_SECRET.substring(0, 5));
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("Token verified successfully");
      console.log("Decoded token:", decoded);
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        console.log("User not found");
        return res.status(401).json({
          status: 'failure',
          message: 'User not found'
        });
      }
      
      console.log("User found:", user.email);
      
      // Attach user to request
      req.user = user;
      console.log("User attached to request");
      console.log("=== Auth Middleware Success ===\n");
      
      // Proceed to next middleware
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      
      return res.status(401).json({
        status: 'failure',
        message: 'Invalid token: ' + jwtError.message
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    
    return res.status(401).json({
      status: 'failure',
      message: 'Authentication failed',
      error: error.message
    });
  }
};

module.exports = authMiddleware; 