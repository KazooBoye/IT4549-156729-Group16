const { Feedback, User, Profile } = require('../models');

// @desc    Get all feedback for staff view
// @route   GET /api/feedback
// @access  Private (Staff/Owner)
// In src/controllers/feedbackController.js

exports.getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.findAll({
      include: [
        {
          model: User,
          as: 'SubmittingMember',
          attributes: ['email'],
          required: false, // Use LEFT JOIN: Get feedback even if the submitting user was deleted.
          include: [{
              model: Profile,
              as: 'Profile',
              attributes: ['full_name'],
              required: false, // Use LEFT JOIN: Get the user even if their profile is incomplete.
          }]
        }
      ],
      order: [['status', 'ASC'], ['created_at', 'DESC']],
    });

    res.json(feedbackList);


  } catch (err) {
    console.error("Error fetching feedback:", err);
    res.status(500).send('Server Error');
  }
};
// @desc    Update/Respond to a feedback item
// @route   PUT /api/feedback/:id
// @access  Private (Staff/Owner)
exports.updateFeedback = async (req, res) => {
  const { resolutionNotes, newStatus } = req.body;

  if (!resolutionNotes || !newStatus) {
    return res.status(400).json({ msg: 'Resolution notes and a new status are required.' });
  }

  try {
    const feedbackItem = await Feedback.findByPk(req.params.id);
    if (!feedbackItem) {
      return res.status(404).json({ msg: 'Feedback item not found.' });
    }

    feedbackItem.resolutionNotes = resolutionNotes;
    feedbackItem.status = newStatus;
    await feedbackItem.save();
    res.json(feedbackItem);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// @desc    Create a new feedback item (by a member)
// @route   POST /api/feedback
// @access  Private (Member)
exports.createFeedback = async (req, res) => {
    const { feedbackType, rating, comments } = req.body;
    const memberId = req.user.user_id;

    if(!feedbackType || !comments) {
        return res.status(400).json({ msg: 'Feedback type and comments are required.' });
    }

    try {
        const newFeedback = await Feedback.create({
            memberUserId: memberId,
            feedbackType,
            rating: rating || null,
            comments,
            status: 'Submitted'
        });
        res.status(201).json(newFeedback);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};