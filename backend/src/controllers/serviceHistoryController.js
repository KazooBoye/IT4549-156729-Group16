const pool = require('../config/db');

// Search members by code or name
exports.searchMembers = async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      `SELECT user_id, member_code, full_name FROM profiles WHERE member_code ILIKE $1 OR full_name ILIKE $1 LIMIT 10`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi tìm hội viên.' });
  }
};

// Add service usage history
exports.addServiceHistory = async (req, res) => {
  const { memberId, date, service, duration, note } = req.body;
  if (!memberId || !date || !service || !duration) {
    return res.status(400).json({ msg: 'Thiếu thông tin bắt buộc.' });
  }
  if (isNaN(duration) || duration < 5 || duration > 300) {
    return res.status(400).json({ msg: 'Thời lượng không hợp lệ.' });
  }
  try {
    await pool.query(
      `INSERT INTO workout_sessions (member_user_id, check_in_time, activity_type, notes) VALUES ($1, $2, $3, $4)`,
      [memberId, date, service, note || null]
    );
    res.json({ msg: 'Ghi nhận thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi ghi nhận lịch sử sử dụng dịch vụ.' });
  }
}; 