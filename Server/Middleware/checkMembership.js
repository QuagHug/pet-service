const { User } = require('../Models/userSchema');

const checkMembership = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        status: 'failure',
        message: 'User not found' 
      });
    }
    
    // Check if membership has expired
    if (user.membership.status === 'active' && user.membership.endDate < new Date()) {
      user.membership.status = 'expired';
      await user.save();
    }
    
    // Check if user has active membership
    if (user.membership.status !== 'active') {
      return res.status(403).json({
        status: 'failure',
        message: 'Premium membership required',
        requiresMembership: true
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      status: 'failure',
      message: 'Error checking membership',
      error: error.message
    });
  }
};

module.exports = checkMembership; 