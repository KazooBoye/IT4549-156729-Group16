// feedbackController.test.js
const {
  getAllFeedback,
  updateFeedback,
  createFeedback
} = require('../controllers/feedbackController');

const { Feedback } = require('../models');

jest.mock('../models');

describe('Feedback Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFeedback', () => {
    test('Lấy danh sách feedback thành công', async () => {
      const fakeFeedbacks = [
        {
          feedback_id: 1,
          comments: 'Great gym',
          SubmittingMember: {
            email: 'member@example.com',
            Profile: { full_name: 'Member One' }
          }
        }
      ];
      Feedback.findAll.mockResolvedValue(fakeFeedbacks);
      await getAllFeedback(req, res);
      expect(Feedback.findAll).toHaveBeenCalledWith(expect.objectContaining({
        include: expect.any(Array),
        order: [['status', 'ASC'], ['created_at', 'DESC']]
      }));
      expect(res.json).toHaveBeenCalledWith(fakeFeedbacks);
    });

    test('Lỗi server trả 500', async () => {
      Feedback.findAll.mockRejectedValue(new Error('DB error'));
      await getAllFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('updateFeedback', () => {
    test('Thiếu resolutionNotes hoặc newStatus trả lỗi 400', async () => {
      req.body = { resolutionNotes: '', newStatus: '' };
      req.params.id = '1';
      await updateFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Resolution notes and a new status are required.' });
    });

    test('Feedback không tồn tại trả lỗi 404', async () => {
      req.body = { resolutionNotes: 'Fixed', newStatus: 'Resolved' };
      req.params.id = '1';
      Feedback.findByPk.mockResolvedValue(null);
      await updateFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Feedback item not found.' });
    });

    test('Cập nhật thành công trả feedback', async () => {
      req.body = { resolutionNotes: 'Fixed', newStatus: 'Resolved' };
      req.params.id = '1';
      const fakeFeedback = {
        save: jest.fn(),
        resolutionNotes: '',
        status: ''
      };
      Feedback.findByPk.mockResolvedValue(fakeFeedback);
      await updateFeedback(req, res);
      expect(fakeFeedback.resolutionNotes).toBe('Fixed');
      expect(fakeFeedback.status).toBe('Resolved');
      expect(fakeFeedback.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeFeedback);
    });

    test('Lỗi server trả 500', async () => {
      req.body = { resolutionNotes: 'Fixed', newStatus: 'Resolved' };
      req.params.id = '1';
      Feedback.findByPk.mockRejectedValue(new Error('DB error'));
      await updateFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });

  describe('createFeedback', () => {
    test('Thiếu feedbackType hoặc comments trả lỗi 400', async () => {
      req.body = { feedbackType: '', comments: '' };
      req.user = { user_id: 1 };
      await createFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Feedback type and comments are required.' });
    });

    test('Tạo feedback thành công trả 201', async () => {
      req.body = { feedbackType: 'general', rating: 4, comments: 'Nice' };
      req.user = { user_id: 1 };
      const fakeFeedback = { feedback_id: 10 };
      Feedback.create.mockResolvedValue(fakeFeedback);
      await createFeedback(req, res);
      expect(Feedback.create).toHaveBeenCalledWith(expect.objectContaining({
        memberUserId: 1,
        feedbackType: 'general',
        rating: 4,
        comments: 'Nice',
        status: 'Submitted'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeFeedback);
    });

    test('Lỗi server trả 500', async () => {
      req.body = { feedbackType: 'general', comments: 'Nice' };
      req.user = { user_id: 1 };
      Feedback.create.mockRejectedValue(new Error('DB error'));
      await createFeedback(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
    });
  });
});