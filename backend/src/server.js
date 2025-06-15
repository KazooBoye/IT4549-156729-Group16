require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 1. IMPORTANT: Remove the old `pool` and import the new `db` object from your models index.
// This single line loads sequelize, all models, and all associations.
const db = require('./models'); // Make sure this path is correct

// 2. Your route imports are correct, keep them.
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const memberRoutes = require('./routes/memberRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const serviceHistoryRoutes = require('./routes/serviceHistoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes'); 
const packageRoutes = require('./routes/packageRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const serviceRoutes = require('./routes/serviceRoutes'); // Import service routes
const trainerRoutes = require('./routes/trainerRoutes'); // Import trainer routes
const settingsRoutes = require('./routes/settingsRoutes');


const app = express();

// Middleware - This is correct, keep it.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 3. Your routes are correct, keep them.
app.get('/', (req, res) => {
  res.send('Gym Management API Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/service-history', serviceHistoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes); // Use service routes
app.use('/api/trainer', trainerRoutes); // Use trainer routes
app.use('/api/settings', settingsRoutes); // Use settings routes

const PORT = process.env.PORT || 5001; // Using 5001 as seen in previous logs

// 4. IMPORTANT: Replace the old `app.listen` with this new async startup function.
const startServer = async () => {
  try {
    // This replaces `pool.query('SELECT NOW()')`
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // This command makes sure your DB tables match your models.
    await db.sequelize.sync({ alter: true }); // Use { force: true } to drop and re-create tables
    console.log('All models were synchronized successfully.');

    // Start listening for requests ONLY after the database is ready.
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
    process.exit(1); // Exit if DB connection fails
  }
};

// Execute the startup function
startServer();