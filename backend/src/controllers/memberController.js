const { User, Profile, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// @desc    Register a new member (by a staff member)
// @route   POST /api/members/register
// @access  Private (Staff/Owner only)
exports.registerMember = async (req, res) => {
  // Get data from the form submitted by the staff
  const { fullName, dateOfBirth, phoneNumber, email } = req.body;

  if (!fullName || !phoneNumber) {
    return res.status(400).json({ msg: 'Full name and phone number are required.' });
  }

  // Use a transaction to ensure both user and profile are created or neither are.
  const t = await sequelize.transaction();

  try {
    // A simple way to generate a unique username and a random password.
    // The phone number is often unique.
    const username = `user${phoneNumber.slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
    const temporaryPassword = crypto.randomBytes(4).toString('hex'); // e.g., 'a4f2c1b8'
    
    // In a real app, the email would be the primary login, but here we use a generated one if not provided.
    const userEmail = email || `${username}@gym.local`;

    // Check if a user with this email or phone number already exists
    const existingUser = await User.findOne({
      where: { email: userEmail }
    });
    // You should also add a check for phone number in the profiles table if it must be unique.
    
    if (existingUser) {
        await t.rollback();
        return res.status(400).json({ msg: 'A user with this email already exists.' });
    }

    // Hash the temporary password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    // Create the user record with role 'member'
    const newUser = await User.create({
      email: userEmail,
      password_hash: passwordHash,
      role: 'member',
    }, { transaction: t });

    // Create the profile record
    await Profile.create({
      user_id: newUser.user_id,
      full_name: fullName,
      phone_number: phoneNumber,
      date_of_birth: dateOfBirth || null,
    }, { transaction: t });

    // Commit the transaction
    await t.commit();

    // Return the new user's details AND their temporary password to the staff member
    res.status(201).json({
      msg: 'Member registered successfully.',
      member: {
        userId: newUser.user_id,
        fullName: fullName,
        email: userEmail,
        loginUsername: userEmail, // Or the generated username
        temporaryPassword: temporaryPassword // This is crucial for the staff to give to the member
      }
    });

  } catch (err) {
    await t.rollback();
    console.error("Error registering member:", err);
    // Check for specific validation errors (like unique constraint)
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ msg: 'A user with these details already exists.' });
    }
    res.status(500).send('Server error when registering member.');
  }
};