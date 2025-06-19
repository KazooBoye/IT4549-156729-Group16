// paymentController.test.js
const { simulatePayment } = require('../controllers/paymentController');
const { MembershipPackage, MemberSubscription, sequelize } = require('../models');
const crypto = require('crypto');

jest.mock('../models');
jest.mock('crypto');

describe('Payment Controller - simulatePayment', () => {
  let req, res, t;

  beforeEach(() => {
    req = {
      body: {},
      user: { user_id: 123 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction = jest.fn().mockResolvedValue(t);
    crypto.randomUUID = jest.fn().mockReturnValue('uuid-1234');
    jest.clearAllMocks();
  });

  test('Thiếu packageId hoặc shouldSucceed trả lỗi 400', async () => {
    req.body = { packageId: undefined, shouldSucceed: undefined };
    await simulatePayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Missing packageId or shouldSucceed flag.' });
    expect(sequelize.transaction).not.toHaveBeenCalled();
  });

  test('Package không tồn tại trả lỗi 404 và rollback', async () => {
    req.body = { packageId: 1, shouldSucceed: true };
    MembershipPackage.findByPk.mockResolvedValue(null);
    await simulatePayment(req, res);
    expect(sequelize.transaction).toHaveBeenCalled();
    expect(t.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Package not found.' });
  });

  test('Thanh toán giả lập thành công trả 201 và commit', async () => {
    req.body = { packageId: 1, shouldSucceed: true };
    const fakePackage = { duration_days: 30 };
    MembershipPackage.findByPk.mockResolvedValue(fakePackage);
    const fakeSubscription = { subscription_id: 555 };
    MemberSubscription.create.mockResolvedValue(fakeSubscription);

    await simulatePayment(req, res);

    expect(sequelize.transaction).toHaveBeenCalled();
    expect(MemberSubscription.create).toHaveBeenCalledWith(expect.objectContaining({
      memberUserId: 123,
      packageId: 1,
      payment_status: 'completed',
      payment_method: 'simulated_card',
      transaction_id: expect.stringContaining('sim_'),
      notes: 'Simulated successful transaction.',
    }), { transaction: t });
    expect(t.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Simulated payment successful!',
      subscription: fakeSubscription,
    });
  });

  test('Thanh toán giả lập thất bại trả 402 và commit', async () => {
    req.body = { packageId: 1, shouldSucceed: false };
    const fakePackage = { duration_days: 30 };
    MembershipPackage.findByPk.mockResolvedValue(fakePackage);
    MemberSubscription.create.mockResolvedValue({ subscription_id: 777 });

    await simulatePayment(req, res);

    expect(sequelize.transaction).toHaveBeenCalled();
    expect(MemberSubscription.create).toHaveBeenCalledWith(expect.objectContaining({
      memberUserId: 123,
      packageId: 1,
      payment_status: 'failed',
      payment_method: 'simulated_card',
      transaction_id: expect.stringContaining('sim_fail_'),
      notes: 'Simulated payment failure: Insufficient funds.',
    }), { transaction: t });
    expect(t.commit).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(402);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Simulated payment failed. Please try again.',
    });
  });

  test('Lỗi server trả 500 và rollback', async () => {
    req.body = { packageId: 1, shouldSucceed: true };
    MembershipPackage.findByPk.mockRejectedValue(new Error('DB error'));
    await simulatePayment(req, res);
    expect(t.rollback).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server error during payment simulation.');
  });
});