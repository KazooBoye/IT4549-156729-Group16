// userController.test.js
const {
  getAllTrainers,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  searchMembers,
  getUnassignedMembers
} = require('../controllers/userController');

const {
  User,
  Profile,
  sequelize,
  PersonalTrainingBooking
} = require('../models');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');

jest.mock('../models');
jest.mock('bcryptjs');
jest.mock('crypto');

describe('User Controller', () => {
  let req, res, t;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {}, user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction = jest.fn().mockResolvedValue(t);
    jest.clearAllMocks();
  });

  describe('getAllTrainers', () => {
    test('Trả về danh sách trainer', async () => {
      const fakeTrainers = [
        { user_id: 1, Profile: { full_name: 'A' } },
        { user_id: 2, Profile: { full_name: 'B' } }
      ];
      User.findAll.mockResolvedValue(fakeTrainers);
      await getAllTrainers(req, res);
      expect(res.json).toHaveBeenCalledWith([
        { user_id: 1, full_name: 'A' },
        { user_id: 2, full_name: 'B' }
      ]);
    });

    test('Lỗi server trả 500', async () => {
      User.findAll.mockRejectedValue(new Error('DB error'));
      await getAllTrainers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Server error while fetching trainers' });
    });
  });

  describe('getAllUsers', () => {
    test('Trả về danh sách users', async () => {
      const fakeUsers = [{ user_id: 1, email: 'a@b.com', role: 'member', created_at: new Date() }];
      User.findAll.mockResolvedValue(fakeUsers);
      await getAllUsers(req, res);
      expect(res.json).toHaveBeenCalledWith(fakeUsers);
    });

    test('Lỗi server trả 500', async () => {
      User.findAll.mockRejectedValue(new Error('DB error'));
      await getAllUsers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('createUser', () => {
    test('Thiếu trường bắt buộc trả 400', async () => {
      req.body = { fullName: '', email: '', password: '', role: '' };
      await createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Please provide full name, email, password, and role.' });
    });

    test('Email đã tồn tại trả 400', async () => {
      req.body = { fullName: 'A', email: 'a@b.com', password: 'pass', role: 'member' };
      User.findOne.mockResolvedValue(true);
      await createUser(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User with this email already exists.' });
    });

    test('Tạo user thành công trả 201', async () => {
      req.body = { fullName: 'A', email: 'a@b.com', password: 'pass', role: 'member', phoneNumber: '123' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed');
      User.create.mockResolvedValue({ user_id: 1 });
      Profile.create.mockResolvedValue({});
      await createUser(req, res);
      expect(t.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'User created successfully.' }));
    });

    test('Lỗi server trả 400', async () => {
      req.body = { fullName: 'A', email: 'a@b.com', password: 'pass', role: 'member' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await createUser(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateUser', () => {
    test('User không tồn tại trả 404', async () => {
      req.params.id = 1;
      User.findByPk.mockResolvedValue(null);
      await updateUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not found' });
    });

    test('Cập nhật user thành công trả 200', async () => {
      req.params.id = 1;
      req.body = { fullName: 'New', email: 'new@b.com', role: 'trainer', phoneNumber: '123' };
      const fakeUser = { email: 'old@b.com', role: 'member', save: jest.fn() };
      const fakeProfile = { full_name: 'Old', phone_number: '111', save: jest.fn() };
      User.findByPk.mockResolvedValue(fakeUser);
      Profile.findOne.mockResolvedValue(fakeProfile);
      await updateUser(req, res);
      expect(fakeUser.email).toBe('new@b.com');
      expect(fakeUser.role).toBe('trainer');
      expect(fakeProfile.full_name).toBe('New');
      expect(fakeProfile.phone_number).toBe('123');
      expect(fakeProfile.save).toHaveBeenCalled();
      expect(fakeUser.save).toHaveBeenCalled();
      expect(t.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: 'User updated successfully.' });
    });

    test('Lỗi server trả 500', async () => {
      req.params.id = 1;
      User.findByPk.mockRejectedValue(new Error('DB error'));
      await updateUser(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteUser', () => {
    test('User không tồn tại trả 404', async () => {
      req.params.id = 1;
      User.findByPk.mockResolvedValue(null);
      await deleteUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not found.' });
    });

    test('Xóa user thành công trả 200', async () => {
      req.params.id = 1;
      const fakeUser = { destroy: jest.fn() };
      User.findByPk.mockResolvedValue(fakeUser);
      await deleteUser(req, res);
      expect(fakeUser.destroy).toHaveBeenCalled();
      expect(t.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: 'User deleted successfully.' });
    });

    test('Lỗi server trả 500', async () => {
      req.params.id = 1;
      User.findByPk.mockRejectedValue(new Error('DB error'));
      await deleteUser(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('resetUserPassword', () => {
    test('User không tồn tại trả 404', async () => {
      req.params.id = 1;
      User.findByPk.mockResolvedValue(null);
      await resetUserPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not found.' });
    });

    test('Reset password thành công trả mật khẩu mới', async () => {
      req.params.id = 1;
      const fakeUser = { save: jest.fn() };
      User.findByPk.mockResolvedValue(fakeUser);
      crypto.randomBytes = jest.fn().mockReturnValue(Buffer.from('abcd1234'));
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPass');

      await resetUserPassword(req, res);

      expect(fakeUser.password_hash).toBe('hashedPass');
      expect(fakeUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Password reset successfully.',
        newPassword: expect.any(String)
      }));
    });

    test('Lỗi server trả 500', async () => {
      req.params.id = 1;
      User.findByPk.mockRejectedValue(new Error('DB error'));
      await resetUserPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('searchMembers', () => {
    test('Trả về mảng rỗng nếu query < 2 ký tự', async () => {
      req.query.q = 'a';
      await searchMembers(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('Tìm kiếm thành công trả danh sách', async () => {
      req.query.q = 'abc';
      const fakeMembers = [{ user_id: 1, Profile: { full_name: 'abc' } }];
      User.findAll.mockResolvedValue(fakeMembers);
      await searchMembers(req, res);
      expect(User.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeMembers);
    });

    test('Lỗi server trả 500', async () => {
      req.query.q = 'abc';
      User.findAll.mockRejectedValue(new Error('DB error'));
      await searchMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getUnassignedMembers', () => {
    test('Trả về danh sách unassigned members thành công', async () => {
      PersonalTrainingBooking.findAll.mockResolvedValue([{ memberUserId: 1 }]);
      User.findAll.mockResolvedValue([{ user_id: 2, Profile: { full_name: 'B' } }]);
      await getUnassignedMembers(req, res);
      expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          role: 'member',
          user_id: { [Op.notIn]: [1] }
        }
      }));
      expect(res.json).toHaveBeenCalled();
    });

    test('Lỗi server trả 500', async () => {
      PersonalTrainingBooking.findAll.mockRejectedValue(new Error('DB error'));
      await getUnassignedMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});