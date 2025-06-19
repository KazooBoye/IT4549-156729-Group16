// memberController.test.js
const {
  registerMember,
  extendSubscription,
  getMyWorkoutHistory
} = require('../controllers/memberController');

const {
  User,
  Profile,
  MemberSubscription,
  MembershipPackage,
  sequelize,
  WorkoutSession
} = require('../models');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

jest.mock('../models');
jest.mock('bcryptjs');
jest.mock('crypto');

describe('Member Controller', () => {
  let req, res, t;

  beforeEach(() => {
    req = { body: {}, user: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction = jest.fn().mockResolvedValue(t);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerMember', () => {
    test('Thiếu trường bắt buộc trả lỗi 400', async () => {
      req.body = { fullName: '', phoneNumber: '', initialPackageId: null };
      await registerMember(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Full name, phone number, and an initial package are required.' });
    });

    test('Gói không tồn tại trả lỗi 400', async () => {
      req.body = { fullName: 'Test', phoneNumber: '123456', initialPackageId: 1 };
      MembershipPackage.findByPk.mockResolvedValue(null);
      await registerMember(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'The selected initial package does not exist.' });
    });

    test('Số điện thoại đã tồn tại trả lỗi 400', async () => {
      req.body = { fullName: 'Test', phoneNumber: '123456', initialPackageId: 1 };
      MembershipPackage.findByPk.mockResolvedValue({ duration_days: 30, type: 'time-based' });
      Profile.findOne.mockResolvedValue({ profile_id: 1 });
      await registerMember(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'A member with this phone number already exists.' });
    });

    test('Email đã tồn tại trả lỗi 400', async () => {
      req.body = { fullName: 'Test', phoneNumber: '123456', initialPackageId: 1, email: 'email@test.com' };
      MembershipPackage.findByPk.mockResolvedValue({ duration_days: 30, type: 'time-based' });
      Profile.findOne.mockResolvedValue(null);
      User.findOne.mockResolvedValue({ user_id: 1 });
      await registerMember(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'This email address is already in use.' });
    });

    test('Đăng ký thành công trả 201 và thông tin member', async () => {
      req.body = { fullName: 'Test', phoneNumber: '123456', initialPackageId: 1, email: 'email@test.com', dateOfBirth: '1990-01-01' };
      MembershipPackage.findByPk.mockResolvedValue({ duration_days: 30, type: 'session-based', session_count: 5 });
      Profile.findOne.mockResolvedValue(null);
      User.findOne.mockResolvedValue(null);
      crypto.randomBytes.mockReturnValue(Buffer.from('abcd1234'));
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPass');
      User.create.mockResolvedValue({ user_id: 1, email: 'email@test.com' });
      Profile.create.mockResolvedValue({});
      MemberSubscription.create.mockResolvedValue({});
      await registerMember(req, res);
      expect(t.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Member registered and subscription activated successfully.',
        member: expect.objectContaining({ userId: 1, fullName: 'Test', email: 'email@test.com' })
      }));
    });

    test('Lỗi server trả 400', async () => {
      req.body = { fullName: 'Test', phoneNumber: '123456', initialPackageId: 1 };
      MembershipPackage.findByPk.mockRejectedValue(new Error('DB error'));
      await registerMember(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.any(String) }));
    });
  });

  describe('extendSubscription', () => {
    test('Thiếu memberId hoặc newPackageId trả lỗi 400', async () => {
      req.body = { memberId: null, newPackageId: null };
      await extendSubscription(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Member User ID and New Package ID are required.' });
    });

    test('Gói mới không tồn tại trả lỗi 400', async () => {
      req.body = { memberId: 1, newPackageId: 2 };
      MembershipPackage.findByPk.mockResolvedValue(null);
      await extendSubscription(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'The selected new package does not exist.' });
    });

    test('Gia hạn thành công trả 201', async () => {
      req.body = { memberId: 1, newPackageId: 2 };
      MembershipPackage.findByPk.mockResolvedValue({ duration_days: 30, type: 'session-based', session_count: 10 });
      MemberSubscription.findOne.mockResolvedValue({ end_date: new Date(Date.now() + 86400000) }); // 1 ngày sau
      MemberSubscription.create.mockResolvedValue({ subscription_id: 99 });
      await extendSubscription(req, res);
      expect(t.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Subscription extended successfully.',
        newSubscription: { subscription_id: 99 }
      }));
    });

    test('Lỗi server trả 400', async () => {
      req.body = { memberId: 1, newPackageId: 2 };
      MembershipPackage.findByPk.mockRejectedValue(new Error('DB error'));
      await extendSubscription(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: expect.any(String) }));
    });
  });

  describe('getMyWorkoutHistory', () => {
    test('Lấy lịch sử tập luyện thành công', async () => {
      req.user = { user_id: 1 };
      const fakeSessions = [{
        session_id: 1,
        sessionDatetime: '2025-06-20T10:00:00Z',
        Trainer: {
          user_id: 2,
          Profile: { full_name: 'Trainer One' }
        }
      }];
      WorkoutSession.findAll.mockResolvedValue(fakeSessions);
      await getMyWorkoutHistory(req, res);
      expect(WorkoutSession.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { memberUserId: 1 },
        include: expect.any(Array),
        order: [['sessionDatetime', 'DESC']]
      }));
      expect(res.json).toHaveBeenCalledWith(fakeSessions);
    });

    test('Lỗi server trả 500', async () => {
      req.user = { user_id: 1 };
      WorkoutSession.findAll.mockRejectedValue(new Error('DB error'));
      await getMyWorkoutHistory(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });
});