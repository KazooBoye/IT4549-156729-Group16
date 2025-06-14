// src/controllers/equipmentController.js
const { Equipment } = require('../models');

// Chức năng 1: Lấy toàn bộ danh sách thiết bị (Tương ứng bước 1 của use case)
// GET /api/equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await Equipment.findAll({
      order: [['equipment_name', 'ASC']], // Sắp xếp theo tên
    });
    res.json(equipmentList);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách thiết bị:", err);
    res.status(500).send('Lỗi Server');
  }
};

// Chức năng 2: Cập nhật tình trạng một thiết bị (Tương ứng bước 3 & 4 của use case)
// PUT /api/equipment/:id
exports.updateEquipment = async (req, res) => {
  const { status } = req.body; // Lấy trạng thái mới từ request
  const equipmentId = req.params.id; // Lấy ID thiết bị từ URL

  // Kiểm tra dữ liệu đầu vào
  const allowedStatus = ['operational', 'under_maintenance', 'broken'];
  if (!status || !allowedStatus.includes(status)) {
      return res.status(400).json({ msg: 'Vui lòng cung cấp trạng thái hợp lệ.' });
  }

  try {
    const item = await Equipment.findByPk(equipmentId);

    // Kiểm tra xem thiết bị có tồn tại không (Tương ứng luồng thay thế 2a)
    if (!item) {
      return res.status(404).json({ msg: 'Không tìm thấy thiết bị.' });
    }

    // Cập nhật trạng thái
    item.status = status;
    await item.save();

    // (Tùy chọn) Logic thông báo cho bộ phận bảo trì (Tương ứng luồng thay thế 3a)
    if (status === 'broken') {
        console.log(`THÔNG BÁO: Thiết bị ID ${item.equipment_id} (${item.equipment_name}) bị hỏng, cần xử lý.`);
    }

    res.json({ msg: 'Cập nhật trạng thái thiết bị thành công.', equipment: item });

  } catch (err) {
    console.error("Lỗi khi cập nhật thiết bị:", err);
    res.status(500).send('Lỗi Server');
  }
};