const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Profile, sequelize } = require('../models');

// In a production app, this should be a database table (e.g., PasswordResetTokens)
const passwordResetTokens = {};

// @desc    Register a new user
exports.registerUser = async (req, res) => {
  const { email, password, fullName, role } = req.body;

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  const allowedRoles = ['member', 'staff', 'trainer', 'owner'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role specified.' });
  }

  const t = await sequelize.transaction();

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password_hash: passwordHash,
      role,
    }, { transaction: t });

    await Profile.create({
      user_id: newUser.user_id,
      full_name: fullName,
    }, { transaction: t });

    await t.commit();

    const payload = {
      user: { id: newUser.user_id, role: newUser.role },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: newUser.user_id,
            email: newUser.email,
            role: newUser.role,
            fullName: fullName,
          },
          msg: 'User registered successfully',
        });
      }
    );
  } catch (err) {
    await t.rollback();
    console.error(err.message);
    res.status(500).send('Server error during registration');
  }
};

// @desc    Authenticate user & get token
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Profile,
        as: 'Profile', // <-- ADD THIS LINE
        attributes: ['full_name']
      }]
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: { id: user.user_id, role: user.role },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.user_id,
            email: user.email,
            role: user.role,
            fullName: user.Profile ? user.Profile.full_name : null,
          },
          msg: 'Login successful',
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login');
  }
};

// @desc    Request password reset [FIXED]
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // Use Sequelize to find the user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Note: Don't reveal if a user exists for security reasons.
            // Send a generic success message regardless.
            return res.json({ msg: 'If a user with that email exists, password reset instructions have been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        passwordResetTokens[hashedToken] = { userId: user.user_id, expires: tokenExpiry };
        
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset URL: ${resetUrl}`);
        // await emailService.sendPasswordResetEmail(email, resetUrl);

        res.json({ msg: 'If a user with that email exists, password reset instructions have been sent.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Reset password [FIXED]
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenData = passwordResetTokens[hashedToken];

    if (!tokenData || tokenData.expires < Date.now()) {
        return res.status(400).json({ msg: 'Token is invalid or has expired.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Use Sequelize to update the user's password
        await User.update(
            { password_hash: passwordHash },
            { where: { user_id: tokenData.userId } }
        );

        delete passwordResetTokens[hashedToken];

        res.json({ msg: 'Password has been reset successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};