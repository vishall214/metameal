const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getProfile,
  updateProfile,
  updatePreferences,
  getNutritionGoals
} = require('../controllers/profileController');

// All routes are protected
router.use(protect);

// Profile routes
router.route('/')
  .get(getProfile)
  .put(updateProfile);

// Preferences routes
router.route('/preferences')
  .put(updatePreferences);

// Nutrition routes
router.route('/nutrition')
  .get(getNutritionGoals);

module.exports = router; 