const { User, Profile, MemberSubscription, MembershipPackage, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

exports.registerMember = async (req, res) => {
  const { fullName, dateOfBirth, phoneNumber, email, initialPackageId } = req.body;

  if (!fullName || !phoneNumber || !initialPackageId) {
    return res.status(400).json({ msg: 'Full name, phone number, and an initial package are required.' });
  }

  const t = await sequelize.transaction();

  try {
    const initialPackage = await MembershipPackage.findByPk(initialPackageId, { transaction: t });
    if (!initialPackage) {
      throw new Error('The selected initial package does not exist.');
    }

    const existingProfile = await Profile.findOne({ where: { phone_number: phoneNumber }, transaction: t });
    if (existingProfile) {
      throw new Error('A member with this phone number already exists.');
    }

    const userEmail = email || `${phoneNumber}@gym.local`;
    if (email) {
      const existingUser = await User.findOne({ where: { email: userEmail }, transaction: t });
      if (existingUser) {
        throw new Error('This email address is already in use.');
      }
    }

    const temporaryPassword = crypto.randomBytes(4).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    const newUser = await User.create({
      email: userEmail,
      password_hash: passwordHash,
      role: 'member',
    }, { transaction: t });

    await Profile.create({
      user_id: newUser.user_id,
      full_name: fullName,
      phone_number: phoneNumber,
      date_of_birth: dateOfBirth || null,
    }, { transaction: t });

    // --- LOGIC CORRECTION IS HERE ---
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + initialPackage.duration_days);

    // Check the package type to determine session counts
    let totalSessions = 0;
    if (initialPackage.type === 'session-based') {
      // Use the new session_count column, provide 0 as a fallback
      totalSessions = initialPackage.session_count || 0;
    }
    // For 'time-based' packages, totalSessions will remain 0.

    await MemberSubscription.create({
      memberUserId: newUser.user_id,
      packageId: initialPackageId,
      start_date: startDate,
      end_date: endDate,
      sessions_total: totalSessions, // Set the correct total sessions
      sessions_remaining: totalSessions, // Set the correct remaining sessions
      payment_status: 'completed',
      payment_method: 'in-person',
      transaction_id: `reg_${require('crypto').randomUUID()}`,
      notes: 'Initial subscription upon registration by staff.',
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      msg: 'Member registered and subscription activated successfully.',
      member: {
        userId: newUser.user_id,
        fullName: fullName,
        email: userEmail,
        loginUsername: userEmail,
        temporaryPassword: temporaryPassword,
      },
    });
  } catch (err) {
    await t.rollback();
    console.error("TRANSACTION FAILED:", err.message);
    res.status(400).json({ msg: err.message || 'Server error when registering member.' });
  }
};

// @desc    Extend a member's subscription
// @route   POST /api/members/extend-subscription
// @access  Private (Staff/Owner only)
exports.extendSubscription = async (req, res) => {
  const { memberId, newPackageId } = req.body;

  if (!memberId || !newPackageId) {
    return res.status(400).json({ msg: 'Member User ID and New Package ID are required.' });
  }

  const t = await sequelize.transaction();

  try {
    // 1. Find the new package being purchased to get its details.
    const newPackage = await MembershipPackage.findByPk(newPackageId, { transaction: t });
    if (!newPackage) {
      throw new Error('The selected new package does not exist.');
    }

    // 2. Find the member's most recent subscription to determine their current end date.
    const latestSubscription = await MemberSubscription.findOne({
      where: { memberUserId: memberId },
      order: [['end_date', 'DESC']], // Get the one that ends last
      transaction: t
    });

    // 3. Determine the start date for the new subscription.
    let newStartDate = new Date(); // Default to today
    if (latestSubscription && new Date(latestSubscription.end_date) > newStartDate) {
      // If the current subscription is still active, the new one starts the day after it ends.
      newStartDate = new Date(latestSubscription.end_date);
      newStartDate.setDate(newStartDate.getDate() + 1);
    }

    // 4. Calculate the end date based on the new package's duration.
    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + newPackage.duration_days);

    // 5. Determine the session counts based on the package type.
    let totalSessions = 0;
    if (newPackage.type === 'session-based') {
      totalSessions = newPackage.session_count || 0;
    }
    
    // 6. Create the new subscription record in the database.
    const newSubscription = await MemberSubscription.create({
      memberUserId: memberId,
      packageId: newPackageId,
      start_date: newStartDate,
      end_date: newEndDate,
      sessions_total: totalSessions,
      sessions_remaining: totalSessions,
      payment_status: 'completed',
      payment_method: 'in-person-extension',
      transaction_id: `ext_${require('crypto').randomUUID()}`,
      notes: `Subscription extended by staff.`,
    }, { transaction: t });

    // If everything succeeds, commit the transaction.
    await t.commit();

    // Send a success response back to the frontend.
    res.status(201).json({
      msg: 'Subscription extended successfully.',
      newSubscription: newSubscription,
    });

  } catch (err) {
    // If any step fails, roll back all database changes.
    await t.rollback();
    console.error("TRANSACTION FAILED:", err.message);
    res.status(400).json({ msg: err.message || 'Server error while extending subscription.' });
  }
};