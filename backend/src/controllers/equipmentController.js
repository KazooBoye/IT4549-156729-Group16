// File: src/controllers/equipmentController.js
const { Equipment } = require('../models');

/**
 * Chức năng: Lấy toàn bộ danh sách thiết bị
 * Tương ứng: Bước 1 của Use Case
 * Route: GET /api/equipment
 */
exports.getAllEquipment = async (req, res) => {
  try {
    const equipmentList = await Equipment.findAll({
      order: [['equipment_name', 'ASC']], // Sắp xếp theo tên A-Z
    });
    res.json(equipmentList);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách thiết bị:", err);
    res.status(500).send('Lỗi Server');
  }
};

/**
 * Chức năng: Cập nhật thông tin một thiết bị
 * Tương ứng: Bước 2, 3, 4 của Use Case
 * Route: PUT /api/equipment/:id
 */
exports.updateEquipment = async (req, res) => {
  const { status } = req.body;
  const equipmentId = req.params.id;

  const allowedStatus = ['operational', 'under_maintenance', 'broken'];
  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ msg: 'Vui lòng cung cấp trạng thái hợp lệ.' });
  }

  try {
    const item = await Equipment.findByPk(equipmentId);

    // Luồng thay thế 2a: Thiết bị không tồn tại
    if (!item) {
      return res.status(404).json({ msg: 'Không tìm thấy thiết bị.' });
    }

    // Cập nhật trạng thái
    item.status = status;
    await item.save();

    // Luồng thay thế 3a: Thông báo cho bộ phận bảo trì (mô phỏng bằng console.log)
    if (status === 'broken') {
      console.log(`THÔNG BÁO BẢO TRÌ: Thiết bị ID ${item.equipment_id} (${item.equipment_name}) bị hỏng.`);
    }

    res.json({ msg: 'Cập nhật trạng thái thành công.', equipment: item });

  } catch (err) {
    console.error("Lỗi khi cập nhật thiết bị:", err);
    res.status(500).send('Lỗi Server');
  }
};