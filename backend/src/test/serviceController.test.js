// serviceController.test.js
const { getActiveServices } = require('../controllers/serviceController');
const { Service } = require('../models');

jest.mock('../models');

describe('Service Controller - getActiveServices', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('Lấy danh sách dịch vụ active thành công', async () => {
    const fakeServices = [
      { service_id: 1, service_name: 'Yoga' },
      { service_id: 2, service_name: 'Massage' }
    ];
    Service.findAll.mockResolvedValue(fakeServices);

    await getActiveServices(req, res);

    expect(Service.findAll).toHaveBeenCalledWith({
      where: { is_active: true },
      order: [['service_name', 'ASC']],
    });
    expect(res.json).toHaveBeenCalledWith(fakeServices);
  });

  test('Lỗi server trả 500', async () => {
    Service.findAll.mockRejectedValue(new Error('DB error'));
    await getActiveServices(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Server Error');
  });
});