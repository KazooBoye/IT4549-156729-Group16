// bookingController.test.js
const { createBooking, getMemberBookings } = require('../controllers/bookingController');
const { PersonalTrainingBooking } = require('../models');

jest.mock('../models');

describe('Booking Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, user: { user_id: 2 }, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    test('Thiếu trainer_user_id hoặc session_datetime trả lỗi 400', async () => {
      req.body = { trainer_user_id: null, session_datetime: null };
      await createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Trainer and session date/time are required.' });
    });

    test('Tạo booking thành công trả 201', async () => {
      req.body = {
        trainer_user_id: 1,
        session_datetime: '2025-06-20T10:00:00Z',
        duration_minutes: 60,
        notes_member: 'Note',
        subscription_id: 5,
        member_user_id: 3,
      };
      PersonalTrainingBooking.create.mockResolvedValue({ booking_id: 10 });
      await createBooking(req, res);
      expect(PersonalTrainingBooking.create).toHaveBeenCalledWith(expect.objectContaining({
        memberUserId: 3,
        trainerUserId: 1,
        sessionDatetime: '2025-06-20T10:00:00Z',
        durationMinutes: 60,
        notesMember: 'Note',
        subscriptionId: 5,
        status: 'scheduled'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        msg: 'Booking created successfully',
        booking: { booking_id: 10 }
      }));
    });

    test('Tạo booking lỗi server trả 500', async () => {
      req.body = { trainer_user_id: 1, session_datetime: '2025-06-20T10:00:00Z' };
      PersonalTrainingBooking.create.mockRejectedValue(new Error('DB error'));
      await createBooking(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Server error while creating booking.' });
    });
  });

  describe('getMemberBookings', () => {
    test('Lấy bookings thành công', async () => {
      const fakeBookings = [{
        booking_id: 1,
        sessionDatetime: '2025-06-20T10:00:00Z',
        durationMinutes: 60,
        status: 'scheduled',
        notesMember: 'note1',
        notesTrainer: 'noteT1',
        Trainer: {
          email: 'trainer@example.com',
          Profile: { full_name: 'Trainer Name' }
        }
      }];
      PersonalTrainingBooking.findAll.mockResolvedValue(fakeBookings);
      await getMemberBookings(req, res);
      expect(PersonalTrainingBooking.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { memberUserId: 2 }
      }));
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          booking_id: 1,
          session_datetime: '2025-06-20T10:00:00Z',
          trainer_name: 'Trainer Name',
          trainer_email: 'trainer@example.com'
        })
      ]));
    });

    test('Lỗi server trả 500', async () => {
      PersonalTrainingBooking.findAll.mockRejectedValue(new Error('DB error'));
      await getMemberBookings(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Server error while fetching bookings.' });
    });
  });
});