const { User, Profile, MemberSubscription, MembershipPackage, PersonalTrainingBooking, sequelize, WorkoutSession } = require('../models');
const { Op } = require('sequelize');

/**
 * Chức năng: Lấy danh sách hội viên được phân công cho HLV đang đăng nhập
 * Tương ứng: Bước 1 & 2 của Use Case
 * Route: GET /api/trainer/my-members
 */
exports.getAssignedMembers = async (req, res) => {
  const trainerId = req.user.user_id; // Lấy từ middleware xác thực

  try {
    // Tìm ID của tất cả các hội viên đã từng đặt lịch với HLV này
    const memberIds = (await PersonalTrainingBooking.findAll({
      where: { trainerUserId: trainerId },
      attributes: ['memberUserId'],
      group: ['memberUserId']
    })).map(booking => booking.memberUserId);

    if (memberIds.length === 0) {
      return res.json([]); // Trả về mảng rỗng nếu không có hội viên nào
    }
    
    // Lấy thông tin chi tiết của các hội viên đó
    const members = await User.findAll({
      where: { user_id: { [Op.in]: memberIds } },
      attributes: ['user_id', 'email'],
      include: [
        { model: Profile, as: 'Profile', required: true },
        { 
          model: MemberSubscription,
          include: [MembershipPackage]
        }
      ],
      order: [[Profile, 'full_name', 'ASC']]
    });

    res.json(members);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách hội viên của HLV:", err);
    res.status(500).send('Lỗi Server');
  }
};

/**
 * Chức năng: Lấy thông tin chi tiết của một hội viên
 * Tương ứng: Bước 4.1 (Xem chi tiết)
 * Route: GET /api/trainer/member/:id
 */
exports.getMemberDetails = async (req, res) => {
    const memberId = req.params.id;
    // Optional: Add a check to ensure the requesting trainer is allowed to see this member.

    try {
        const member = await User.findByPk(memberId, {
            attributes: ['user_id', 'email', 'created_at'], // Select specific fields from User
            include: [
                {
                    model: Profile,
                    as: 'Profile', // Get all profile details
                    required: true 
                },
                {
                    model: MemberSubscription,
                    separate: true, // Run this as a separate query for performance
                    include: [MembershipPackage] // Include package names
                },
                // You can add more includes here later for training history, etc.
            ]
        });

        if (!member) {
            return res.status(404).json({ msg: 'Không tìm thấy hội viên.' });
        }

        res.json(member);
    } catch (err) {
        console.error("Lỗi khi lấy chi tiết hội viên:", err);
        res.status(500).send('Lỗi Server');
    }
};

/**
 * Chức năng: HLV cập nhật thông tin hồ sơ của hội viên
 * Tương ứng: Bước 4.3 & 5.3 (Chỉnh sửa)
 * Route: PUT /api/trainer/member/:id
 */
exports.updateMemberProfileByTrainer = async (req, res) => {
    const memberId = req.params.id;
    const { fullName, dateOfBirth, phoneNumber } = req.body; // Các trường được phép sửa

    try {
        const profile = await Profile.findOne({ where: { user_id: memberId } });
        if (!profile) {
            return res.status(404).json({ msg: 'Không tìm thấy hồ sơ hội viên.' });
        }
        
        profile.full_name = fullName || profile.full_name;
        profile.date_of_birth = dateOfBirth || profile.date_of_birth;
        profile.phone_number = phoneNumber || profile.phone_number;

        await profile.save();
        res.json({ msg: 'Cập nhật hồ sơ thành công.', profile });

    } catch (err) {
        console.error("Lỗi khi HLV cập nhật hồ sơ:", err);
        res.status(500).send('Lỗi Server');
    }
};

/**
 * Chức năng: HLV xóa một hội viên
 * Tương ứng: Bước 4.4 & 5.4 (Xóa)
 * Route: DELETE /api/trainer/member/:id
 */
exports.deleteMemberByTrainer = async (req, res) => {
    const memberId = req.params.id;
    const t = await sequelize.transaction();
    try {
        const user = await User.findByPk(memberId);
        if(!user) {
            return res.status(404).json({ msg: 'Không tìm thấy hội viên.' });
        }
        
        // Xóa tất cả các bản ghi liên quan trước (profile, subscriptions, etc.)
        await Profile.destroy({ where: { user_id: memberId }, transaction: t });
        await MemberSubscription.destroy({ where: { memberUserId: memberId }, transaction: t });
        // ... xóa các bản ghi khác
        
        // Cuối cùng, xóa user
        await user.destroy({ transaction: t });

        await t.commit();
        res.json({ msg: 'Xóa hội viên thành công.' });
    } catch (err) {
        await t.rollback();
        console.error("Lỗi khi HLV xóa hội viên:", err);
        res.status(500).send('Lỗi Server');
    }
};

exports.getMemberSessions = async (req, res) => {
    const { memberId } = req.params;
    try {
        const sessions = await WorkoutSession.findAll({
            where: { memberUserId: memberId },
            order: [['sessionDatetime', 'DESC']]
        });
        res.json(sessions);
    } catch (err) {
        res.status(500).send('Lỗi Server');
    }
};

/**
 * Chức năng: Thêm một buổi tập mới cho hội viên
 * Tương ứng: Bước 6a
 * Route: POST /api/trainer/sessions
 */
exports.addWorkoutSession = async (req, res) => {
    const trainerId = req.user.user_id;
    const { memberId, sessionDatetime, exercisePlan, durationMinutes, notes } = req.body;

    if (!memberId || !sessionDatetime || !exercisePlan || !durationMinutes) {
        return res.status(400).json({ msg: 'Vui lòng nhập đầy đủ thông tin buổi tập.' });
    }

    try {
        const newSession = await WorkoutSession.create({
            memberUserId: memberId,
            trainerUserId: trainerId,
            sessionDatetime,
            exercisePlan,
            durationMinutes,
            trainerNotes: notes,
            status: 'Planned'
        });
        res.status(201).json(newSession);
    } catch (err) {
        res.status(500).send('Lỗi Server');
    }
};

/**
 * Chức năng: Cập nhật một buổi tập (nội dung hoặc trạng thái)
 * Tương ứng: Bước 6b, 6c
 * Route: PUT /api/trainer/sessions/:sessionId
 */
exports.updateWorkoutSession = async (req, res) => {
    const { sessionId } = req.params;
    // Destructure all possible fields from the request body
    const {
        exercisePlan, durationMinutes, notes, status,
        evaluationScore, evaluationComments, goalCompletionStatus, suggestionsForNextSession
    } = req.body;

    try {
        const session = await WorkoutSession.findByPk(sessionId);
        if (!session) {
            return res.status(404).json({ msg: 'Không tìm thấy buổi tập.' });
        }
        
        // --- Update General Info ---
        if(exercisePlan) session.exercisePlan = exercisePlan;
        if(durationMinutes) session.durationMinutes = durationMinutes;
        if(notes) session.trainerNotes = notes;
        if(status) session.status = status;

        // --- Update Evaluation Info ---
        if(evaluationScore !== undefined) session.evaluationScore = evaluationScore;
        if(evaluationComments) session.evaluationComments = evaluationComments;
        if(goalCompletionStatus) session.goalCompletionStatus = goalCompletionStatus;
        if(suggestionsForNextSession) session.suggestionsForNextSession = suggestionsForNextSession;

        await session.save(); // Sequelize will run validations before saving
        res.json(session);
    } catch(err) {
        // Luồng thay thế 7a, 8a
        if (err.name === 'SequelizeValidationError') {
            return res.status(400).json({ msg: 'Dữ liệu đánh giá không hợp lệ.', errors: err.errors });
        }
        console.error("Lỗi khi cập nhật buổi tập:", err);
        res.status(500).send('Lỗi Server');
    }
};