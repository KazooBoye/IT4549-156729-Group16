const { PersonalTrainingBooking, User, Profile } = require('../models');

// @desc    Create a new personal training booking
// @route   POST /api/bookings
// @access  Private (Member)
exports.createBooking = async (req, res) => {
  const memberUserId = req.user.user_id;
  const { trainer_user_id, session_datetime, duration_minutes, notes_member, subscription_id } = req.body;

  if (!trainer_user_id || !session_datetime) {
    return res.status(400).json({ msg: 'Trainer and session date/time are required.' });
  }

  try {
    const newBooking = await PersonalTrainingBooking.create({
      memberUserId,
      trainerUserId: trainer_user_id,
      sessionDatetime: session_datetime,
      durationMinutes: duration_minutes,
      notesMember: notes_member,
      subscriptionId: subscription_id,
      status: 'scheduled'
    });
    res.status(201).json({ msg: 'Booking created successfully', booking: newBooking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ msg: 'Server error while creating booking.' });
  }
};

// @desc    Get bookings for the logged-in member
// @route   GET /api/bookings/member
// @access  Private (Member)
exports.getMemberBookings = async (req, res) => {
  const memberUserId = req.user.user_id;

  try {
    const bookings = await PersonalTrainingBooking.findAll({
      where: { memberUserId: memberUserId },
      // Include the Trainer's details (User and their Profile)
      include: [{
        model: User,
        as: 'Trainer',
        attributes: ['email'],
        include: [{
          model: Profile,
          as: 'Profile',
          attributes: ['full_name']
        }]
      }],
      order: [['sessionDatetime', 'DESC']]
    });

    // Format the response to match the frontend's expectations
    const formattedBookings = bookings.map(b => ({
      booking_id: b.booking_id,
      session_datetime: b.sessionDatetime,
      duration_minutes: b.durationMinutes,
      status: b.status,
      notes_member: b.notesMember,
      notes_trainer: b.notesTrainer,
      trainer_name: b.Trainer?.Profile?.full_name || 'N/A', // Safely access nested data
      trainer_email: b.Trainer?.email || 'N/A'
    }));

    res.json(formattedBookings);
  } catch (error) {
    console.error('Error fetching member bookings:', error);
    res.status(500).json({ msg: 'Server error while fetching bookings.' });
  }
};