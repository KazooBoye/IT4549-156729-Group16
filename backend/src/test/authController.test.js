// authController.test.js
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { User, Profile, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

jest.mock('../models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto');

// Giữ nguyên biến passwordResetTokens từ controller
const passwordResetTokens = require('../src/controllers/authController').passwordResetTokens || {};

describe('Auth Controller', () => {
  let req, res, t;

  beforeEach(() => {
    req = { body: {}, protocol: 'http', get: jest.fn().mockReturnValue('localhost'), params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction = jest.fn().mockResolvedValue(t);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    test('Thiếu trường bắt buộc trả lỗi 400', async () => {
      req.body = { email: '', password: '', fullName: '', role: '' };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Please enter all required fields' });
    });

    test('Role không hợp lệ trả lỗi 400', async () => {
      req.body = { email: 'a@b.com', password: '123', fullName: 'Test User', role: 'invalid' };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid role specified.' });
    });

    test('User đã tồn tại trả lỗi 400', async () => {
      req.body = { email: 'a@b.com', password: '123', fullName: 'Test User', role: 'member' };
      User.findOne.mockResolvedValue({ user_id: 1 });
      await registerUser(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User already exists' });
    });

    test('Đăng ký thành công trả token và user info', async () => {
      req.body = { email: 'a@b.com', password: '123', fullName: 'Test User', role: 'member' };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({ user_id: 1, email: 'a@b.com', role: 'member' });
      Profile.create.mockResolvedValue({ user_id: 1, full_name: 'Test User' });
      jwt.sign.mockImplementation((payload, secret, options, callback) => callback(null, 'token123'));

      await registerUser(req, res);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();
      expect(Profile.create).toHaveBeenCalled();
      expect(t.commit).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'token123',
        user: expect.objectContaining({ id: 1, email: 'a@b.com', role: 'member', fullName: 'Test User' }),
        msg: 'User registered successfully'
      }));
    });

    test('Rollback và lỗi 500 khi có lỗi', async () => {
      req.body = { email: 'a@b.com', password: '123', fullName: 'Test User', role: 'member' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await registerUser(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error during registration');
    });
  });

  describe('loginUser', () => {
    test('Thiếu email hoặc password trả lỗi 400', async () => {
      req.body = { email: '', password: '' };
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Please provide email and password' });
    });

    test('User không tồn tại trả lỗi 400', async () => {
      req.body = { email: 'a@b.com', password: '123' };
      User.findOne.mockResolvedValue(null);
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    test('Password không đúng trả lỗi 400', async () => {
      req.body = { email: 'a@b.com', password: 'wrongpass' };
      User.findOne.mockResolvedValue({ password_hash: 'hashedPass', user_id: 1, email: 'a@b.com', role: 'member', Profile: { full_name: 'Test User' } });
      bcrypt.compare.mockResolvedValue(false);
      await loginUser(req, res);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpass', 'hashedPass');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    test('Đăng nhập thành công trả token và user info', async () => {
      req.body = { email: 'a@b.com', password: '123' };
      User.findOne.mockResolvedValue({ password_hash: 'hashedPass', user_id: 1, email: 'a@b.com', role: 'member', Profile: { full_name: 'Test User' } });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options, callback) => callback(null, 'token123'));

      await loginUser(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: 'token123',
        user: expect.objectContaining({ id: 1, email: 'a@b.com', role: 'member', fullName: 'Test User' }),
        msg: 'Login successful'
      }));
    });

    test('Lỗi server trả 500', async () => {
      req.body = { email: 'a@b.com', password: '123' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error during login');
    });
  });

  describe('forgotPassword', () => {
    test('Email không tồn tại vẫn trả success', async () => {
      req.body = { email: 'notfound@a.com' };
      User.findOne.mockResolvedValue(null);
      await forgotPassword(req, res);
      expect(res.json).toHaveBeenCalledWith({ msg: 'If a user with that email exists, password reset instructions have been sent.' });
    });

    test('Tạo token và trả success khi email tồn tại', async () => {
      req.body = { email: 'user@a.com' };
      User.findOne.mockResolvedValue({ user_id: 1 });
      crypto.randomBytes.mockReturnValue(Buffer.from('a'.repeat(32)));
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedToken'),
      });

      await forgotPassword(req, res);

      expect(passwordResetTokens['hashedToken']).toBeDefined();
      expect(res.json).toHaveBeenCalledWith({ msg: 'If a user with that email exists, password reset instructions have been sent.' });
    });

    test('Lỗi server trả 500', async () => {
      req.body = { email: 'error@a.com' };
      User.findOne.mockRejectedValue(new Error('DB error'));
      await forgotPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error');
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      // Reset passwordResetTokens trước mỗi test
      for (const key in passwordResetTokens) {
        delete passwordResetTokens[key];
      }
    });

    test('Token không hợp lệ hoặc hết hạn trả lỗi 400', async () => {
      req.params.token = 'invalidtoken';
      req.body.password = 'newpass';
      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedInvalidToken'),
      });

      await resetPassword(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Token is invalid or has expired.' });
    });

    test('Reset password thành công trả success', async () => {
      req.params.token = 'validtoken';
      req.body.password = 'newpass';

      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedValidToken'),
      });

      // Thêm token hợp lệ vào passwordResetTokens
      passwordResetTokens['hashedValidToken'] = { userId: 1, expires: Date.now() + 10000 };

      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedNewPass');
      User.update.mockResolvedValue([1]); // số bản ghi update

      await resetPassword(req, res);

      expect(User.update).toHaveBeenCalledWith(
        { password_hash: 'hashedNewPass' },
        { where: { user_id: 1 } }
      );

      expect(res.json).toHaveBeenCalledWith({ msg: 'Password has been reset successfully.' });
      expect(passwordResetTokens['hashedValidToken']).toBeUndefined();
    });

    test('Lỗi server trả 500', async () => {
      req.params.token = 'validtoken';
      req.body.password = 'newpass';

      crypto.createHash.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('hashedValidToken'),
      });

      passwordResetTokens['hashedValidToken'] = { userId: 1, expires: Date.now() + 10000 };

      bcrypt.genSalt.mockRejectedValue(new Error('bcrypt error'));

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error');
    });
  });
});