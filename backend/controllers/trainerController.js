const pool = require('../config/db');

// Helper function to format duration
const formatDuration = (checkIn, checkOut) => {
  if (!checkOut) return 'Ongoing';
  const durationMs = new Date(checkOut) - new Date(checkIn);
  const minutes = Math.floor(durationMs / 60000);
  if (minutes < 60) {
    return `${minutes} phút`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} giờ ${remainingMinutes > 0 ? `${remainingMinutes} phút` : ''}`.trim();
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};


// Get members associated with the logged-in trainer
// This is a simplified version. A more robust solution might involve a dedicated trainer_member_assignments table.
exports.getTrainerMembers = async (req, res) => {
  const trainerId = req.user.id; // Assuming authMiddleware adds user to req
  try {
    // Fetches members for whom the trainer has recorded sessions or has PT bookings
    // This query can be adjusted based on how trainers are "assigned" to members
    const query = `
      SELECT DISTINCT u.user_id, p.full_name, u.email
      FROM users u
      JOIN profiles p ON u.user_id = p.user_id
      WHERE u.role = 'member' AND (
        u.user_id IN (SELECT DISTINCT member_user_id FROM workout_sessions WHERE recorded_by_user_id = $1)
        OR
        u.user_id IN (SELECT DISTINCT member_user_id FROM personal_training_bookings WHERE trainer_user_id = $1)
      )
      ORDER BY p.full_name;
    `;
    const { rows } = await pool.query(query, [trainerId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching trainer members:', error);
    res.status(500).json({ msg: 'Server error while fetching members' });
  }
};

// Get training history for a specific member (for trainer's view)
exports.getMemberTrainingHistoryForTrainer = async (req, res) => {
  const memberUserId = req.params.memberId;
  // const trainerId = req.user.id; // Can be used for authorization checks

  try {
    // Add authorization check here if needed: ensure trainer is allowed to see this member's history
    const query = `
      SELECT
        ws.session_id,
        ws.check_in_time,
        ws.check_out_time,
        ws.session_name,
        ws.activity_type AS session_type,
        mp.package_name,
        tp.full_name AS trainer_name, -- This will be the current trainer or another if they co-train
        ws.completion_percentage,
        ws.trainer_notes_on_completion,
        ws.recorded_by_user_id
      FROM workout_sessions ws
      LEFT JOIN member_subscriptions ms ON ws.subscription_id = ms.subscription_id
      LEFT JOIN membership_packages mp ON ms.package_id = mp.package_id
      LEFT JOIN users t_user ON ws.recorded_by_user_id = t_user.user_id
      LEFT JOIN profiles tp ON t_user.user_id = tp.user_id
      WHERE ws.member_user_id = $1
      ORDER BY ws.check_in_time DESC;
    `;
    const { rows } = await pool.query(query, [memberUserId]);

    const history = rows.map(row => ({
      id: row.session_id,
      session_date: formatDate(row.check_in_time),
      session_name: row.session_name || 'N/A',
      session_type: row.session_type || 'N/A',
      duration: formatDuration(row.check_in_time, row.check_out_time),
      package_name: row.package_name || 'N/A',
      trainer_name: row.trainer_name || 'N/A',
      completion_percentage: row.completion_percentage,
      trainer_notes_on_completion: row.trainer_notes_on_completion,
      recorded_by_user_id: row.recorded_by_user_id
    }));
    res.json({ history });
  } catch (error) {
    console.error('Error fetching member training history for trainer:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Add a workout session for a member
exports.addWorkoutSession = async (req, res) => {
  const trainerId = req.user.id;
  const {
    member_user_id,
    session_name,
    activity_type,
    check_in_time,
    check_out_time, // Can be null if session is ongoing or not tracked
    completion_percentage,
    trainer_notes_on_completion,
    subscription_id // Optional
  } = req.body;

  if (!member_user_id || !session_name || !activity_type || !check_in_time) {
    return res.status(400).json({ msg: 'Please provide all required session details.' });
  }

  try {
    const query = `
      INSERT INTO workout_sessions (
        member_user_id, session_name, activity_type, check_in_time, check_out_time,
        completion_percentage, trainer_notes_on_completion, recorded_by_user_id, subscription_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const values = [
      member_user_id, session_name, activity_type, check_in_time, check_out_time || null,
      completion_percentage || null, trainer_notes_on_completion || null, trainerId, subscription_id || null
    ];
    const { rows } = await pool.query(query, values);
    res.status(201).json({ msg: 'Workout session added successfully', session: rows[0] });
  } catch (error) {
    console.error('Error adding workout session:', error);
    res.status(500).json({ msg: 'Server error while adding session' });
  }
};

// Update a workout session
exports.updateWorkoutSession = async (req, res) => {
  const trainerId = req.user.id;
  const sessionId = req.params.sessionId;
  const {
    session_name,
    activity_type,
    check_in_time,
    check_out_time,
    completion_percentage,
    trainer_notes_on_completion,
    subscription_id
  } = req.body;

  try {
    // First, verify the session exists and was recorded by this trainer (or other auth logic)
    const checkQuery = 'SELECT recorded_by_user_id FROM workout_sessions WHERE session_id = $1';
    const checkResult = await pool.query(checkQuery, [sessionId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Session not found.' });
    }
    // Optional: Stricter check if only the original recorder can edit.
    // if (checkResult.rows[0].recorded_by_user_id !== trainerId) {
    //   return res.status(403).json({ msg: 'Not authorized to update this session.' });
    // }

    const query = `
      UPDATE workout_sessions
      SET
        session_name = COALESCE($1, session_name),
        activity_type = COALESCE($2, activity_type),
        check_in_time = COALESCE($3, check_in_time),
        check_out_time = $4, -- Allows setting to null
        completion_percentage = $5, -- Allows setting to null
        trainer_notes_on_completion = $6, -- Allows setting to null
        subscription_id = $7, -- Allows setting to null
        updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $8 AND member_user_id = $9 -- Ensure it's for the correct member if member_user_id is passed
      RETURNING *;
    `;
    // member_user_id from req.body might be needed if you allow changing it, or for an extra check.
    // For simplicity, assuming member_user_id is not changed here.
    // If member_user_id is part of the update, ensure it's in the SET clause and WHERE clause.
    const memberUserIdFromBody = req.body.member_user_id; // Assuming it's passed for safety

    const values = [
      session_name, activity_type, check_in_time, check_out_time,
      completion_percentage, trainer_notes_on_completion, subscription_id,
      sessionId, memberUserIdFromBody
    ];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
        // This could happen if session_id is valid but member_user_id doesn't match,
        // or if the session_id was for a different member than intended.
        return res.status(404).json({ msg: 'Session not found for the specified member or update failed.' });
    }

    res.json({ msg: 'Workout session updated successfully', session: rows[0] });
  } catch (error) {
    console.error('Error updating workout session:', error);
    res.status(500).json({ msg: 'Server error while updating session' });
  }
};
