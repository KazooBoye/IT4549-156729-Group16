const { Service } = require('../models');

// @desc    Get all active services
// @route   GET /api/services
// @access  Public
exports.getActiveServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      order: [['service_name', 'ASC']],
    });
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).send('Server Error');
  }
};