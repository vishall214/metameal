const Meal = require('../models/Meal');

// Get all meals
const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find();
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single meal
const getMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create meal
const createMeal = async (req, res) => {
  try {
    const meal = await Meal.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update meal
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user is the owner of the meal
    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this meal' });
    }

    const updatedMeal = await Meal.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedMeal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete meal
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user is the owner of the meal
    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this meal' });
    }

    await meal.remove();
    res.json({ message: 'Meal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meals by category
const getMealsByCategory = async (req, res) => {
  try {
    const meals = await Meal.find({ categories: req.params.category });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meals by tag
const getMealsByTag = async (req, res) => {
  try {
    const meals = await Meal.find({ tags: req.params.tag });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get random meal
const getRandomMeal = async (req, res) => {
  try {
    const count = await Meal.countDocuments();
    const random = Math.floor(Math.random() * count);
    const meal = await Meal.findOne().skip(random);
    
    if (!meal) {
      return res.status(404).json({ message: 'No meals found' });
    }
    
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealsByCategory,
  getMealsByTag,
  getRandomMeal
};