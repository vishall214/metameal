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
  rerollDay,
  addNextDay,
  updateRollingMealPlan
} = require('../controllers/mealPlanController');

// All routes are protected
router.use(protect);

// Specific routes first (before parameterized routes)
router.get('/active', getActiveMealPlan);
router.post('/generate', generateMealPlan);
router.post('/reroll-day', rerollDay);
router.post('/add-next-day', addNextDay);
router.post('/update-rolling', updateRollingMealPlan);

// Base routes
router.route('/')
  .get(getMealPlans)
  .post(createMealPlan);

// Parameterized routes last
router.route('/:id')
  .get(getMealPlan)
  .put(updateMealPlan)
  .delete(deleteMealPlan);

router.put('/:id/meal', updateMealSelection);

module.exports = router; 