// File: src/controllers/settingsController.js
const { SystemSetting } = require('../models');
const { sequelize } = require('../models');

// @desc    Get all system settings
// @route   GET /api/settings
// @access  Private (Owner)
exports.getAllSettings = async (req, res) => {
  try {
    const settingsArray = await SystemSetting.findAll();
    // Convert the array of {key, value} pairs into a single object
    const settingsObject = settingsArray.reduce((obj, item) => {
        obj[item.setting_key] = item.setting_value;
        return obj;
    }, {});
    res.json(settingsObject);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).send('Server Error');
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Owner)
exports.updateSettings = async (req, res) => {
  const settingsToUpdate = req.body; // e.g., { gym_name: 'New Name', address: '...' }
  const t = await sequelize.transaction();

  try {
    // Loop through each key-value pair from the request and update it in the database
    for (const key in settingsToUpdate) {
      if (Object.hasOwnProperty.call(settingsToUpdate, key)) {
        await SystemSetting.update(
          { setting_value: settingsToUpdate[key] },
          { where: { setting_key: key }, transaction: t }
        );
      }
    }
    
    await t.commit();
    res.json({ msg: 'Cập nhật thông tin hệ thống thành công.' });
  } catch (err) {
    await t.rollback();
    console.error("Error updating settings:", err);
    res.status(500).send('Lỗi Server khi cập nhật.');
  }
};