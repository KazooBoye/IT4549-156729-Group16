// trainerMemberController.test.js
const {
  getAssignedMembers,
  getMemberDetails,
  updateMemberProfileByTrainer,
  deleteMemberByTrainer,
  getMemberSessions,
  addWorkoutSession,
  updateWorkoutSession
} = require('../controllers/trainerMemberController');

const {
  PersonalTrainingBooking,
  User,
  Profile,
  MemberSubscription,
  MembershipPackage,
  sequelize,
  WorkoutSession
} = require('../models');

const { Op } = require('sequelize');

jest.mock('../models');

describe('Trainer & Member Controllers', () => {
  let req, res, t;

  beforeEach(() => {
    req = { user: {}, params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
    t = { commit: jest.fn(), rollback: jest.fn() };
    sequelize.transaction = jest.fn().mockResolvedValue(t);
    jest.clearAllMocks();
  });

  describe('getAssignedMembers', () => {
    test('Trả về mảng rỗng khi không có member', async () => {
      req.user.user_id = 1;
      PersonalTrainingBooking.findAll.mockResolvedValue([]);
      await getAssignedMembers(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test('Trả về danh sách member có booking với trainer', async () => {
      req.user.user_id = 1;
      PersonalTrainingBooking.findAll.mockResolvedValue([
        { memberUserId: 10 },
        { memberUserId: 20 }
      ]);
      User.findAll.mockResolvedValue([
        { user_id: 10, email: 'a@example.com', Profile: { full_name: 'A' }, MemberSubscriptions: [] },
        { user_id: 20, email: 'b@example.com', Profile: { full_name: 'B' }, MemberSubscriptions: [] }
      ]);
      await getAssignedMembers(req, res);
      expect(User.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { user_id: { [Op.in]: [10, 20] } }
      }));
      expect(res.json).toHaveBeenCalled();
    });

    test('Lỗi server trả 500', async () => {
      req.user.user_id = 1;
      PersonalTrainingBooking.findAll.mockRejectedValue(new Error('DB error'));
      await getAssignedMembers(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });

  describe('getMemberDetails', () => {
    test('Không tìm thấy member trả 404', async () => {
      req.params.id = 1;
      User.findByPk.mockResolvedValue(null);
      await getMemberDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Không tìm thấy hội viên.' });
    });

    test('Trả về thông tin chi tiết member', async () => {
      req.params.id = 1;
      User.findByPk.mockResolvedValue({ user_id: 1, email: 'a@b.com', Profile: {}, MemberSubscriptions: [] });
      await getMemberDetails(req, res);
      expect(res.json).toHaveBeenCalled();
    });

    test('Lỗi server trả 500', async () => {
      req.params.id = 1;
      User.findByPk.mockRejectedValue(new Error('DB error'));
      await getMemberDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });

  describe('updateMemberProfileByTrainer', () => {
    test('Không tìm thấy profile trả 404', async () => {
      req.params.id = 1;
      req.body = {};
      Profile.findOne.mockResolvedValue(null);
      await updateMemberProfileByTrainer(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Không tìm thấy hồ sơ hội viên.' });
    });

    test('Cập nhật profile thành công', async () => {
      req.params.id = 1;
      req.body = { fullName: 'New Name', dateOfBirth: '2000-01-01', phoneNumber: '123' };
      const fakeProfile = { full_name: 'Old', date_of_birth: '1990-01-01', phone_number: '111', save: jest.fn() };
      Profile.findOne.mockResolvedValue(fakeProfile);
      await updateMemberProfileByTrainer(req, res);
      expect(fakeProfile.full_name).toBe('New Name');
      expect(fakeProfile.date_of_birth).toBe('2000-01-01');
      expect(fakeProfile.phone_number).toBe('123');
      expect(fakeProfile.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Cập nhật hồ sơ thành công.' }));
    });

    test('Lỗi server trả 500', async () => {
      req.params.id = 1;
      Profile.findOne.mockRejectedValue(new Error('DB error'));
      await updateMemberProfileByTrainer(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });

  describe('deleteMemberByTrainer', () => {
    test('Không tìm thấy user trả 404', async () => {
      req.params.id = 1;
      User.findByPk.mockResolvedValue(null);
      await deleteMemberByTrainer(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Không tìm thấy hội viên.' });
    });

    test('Xóa thành công và commit', async () => {
      req.params.id = 1;
      const fakeUser = { destroy: jest.fn() };
      User.findByPk.mockResolvedValue(fakeUser);
      Profile.destroy.mockResolvedValue(1);
      MemberSubscription.destroy.mockResolvedValue(1);

      await deleteMemberByTrainer(req, res);

      expect(Profile.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { user_id: 1 }, transaction: t }));
      expect(MemberSubscription.destroy).toHaveBeenCalledWith(expect.objectContaining({ where: { memberUserId: 1 }, transaction: t }));
      expect(fakeUser.destroy).toHaveBeenCalledWith({ transaction: t });
      expect(t.commit).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ msg: 'Xóa hội viên thành công.' });
    });

    test('Lỗi server rollback và trả 500', async () => {
      req.params.id = 1;
      User.findByPk.mockRejectedValue(new Error('DB error'));
      await deleteMemberByTrainer(req, res);
      expect(t.rollback).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });

  describe('getMemberSessions', () => {
    test('Trả về danh sách session thành công', async () => {
      req.params.memberId = 1;
      const fakeSessions = [{ session_id: 1 }];
      WorkoutSession.findAll.mockResolvedValue(fakeSessions);
      await getMemberSessions(req, res);
      expect(WorkoutSession.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { memberUserId: 1 },
        order: [['sessionDatetime', 'DESC']]
      }));
      expect(res.json).toHaveBeenCalledWith(fakeSessions);
    });

    test('Lỗi server trả 500', async () => {
      req.params.memberId = 1;
      WorkoutSession.findAll.mockRejectedValue(new Error('DB error'));
      await getMemberSessions(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });

  describe('addWorkoutSession', () => {
    test('Thiếu thông tin trả lỗi 400', async () => {
      req.user.user_id = 1;
      req.body = { memberId: null, sessionDatetime: null, exercisePlan: null, durationMinutes: null };
      await addWorkoutSession(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Vui lòng nhập đầy đủ thông tin buổi tập.' });
    });

    test('Tạo buổi tập thành công trả 201', async () => {
      req.user.user_id = 1;
      req.body = {
        memberId: 2,
        sessionDatetime: '2025-06-20',
        exercisePlan: 'Plan A',
        durationMinutes: 60,
        notes: 'Note'
      };
      const fakeSession = { session_id: 123 };
      WorkoutSession.create.mockResolvedValue(fakeSession);
      await addWorkoutSession(req, res);
      expect(WorkoutSession.create).toHaveBeenCalledWith(expect.objectContaining({
        memberUserId: 2,
        trainerUserId: 1,
        sessionDatetime: '2025-06-20',
        exercisePlan: 'Plan A',
        durationMinutes: 60,
        trainerNotes: 'Note',
        status: 'Planned'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeSession);
    });

    test('Lỗi server trả 500', async () => {
      req.user.user_id = 1;
      req.body = {
        memberId: 2,
        sessionDatetime: '2025-06-20',
        exercisePlan: 'Plan A',
        durationMinutes: 60
      };
      WorkoutSession.create.mockRejectedValue(new Error('DB error'));
      await addWorkoutSession(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });

  describe('updateWorkoutSession', () => {
    test('Không tìm thấy session trả 404', async () => {
      req.params.sessionId = 1;
      WorkoutSession.findByPk.mockResolvedValue(null);
      await updateWorkoutSession(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Không tìm thấy buổi tập.' });
    });

    test('Cập nhật session thành công', async () => {
      req.params.sessionId = 1;
      req.body = {
        exercisePlan: 'New Plan',
        durationMinutes: 45,
        notes: 'Updated notes',
        status: 'Completed',
        evaluationScore: 9,
        evaluationComments: 'Good',
        goalCompletionStatus: 'Achieved',
        suggestionsForNextSession: 'More cardio'
      };
      const fakeSession = { save: jest.fn() };
      WorkoutSession.findByPk.mockResolvedValue(fakeSession);
      await updateWorkoutSession(req, res);
      expect(fakeSession.exercisePlan).toBe('New Plan');
      expect(fakeSession.durationMinutes).toBe(45);
      expect(fakeSession.trainerNotes).toBe('Updated notes');
      expect(fakeSession.status).toBe('Completed');
      expect(fakeSession.evaluationScore).toBe(9);
      expect(fakeSession.evaluationComments).toBe('Good');
      expect(fakeSession.goalCompletionStatus).toBe('Achieved');
      expect(fakeSession.suggestionsForNextSession).toBe('More cardio');
      expect(fakeSession.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(fakeSession);
    });

    test('Lỗi validation trả 400', async () => {
      req.params.sessionId = 1;
      const err = new Error('Validation error');
      err.name = 'SequelizeValidationError';
      WorkoutSession.findByPk.mockResolvedValue({
        save: jest.fn().mockRejectedValue(err)
      });
      await updateWorkoutSession(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ msg: 'Dữ liệu đánh giá không hợp lệ.' }));
    });

    test('Lỗi server trả 500', async () => {
      req.params.sessionId = 1;
      WorkoutSession.findByPk.mockRejectedValue(new Error('DB error'));
      await updateWorkoutSession(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Lỗi Server');
    });
  });
});