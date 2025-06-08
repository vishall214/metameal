const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
  getMeals,
  getMealsByFilters,
  getMealById,
  createMeal
} = require('../controllers/mealController');

router.get('/', protect, getMeals);
router.get('/filter', protect, getMealsByFilters);
router.get('/:id', protect, getMealById);
router.post('/', protect, createMeal);

module.exports = router;