// File: src/controllers/serviceHistoryController.js
const { ServiceHistory, User, Profile } = require('../models');

// Chức năng: Ghi nhận một lần sử dụng dịch vụ mới
// Route: POST /api/service-history
exports.createServiceHistory = async (req, res) => {
  const { memberId, serviceDate, serviceId, durationMinutes, notes } = req.body; // Đổi serviceType thành serviceId
  const staffId = req.user.user_id;

  if (!memberId || !serviceDate || !serviceId) { // Đổi serviceType thành serviceId
    return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
  }

  try {
    const newHistory = await ServiceHistory.create({
      memberUserId: memberId,
      recordedByStaffId: staffId,
      serviceDate,
      serviceId: serviceId,  // Đổi serviceType thành serviceId
      durationMinutes: durationMinutes || null,
      notes: notes || null,
    });

    res.status(201).json({ msg: 'Ghi nhận lịch sử thành công.', data: newHistory });
  } catch (err) {
    console.error("Lỗi khi ghi nhận lịch sử:", err);
    // Luồng thay thế 6a: Lỗi định dạng dữ liệu
    if (err.name === 'SequelizeDatabaseError') {
        return res.status(400).json({ msg: 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.'});
    }
    res.status(500).send('Lỗi Server');
  }
};

// Chức năng: Lấy lịch sử của một hội viên cụ thể
// Route: GET /api/service-history/:memberId
exports.getHistoryForMember = async (req, res) => {
    // ... có thể xây dựng hàm này sau để xem lại lịch sử
};