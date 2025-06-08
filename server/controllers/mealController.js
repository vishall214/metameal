const Food = require('../models/Food');

// Get all meals
const getMeals = async (req, res) => {
  try {
    const meals = await Food.find({});
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meals by filters
const getMealsByFilters = async (req, res) => {
  try {
    const { filters } = req.query;
    const filterArray = filters.split(',');
    const meals = await Food.find({ filter: { $in: filterArray } });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meal by ID
const getMealById = async (req, res) => {
  try {
    const meal = await Food.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new meal
const createMeal = async (req, res) => {
  try {
    const meal = await Food.create(req.body);
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMeals,
  getMealsByFilters,
  getMealById,
  createMeal
};