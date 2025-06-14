const jwt = require('jsonwebtoken');
const { User } = require('../models'); // <-- Use the Sequelize User model

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Use Sequelize to find the user
      req.user = await User.findByPk(decoded.user.id, {
        attributes: ['user_id', 'email', 'role'] // Exclude password_hash
      });

      if (!req.user) {
          return res.status(401).json({ msg: 'Not authorized, user not found' });
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ msg: `User role ${req.user ? req.user.role : 'guest'} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, authorize };