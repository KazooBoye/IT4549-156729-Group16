// serviceHistoryController.test.js
const { createServiceHistory } = require('../controllers/serviceHistoryController');
const { ServiceHistory } = require('../models');

jest.mock('../models');

describe('ServiceHistory Controller - createServiceHistory', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: { user_id: 42 }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn()
    };
    jest.clearAllMocks();
  });

  test('Thiếu memberId hoặc serviceDate hoặc serviceId trả lỗi 400', async () => {
    req.body = { memberId: null, serviceDate: null, serviceId: null };
    await createServiceHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
  });

  test('Tạo lịch sử dịch vụ thành công trả 201', async () => {
    req.body = {
      memberId: 1,
      serviceDate: '2025-06-20',
      serviceId: 5,
      durationMinutes: 60,
      notes: 'Some notes'
    };
    const fakeHistory = { id: 100 };
    ServiceHistory.create.mockResolvedValue(fakeHistory);

    await createServiceHistory(req, res);

    expect(ServiceHistory.create).toHaveBeenCalledWith({
      memberUserId: 1,
      recordedByStaffId: 42,
      serviceDate: '2025-06-20',
      serviceId: 5,
      durationMinutes: 60,
      notes: 'Some notes',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Ghi nhận lịch sử thành công.',
      data: fakeHistory
    });
  });

  test('Tạo lịch sử dịch vụ thành công với durationMinutes và notes không truyền', async () => {
    req.body = {
      memberId: 1,
      serviceDate: '2025-06-20',
      serviceId: 5
    };
    const fakeHistory = { id: 101 };
    ServiceHistory.create.mockResolvedValue(fakeHistory);

    await createServiceHistory(req, res);

    expect(ServiceHistory.create).toHaveBeenCalledWith({
      memberUserId: 1,
      recordedByStaffId: 42,
      serviceDate: '2025-06-20',
      serviceId: 5,
      durationMinutes: null,
      notes: null,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      msg: 'Ghi nhận lịch sử thành công.',
      data: fakeHistory
    });
  });

  test('Lỗi định dạng dữ liệu trả 400', async () => {
    req.body = {
      memberId: 1,
      serviceDate: 'invalid-date',
      serviceId: 5
    };
    const error = new Error('Invalid data');
    error.name = 'SequelizeDatabaseError';
    ServiceHistory.create.mockRejectedValue(error);

    await createServiceHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại.' });
  });

  test('Lỗi server trả 500', async () => {
    req.body = {
      memberId: 1,
      serviceDate: '2025-06-20',
      serviceId: 5
    };
    ServiceHistory.create.mockRejectedValue(new Error('DB error'));

    await createServiceHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith('Lỗi Server');
  });
});