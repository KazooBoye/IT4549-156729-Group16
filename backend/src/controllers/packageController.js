// src/controllers/packageController.js
const { MembershipPackage } = require('../models');

exports.getActivePackages = async (req, res) => {
  try {
    const packages = await MembershipPackage.findAll({
      where: { is_active: true },
      order: [['price', 'ASC']],
    });
    res.json(packages);
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).send('Server Error');
  }
};