// equipmentController.test.js
const { getAllEquipment, updateEquipment } = require('../controllers/equipmentController');
const { Equipment } = require('../models');

jest.mock('../models');

describe('Equipment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEquipment', () => {
    test('Lấy danh sách thiết bị thành công', async () => {
      const fakeEquipments = [
        { equipment_id: 1, equipment_name: 'Bike', status: 'operational' },
        { equipment_id: 2, equipment_name: 'Treadmill', status: 'broken' }
      ];
      Equipment.findAll.mockResolvedValue(fakeEquipments);
      await getAllEquipment(req, res);
      expect(Equipment.findAll).toHaveBeenCalledWith(expect.objectContaining({
        order: [['equipment_name', 'ASC']]
      }));
      expect(res.json).toHaveBeenCalledWith(fakeEquipments);
    });

    test('Lỗi server trả 500', async () => {
      Equipment.findAll.mockRejectedValue(new Error('DB error'));
      await getAllEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });

  describe('updateEquipment', () => {
    test('Thiếu hoặc status không hợp lệ trả lỗi 400', async () => {
      req.params.id = '1';
      req.body.status = 'invalid_status';
      await updateEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Vui lòng cung cấp trạng thái hợp lệ.' });
    });

    test('Thiết bị không tồn tại trả lỗi 404', async () => {
      req.params.id = '1';
      req.body.status = 'operational';
      Equipment.findByPk.mockResolvedValue(null);
      await updateEquipment(req, res);
      expect(Equipment.findByPk).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Không tìm thấy thiết bị.' });
    });

    test('Cập nhật trạng thái thành công trả kết quả', async () => {
      req.params.id = '1';
      req.body.status = 'operational';
      const fakeEquipment = {
        equipment_id: 1,
        equipment_name: 'Bike',
        status: 'broken',
        save: jest.fn().mockResolvedValue()
      };
      Equipment.findByPk.mockResolvedValue(fakeEquipment);
      await updateEquipment(req, res);
      expect(fakeEquipment.status).toBe('operational');
      expect(fakeEquipment.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Cập nhật trạng thái thành công.',
        equipment: fakeEquipment
      }));
    });

    test('Cập nhật trạng thái broken sẽ log thông báo', async () => {
      req.params.id = '2';
      req.body.status = 'broken';
      const fakeEquipment = {
        equipment_id: 2,
        equipment_name: 'Treadmill',
        status: 'operational',
        save: jest.fn().mockResolvedValue()
      };
      Equipment.findByPk.mockResolvedValue(fakeEquipment);
      console.log = jest.fn();

      await updateEquipment(req, res);

      expect(fakeEquipment.status).toBe('broken');
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('THÔNG BÁO BẢO TRÌ'));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Cập nhật trạng thái thành công.',
        equipment: fakeEquipment
      }));
    });

    test('Lỗi server trả 500', async () => {
      req.params.id = '1';
      req.body.status = 'operational';
      Equipment.findByPk.mockRejectedValue(new Error('DB error'));
      await updateEquipment(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });
});