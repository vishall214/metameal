const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const mealPlanController = require('../controllers/mealPlanController');

// Protected routes
router.use(protect);

// Get user's meal plans
router.get('/', mealPlanController.getMealPlans);

// Get specific meal plan
router.get('/:id', mealPlanController.getMealPlan);

// Create new meal plan
router.post('/', mealPlanController.createMealPlan);

// Update meal plan
router.put('/:id', mealPlanController.updateMealPlan);

// Delete meal plan
router.delete('/:id', mealPlanController.deleteMealPlan);

// Generate meal plan from preferences
router.post('/generate', mealPlanController.generateMealPlan);

module.exports = router; 