const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const completeQuiz = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const profileUpdate = { ...req.body.profile };
  if (Array.isArray(req.body.profile?.filters)) {
    profileUpdate.filters = req.body.profile.filters;
  }
  if (Array.isArray(req.body.profile?.goals)) {
    profileUpdate.goals = req.body.profile.goals;
  }
  user.profile = { ...user.profile, ...profileUpdate };
  user.preferences = { ...user.preferences, ...req.body.preferences };
  user.quizCompleted = true;
  await user.save();

  res.json({ success: true, quizCompleted: true });
});

module.exports = { completeQuiz };
