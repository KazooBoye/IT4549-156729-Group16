// ... existing imports ...
const express = require('express');
const cors = require('cors');
// ... other imports ...

// Import routes
const authRoutes = require('./routes/authRoutes'); // Example
const memberRoutes = require('./routes/memberRoutes'); // New member routes
const trainerRoutes = require('./routes/trainerRoutes'); // Import trainer routes
const userRoutes = require('./routes/userRoutes'); // Add this
const bookingRoutes = require('./routes/bookingRoutes'); // Add this
const serviceRoutes = require('./routes/serviceRoutes'); // Import service routes
const equipmentRoutes = require('./routes/equipmentRoutes'); // Import equipment routes
// ... other route imports ...

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// ... other middleware ...

// Define Routes
app.use('/api/auth', authRoutes); // Example
app.use('/api/members', memberRoutes); // Use member routes
app.use('/api/trainer', trainerRoutes); // Use trainer routes
app.use('/api/users', userRoutes); // Add this
app.use('/api/bookings', bookingRoutes); // Add this
app.use('/api/services', serviceRoutes); // Use service routes
// ... other app.use('/api/...') ...

// ... existing server setup (PORT, app.listen) ...
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Make sure you have a db.js in a config folder like backend/config/db.js
// Example backend/config/db.js:
/*
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // or individual connection params
});

module.exports = pool;
*/

// Make sure you have an authMiddleware.js in a middleware folder like backend/middleware/authMiddleware.js
// Example backend/middleware/authMiddleware.js:
/*
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token'); // Or from Authorization Bearer token

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Assuming your JWT payload has a user object with id
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
*/
