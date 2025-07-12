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

// Public routes (no authentication required)
router.get('/search', searchMeals);
router.get('/category/:category', getMealsByCategory);
router.get('/tag/:tag', getMealsByTag);
router.get('/random', getRandomMeal);
router.get('/:id', getMeal);
router.get('/', getMeals);

// Protected routes (authentication required)
router.use(protect);

// Routes that require authentication
router.post('/', createMeal);
router.put('/:id', updateMeal);
router.delete('/:id', deleteMeal);
router.get('/generate/plan', generateMeals);
router.get('/recommendations', getRecommendedMeals);

module.exports = router;