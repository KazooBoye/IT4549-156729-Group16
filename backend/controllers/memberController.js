const pool = require('../config/db'); // Assuming you have a db.js for pool connection

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
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

exports.getTrainingHistory = async (req, res) => {
  const memberUserId = req.user.id; // Assuming authMiddleware adds user to req

  try {
    const query = `
      SELECT
        ws.session_id,
        ws.check_in_time,
        ws.check_out_time,
        ws.session_name,
        ws.activity_type AS session_type,
        mp.package_name,
        tp.full_name AS trainer_name,
        ws.completion_percentage,
        ws.trainer_notes_on_completion
      FROM workout_sessions ws
      LEFT JOIN member_subscriptions ms ON ws.subscription_id = ms.subscription_id
      LEFT JOIN membership_packages mp ON ms.package_id = mp.package_id
      LEFT JOIN users t_user ON ws.recorded_by_user_id = t_user.user_id AND t_user.role = 'trainer'
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
      trainer_notes_on_completion: row.trainer_notes_on_completion
    }));

    res.json({ history });
  } catch (error) {
    console.error('Error fetching training history:', error);
    res.status(500).json({ msg: 'Server error while fetching training history' });
  }
};
