const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from the token payload (excluding password)
      const userResult = await pool.query('SELECT user_id, email, role FROM users WHERE user_id = $1', [decoded.user.id]);
      if (userResult.rows.length === 0) {
          return res.status(401).json({ msg: 'Not authorized, user not found' });
      }
      req.user = userResult.rows[0];
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
