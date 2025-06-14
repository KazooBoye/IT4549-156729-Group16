require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const memberRoutes = require('./routes/memberRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const serviceHistoryRoutes = require('./routes/serviceHistoryRoutes');
// Import other routes here as they are created
// const userRoutes = require('./routes/userRoutes');
// const memberRoutes = require('./routes/memberRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Test DB connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Database connected successfully:', res.rows[0].now);
  }
});

// Routes
app.get('/', (req, res) => {
  res.send('Gym Management API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/service-history', serviceHistoryRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/members', memberRoutes);
// ... other routes

// Error Handling Middleware (should be last)
// const errorMiddleware = require('./middlewares/errorMiddleware');
// app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
