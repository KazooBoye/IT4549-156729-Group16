const Equipment = require('../models/Equipment');

// Get all equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch equipment.' });
  }
};

// Update equipment status and note
exports.updateEquipmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  try {
    const equipment = await Equipment.findByPk(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found.' });
    }
    equipment.status = status;
    if (note !== undefined) equipment.note = note;
    equipment.updated_at = new Date();
    await equipment.save();
    res.json({ message: 'Cập nhật thành công', updated: equipment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update equipment.' });
  }
}; 