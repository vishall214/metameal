const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealsByCategory,
  getMealsByTag,
  getRandomMeal,
  generateMeals,
  getRecommendedMeals,
  searchMeals
} = require('../controllers/mealController');

// TODO: Import meal controller functions once created
// const { getMeals, getMealById, createMeal } = require('../controllers/mealController');

// Protected routes
router.use(protect);

// Search route
router.get('/search', searchMeals);

// Base routes
router.route('/')
  .get(getMeals)
  .post(createMeal);

router.route('/:id')
  .get(getMeal)
  .put(updateMeal)
  .delete(deleteMeal);

// Category and tag routes
router.get('/category/:category', getMealsByCategory);
router.get('/tag/:tag', getMealsByTag);

// Meal generation and recommendation routes
router.get('/generate/plan', generateMeals);
router.get('/recommendations', getRecommendedMeals);
router.get('/random', getRandomMeal);

module.exports = router;