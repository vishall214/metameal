const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const User = require('../models/User'); // Assuming User model is defined in this file

// TODO: Import user controller functions once created
// const { getProfile, updateProfile } = require('../controllers/userController');

// Protected routes
router.use(protect);

// TODO: Add actual route handlers once controller is created
router.get('/profile', (req, res) => {
  res.json({ message: 'Profile route' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile route' });
});

router.post('/quiz', async (req, res) => {
  // We expect the request body to have: dietaryPreference, dietaryRestrictions, mealTypes
  // We'll update the user object accordingly
  const { dietaryPreference, dietaryRestrictions, mealTypes } = req.body;

  // Find the user and update
  const user = await User.findById(req.user._id);
  if (user) {
    user.dietaryPreference = dietaryPreference;
    user.dietaryRestrictions = dietaryRestrictions;
    user.mealTypes = mealTypes;
    user.quizCompleted = true;
    await user.save();
    res.json({ message: 'Quiz submitted successfully' });
  }
});

module.exports = router; 