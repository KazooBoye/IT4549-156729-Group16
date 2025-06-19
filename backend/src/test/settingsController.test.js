// settingsController.test.js
const { getAllSettings, updateSettings } = require('../controllers/settingsController');
const { SystemSetting, sequelize } = require('../models');

jest.mock('../models');

describe('Settings Controller', () => {
  let req, res, t;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction = jest.fn().mockResolvedValue(t);
    jest.clearAllMocks();
  });

  describe('getAllSettings', () => {
    test('Lấy tất cả settings thành công', async () => {
      const fakeSettings = [
        { setting_key: 'gym_name', setting_value: 'My Gym' },
        { setting_key: 'address', setting_value: '123 Street' }
      ];
      SystemSetting.findAll.mockResolvedValue(fakeSettings);

      await getAllSettings(req, res);

      expect(SystemSetting.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        gym_name: 'My Gym',
        address: '123 Street'
      });
    });

    test('Lỗi server trả 500', async () => {
      SystemSetting.findAll.mockRejectedValue(new Error('DB error'));
      await getAllSettings(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('updateSettings', () => {
    test('Cập nhật thành công và commit', async () => {
      req.body = { gym_name: 'New Gym', address: '456 Avenue' };
      SystemSetting.update.mockResolvedValue([1]); // Sequelize returns number of affected rows

      await updateSettings(req, res);

      expect(sequelize.transaction).toHaveBeenCalled();
      expect(SystemSetting.update).toHaveBeenCalledTimes(2);
      expect(SystemSetting.update).toHaveBeenCalledWith(
        { setting_value: 'New Gym' },
        expect.objectContaining({ where: { setting_key: 'gym_name' }, transaction: t })
      );
      expect(t.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: 'Cập nhật thông tin hệ thống thành công.' });
    });

    test('Lỗi khi cập nhật settings rollback và trả 500', async () => {
      req.body = { gym_name: 'Fail Gym' };
      SystemSetting.update.mockRejectedValue(new Error('DB error'));

      await updateSettings(req, res);

      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server khi cập nhật.');
    });
  });
});