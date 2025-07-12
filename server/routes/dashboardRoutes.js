const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getDashboard,
  updateMealStatus,
  updateGoalStatus,
  addMeal,
  addGoal,
  completeGoal,
  getGoalProgress,
  getTodaysNutrition,
  recalculateGoals
} = require('../controllers/dashboardController');

// Base route: /api/dashboard
router.use(protect); // All dashboard routes require authentication

// Get and update dashboard
router.get('/', getDashboard);

// Meal routes
router.post('/meals', addMeal);
router.put('/meals/:mealId', updateMealStatus);

// Goal routes
router.post('/goals', addGoal);
router.put('/goals/:goalId', updateGoalStatus);
router.post('/goals/complete', completeGoal);
router.get('/goals/progress', getGoalProgress);

// Nutrition routes
router.get('/nutrition/today', getTodaysNutrition);

// Goal calculation routes
router.post('/goals/recalculate', recalculateGoals);

module.exports = router;