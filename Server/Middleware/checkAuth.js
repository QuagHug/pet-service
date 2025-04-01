const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwtConfig');

const checkAuth = () => {
  return async (req, res, next) => {
    try {
      console.log("\n=== CheckAuth Middleware Start ===");
      console.log("Request path:", req.path);
      console.log("Request method:", req.method);
      console.log("Authorization header:", req.headers.authorization);
      
      if (!req.headers.authorization) {
        console.log("No authorization header found");
        return res.status(401).json({ message: 'No authorization header' });
      }

      if (!req.headers.authorization.startsWith('Bearer ')) {
        console.log("Invalid authorization format");
        return res.status(401).json({ message: 'Invalid authorization format' });
      }

      const accessToken = req.headers.authorization.split(' ')[1];
      console.log("Extracted token:", accessToken);

      try {
        console.log("Attempting to verify token with JWT_SECRET");
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        console.log("Token decoded successfully:", decoded);
        
        req.user = decoded;
        console.log("User attached to request:", req.user);
        console.log("=== CheckAuth Middleware Success ===\n");
        next();
      } catch (jwtError) {
        console.error("JWT verification failed:", jwtError.message);
        return res.status(401).json({ 
          message: 'Token verification failed',
          error: jwtError.message 
        });
      }
    } catch (error) {
      console.error("CheckAuth middleware error:", error);
      res.status(401).json({ 
        message: 'Authentication failed',
        error: error.message 
      });
    }
  };
};

module.exports = checkAuth;
