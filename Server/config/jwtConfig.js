// Create a new file to store JWT configuration
require('dotenv').config();

// Use environment variable or fallback to a default
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

console.log("JWT_SECRET loaded, first 5 chars:", JWT_SECRET.substring(0, 5));

module.exports = {
  JWT_SECRET
}; 