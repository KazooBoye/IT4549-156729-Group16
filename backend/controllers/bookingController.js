const pool = require('../config/db');

// Create a new personal training booking
exports.createBooking = async (req, res) => {
  const memberUserId = req.user.id; // From authMiddleware
  const {
    trainer_user_id,
    session_datetime,
    duration_minutes = 60, // Default duration
    notes_member,
    subscription_id = null // Optional: if booking is tied to a specific PT package subscription
  } = req.body;

  if (!trainer_user_id || !session_datetime) {
    return res.status(400).json({ msg: 'Trainer and session date/time are required.' });
  }

  try {
    // Optional: Check if trainer_user_id is actually a trainer
    const trainerCheck = await pool.query("SELECT role FROM users WHERE user_id = $1", [trainer_user_id]);
    if (trainerCheck.rows.length === 0 || trainerCheck.rows[0].role !== 'trainer') {
        return res.status(400).json({ msg: 'Invalid trainer selected.' });
    }

    // Optional: Check for trainer availability (complex, can be added later)

    const query = `
      INSERT INTO personal_training_bookings (
        member_user_id, trainer_user_id, session_datetime, duration_minutes,
        notes_member, subscription_id, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'scheduled')
      RETURNING *;
    `;
    const values = [
      memberUserId, trainer_user_id, session_datetime, duration_minutes,
      notes_member || null, subscription_id
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json({ msg: 'Booking created successfully', booking: rows[0] });
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.constraint === 'personal_training_bookings_trainer_user_id_fkey') {
        return res.status(400).json({ msg: 'Selected trainer does not exist.' });
    }
    res.status(500).json({ msg: 'Server error while creating booking.' });
  }
};

// Get bookings for the logged-in member
exports.getMemberBookings = async (req, res) => {
  const memberUserId = req.user.id; // From authMiddleware

  try {
    const query = `
      SELECT
        ptb.booking_id,
        ptb.session_datetime,
        ptb.duration_minutes,
        ptb.status,
        ptb.notes_member,
        ptb.notes_trainer,
        p_trainer.full_name AS trainer_name,
        u_trainer.email AS trainer_email
      FROM personal_training_bookings ptb
      JOIN users u_trainer ON ptb.trainer_user_id = u_trainer.user_id
      JOIN profiles p_trainer ON u_trainer.user_id = p_trainer.user_id
      WHERE ptb.member_user_id = $1
      ORDER BY ptb.session_datetime DESC;
    `;
    const { rows } = await pool.query(query, [memberUserId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching member bookings:', error);
    res.status(500).json({ msg: 'Server error while fetching bookings.' });
  }
};
