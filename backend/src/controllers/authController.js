const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const emailService = require('../services/emailService'); // To be created

// Placeholder for password reset tokens storage (in a real app, use a DB table)
const passwordResetTokens = {};

// @desc    Register a new user
exports.registerUser = async (req, res) => {
  const { email, password, fullName, role } = req.body; // Get role from request body

  if (!email || !password || !fullName || !role) {
    return res.status(400).json({ msg: 'Please enter all required fields (email, password, fullName, role)' });
  }

  // Validate role
  const allowedRoles = ['member', 'staff', 'trainer', 'owner'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ msg: 'Invalid role specified.' });
  }

  try {
    // Check if user already exists
    let user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into database
    const newUser = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id, email, role',
      [email, passwordHash, role] // Use the provided role
    );
    
    // Insert profile (simplified)
    if (newUser.rows[0]) {
        await pool.query(
            'INSERT INTO profiles (user_id, full_name) VALUES ($1, $2)',
            [newUser.rows[0].user_id, fullName]
        );
    }


    // Create JWT token
    const payload = {
      user: {
        id: newUser.rows[0].user_id,
        role: newUser.rows[0].role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: newUser.rows[0].user_id,
            email: newUser.rows[0].email,
            role: newUser.rows[0].role,
            fullName: fullName
          },
          msg: 'User registered successfully'
        });
      }
    );
  } catch (err) {
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
    // Check for user
    const result = await pool.query('SELECT u.user_id, u.email, u.password_hash, u.role, p.full_name FROM users u LEFT JOIN profiles p ON u.user_id = p.user_id WHERE u.email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.user_id,
        role: user.role,
      },
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
            fullName: user.full_name
          },
          msg: 'Login successful'
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login');
  }
};

// @desc    Request password reset
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ msg: 'User with that email does not exist.' });
        }
        const user = userResult.rows[0];

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpiry = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

        // Store token (in a real app, use a DB table `password_reset_tokens`)
        // For now, using an in-memory object (not suitable for production)
        passwordResetTokens[hashedToken] = { userId: user.user_id, expires: tokenExpiry };
        
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`; // This URL would be for frontend

        // Send email (to be implemented with emailService)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset URL: ${resetUrl}`);
        // await emailService.sendPasswordResetEmail(email, resetUrl);

        res.json({ msg: 'Password reset instructions sent to your email.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Reset password
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

        await pool.query('UPDATE users SET password_hash = $1 WHERE user_id = $2', [passwordHash, tokenData.userId]);

        delete passwordResetTokens[hashedToken]; // Invalidate the token

        res.json({ msg: 'Password has been reset successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
