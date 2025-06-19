// packageController.test.js
const { getActivePackages } = require('../controllers/packageController');
const { MembershipPackage } = require('../models');

jest.mock('../models');

describe('Package Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActivePackages', () => {
    test('Lấy danh sách gói active thành công', async () => {
      const fakePackages = [
        { package_id: 1, price: 100 },
        { package_id: 2, price: 200 }
      ];
      MembershipPackage.findAll.mockResolvedValue(fakePackages);
      await getActivePackages(req, res);
      expect(MembershipPackage.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { is_active: true },
        order: [['price', 'ASC']]
      }));
      expect(res.json).toHaveBeenCalledWith(fakePackages);
    });

    test('Lỗi server trả 500', async () => {
      MembershipPackage.findAll.mockRejectedValue(new Error('DB error'));
      await getActivePackages(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });
});