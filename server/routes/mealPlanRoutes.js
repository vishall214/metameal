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
  updateMealSelection
} = require('../controllers/mealPlanController');

// All routes are protected
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

module.exports = router; 