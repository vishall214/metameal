const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// TODO: Import meal controller functions once created
// const { getMeals, getMealById, createMeal } = require('../controllers/mealController');

// Protected routes
router.use(protect);

router.get('/', (req, res) => {
  res.json({ message: 'Get all meals route' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get meal by id route' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create meal route' });
});

module.exports = router;