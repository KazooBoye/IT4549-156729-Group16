const { User, Profile } = require('../models');

// @desc    Get all users with the role 'trainer'
// @route   GET /api/users/trainers
// @access  Private
exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await User.findAll({
      where: { role: 'trainer' },
      // Include the Profile to get the trainer's full name
      include: [{
        model: Profile,
        as: 'Profile', // Use the alias defined in the association
        attributes: ['full_name'],
        required: true // Ensures only trainers with profiles are returned
      }],
      attributes: ['user_id'], // We only need the ID from the User table
      order: [[Profile, 'full_name', 'ASC']] // Order by the included model's column
    });

    // The result from Sequelize is nested, so we format it for the frontend.
    const formattedTrainers = trainers.map(t => ({
      user_id: t.user_id,
      full_name: t.Profile.full_name
    }));

    res.json(formattedTrainers);
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ msg: 'Server error while fetching trainers' });
  }
};