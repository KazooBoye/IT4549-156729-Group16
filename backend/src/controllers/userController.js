const { User, Profile } = require('../models');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { PersonalTrainingBooking } = require('../models');

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

exports.getAllUsers = async (req, res) => {
    try {
        // Find all users and include their associated profile
        const users = await User.findAll({
            include: [{
                model: Profile,
                as: 'Profile', // Use the alias defined in your models/index.js
                attributes: ['full_name'], // We only need the name from the profile
                required: false // Use a LEFT JOIN in case a user doesn't have a profile yet
            }],
            // Select only the columns we need from the 'users' table
            attributes: ['user_id', 'email', 'role', 'created_at'],
            // Order by the most recently created users first
            order: [['created_at', 'DESC']]
        });
        
        // Send the list of users back as a JSON response
        res.json(users);

    } catch (err) {
        console.error("Error fetching all users:", err);
        res.status(500).send('Server Error');
    }
};

exports.createUser = async (req, res) => {
    const { fullName, email, password, role, phoneNumber } = req.body;

    if (!fullName || !email || !password || !role) {
        return res.status(400).json({ msg: 'Please provide full name, email, password, and role.' });
    }
    const t = await sequelize.transaction();
    try {
        // Check for existing user first
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            // No need to rollback, just throw an error to be caught
            throw new Error('User with this email already exists.');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({ email, password_hash: passwordHash, role }, { transaction: t });
        
        await Profile.create({
            user_id: newUser.user_id,
            full_name: fullName,
            phone_number: phoneNumber || null
        }, { transaction: t });
        
        await t.commit();
        res.status(201).json({ msg: 'User created successfully.', user: newUser });
    } catch (err) {
        await t.rollback();
        console.error("Error creating user:", err);
        // Send a more specific error message back to the frontend
        res.status(400).json({ msg: err.message || 'Server error during user creation.' });
    }
};

// @desc    Admin/Owner updates a user's info
// @route   PUT /api/users/:id
// @access  Private (Owner)
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const { fullName, email, role, phoneNumber } = req.body;
    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId, { transaction: t });
        if (!user) {
            await t.rollback();
            return res.status(404).json({ msg: 'User not found' });
        }
        const profile = await Profile.findOne({ where: { user_id: userId }, transaction: t });

        user.email = email || user.email;
        user.role = role || user.role;
        if(profile) {
            profile.full_name = fullName || profile.full_name;
            profile.phone_number = phoneNumber || profile.phone_number;
            await profile.save({ transaction: t });
        }
        await user.save({ transaction: t });
        
        await t.commit();
        res.json({ msg: 'User updated successfully.' });
    } catch (err) {
        await t.rollback();
        console.error("Error updating user:", err);
        res.status(500).send('Server Error');
    }
};

// @desc    Admin/Owner deletes a user
// @route   DELETE /api/users/:id
// @access  Private (Owner)
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(userId);
        if(!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        
        // This is a cascading delete. Deleting the user will also delete their profile,
        // subscriptions, etc., if the foreign keys in the DB are set up with ON DELETE CASCADE.
        await user.destroy({ transaction: t });

        await t.commit();
        res.json({ msg: 'User deleted successfully.' });
    } catch (err) {
        await t.rollback();
        console.error("Error deleting user:", err);
        res.status(500).send('Server Error');
    }
};

exports.resetUserPassword = async (req, res) => {
    const userId = req.params.id; // Get the user ID from the URL parameter

    try {
        // Find the user in the database
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        // Generate a new, secure, random password (e.g., 'a4f2c1b8')
        const newPassword = crypto.randomBytes(4).toString('hex');
        
        // Hash the new password before saving it
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        
        // Save the updated user record to the database
        await user.save();

        // IMPORTANT: Return the new password to the owner so they can provide it to the user.
        res.json({ 
            msg: 'Password reset successfully.', 
            newPassword: newPassword // Send the plain text password back in the response
        });

    } catch (err) {
        console.error("Error resetting password:", err);
        res.status(500).send('Server Error');
    }
};

// Add to userController.js
// @desc    Search for members by name or email
// @route   GET /api/users/search?q=...
// @access  Private (Trainer/Staff/Owner)
exports.searchMembers = async (req, res) => {
    const searchQuery = req.query.q || '';
    if (searchQuery.length < 2) {
        return res.json([]); // Don't search for very short strings
    }
    try {
        const members = await User.findAll({
            where: {
                role: 'member'
            },
            include: [{
                model: Profile,
                as: 'Profile',
                where: {
                    full_name: {
                        [Op.iLike]: `%${searchQuery}%` // Case-insensitive search
                    }
                },
                required: true
            }],
            limit: 10 // Limit results to prevent overload
        });
        res.json(members);
    } catch (err) {
        console.error("Error searching members:", err);
        res.status(500).send('Server Error');
    }
};

exports.getUnassignedMembers = async (req, res) => {
    try {
        // 1. Find all member IDs that already have a booking
        const assignedMemberIds = (await PersonalTrainingBooking.findAll({
            attributes: ['memberUserId'],
            group: ['memberUserId']
        })).map(booking => booking.memberUserId);

        // 2. Find all users with the role 'member' whose IDs are NOT in the assigned list
        const unassignedMembers = await User.findAll({
            where: {
                role: 'member',
                user_id: { [Op.notIn]: assignedMemberIds } // The key logic is here
            },
            include: [{
                model: Profile,
                as: 'Profile',
                attributes: ['full_name'],
                required: true
            }],
            attributes: ['user_id', 'email']
        });

        res.json(unassignedMembers);
    } catch (err) {
        console.error("Error fetching unassigned members:", err);
        res.status(500).send('Server Error');
    }
};