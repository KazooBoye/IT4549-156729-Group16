const { MembershipPackage, MemberSubscription, sequelize } = require('../models');
const crypto = require('crypto');

// The function MUST be named exactly 'simulatePayment' and attached to 'exports'
exports.simulatePayment = async (req, res) => {
  const { packageId, shouldSucceed } = req.body;
  const userId = req.user.user_id; // From your auth middleware

  if (packageId === undefined || shouldSucceed === undefined) {
    return res.status(400).json({ msg: 'Missing packageId or shouldSucceed flag.' });
  }

  const t = await sequelize.transaction();

  try {
    const packageToBuy = await MembershipPackage.findByPk(packageId);
    if (!packageToBuy) {
      await t.rollback(); // Rollback if package not found
      return res.status(404).json({ msg: 'Package not found.' });
    }

    if (shouldSucceed) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + packageToBuy.duration_days);

      const newSubscription = await MemberSubscription.create({
        memberUserId: userId,
        packageId: packageId,
        start_date: startDate,
        end_date: endDate,
        payment_status: 'completed',
        payment_method: 'simulated_card',
        transaction_id: `sim_${crypto.randomUUID()}`,
        notes: 'Simulated successful transaction.',
      }, { transaction: t });

      await t.commit();
      return res.status(201).json({
        msg: 'Simulated payment successful!',
        subscription: newSubscription,
      });
    } else {
      await MemberSubscription.create({
        memberUserId: userId,
        packageId: packageId,
        payment_status: 'failed',
        payment_method: 'simulated_card',
        transaction_id: `sim_fail_${crypto.randomUUID()}`,
        notes: 'Simulated payment failure: Insufficient funds.',
      }, { transaction: t });

      await t.commit();
      return res.status(402).json({
        msg: 'Simulated payment failed. Please try again.',
      });
    }
  } catch (err) {
    await t.rollback();
    console.error("Error in simulatePayment:", err);
    res.status(500).send('Server error during payment simulation.');
  }
};