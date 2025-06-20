const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
  getActiveMealPlan,
  updateMealSelection,
  getWeeklyMealPlan,
  getTodaysMeals
} = require('../controllers/mealPlanController');

// Apply authentication middleware to all routes
router.use(protect);

// Base routes
router.route('/')
  .get(getMealPlans)
  .post(createMealPlan);

router.route('/:id')
  .get(getMealPlan)
  .put(updateMealPlan)
  .delete(deleteMealPlan);

// Meal plan generation routes
router.post('/generate', generateMealPlan);
router.get('/active', getActiveMealPlan);
router.put('/:id/meal', updateMealSelection);

// Get weekly meal plan
router.get('/weekly', getWeeklyMealPlan);

// Get today's meals
router.get('/today', getTodaysMeals);

module.exports = router; 