const pool = require('../config/db');

// Get all feedback with member info
exports.getAllFeedback = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT f.feedback_id, p.member_code, p.full_name, f.created_at, f.feedback_type, f.comments, f.status, f.resolution_notes
      FROM feedback f
      JOIN profiles p ON f.member_user_id = p.user_id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi lấy danh sách phản hồi.' });
  }
};

// Update feedback (status, resolution_notes)
exports.updateFeedback = async (req, res) => {
  const { id } = req.params;
  const { status, resolution_notes } = req.body;
  if (!status || !resolution_notes) {
    return res.status(400).json({ msg: 'Thiếu trạng thái hoặc nội dung xử lý.' });
  }
  try {
    await pool.query(
      'UPDATE feedback SET status = $1, resolution_notes = $2, updated_at = NOW() WHERE feedback_id = $3',
      [status, resolution_notes, id]
    );
    res.json({ msg: 'Cập nhật phản hồi thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi cập nhật phản hồi.' });
  }
}; 