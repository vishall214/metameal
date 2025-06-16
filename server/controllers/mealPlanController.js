const MealPlan = require('../models/MealPlan');
const Meal = require('../models/Meal');

// Get all meal plans for a user
exports.getMealPlans = async (req, res) => {
  try {
    const mealPlans = await MealPlan.find({ user: req.user.id })
      .populate('meals.meal')
      .sort({ createdAt: -1 });
    res.json(mealPlans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get specific meal plan
exports.getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('meals.meal');

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new meal plan
exports.createMealPlan = async (req, res) => {
  try {
    const mealPlan = new MealPlan({
      ...req.body,
      user: req.user.id
    });

    const savedMealPlan = await mealPlan.save();
    res.status(201).json(savedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update meal plan
exports.updateMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    ).populate('meals.meal');

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    res.json(mealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete meal plan
exports.deleteMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    res.json({ message: 'Meal plan deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate meal plan based on preferences
exports.generateMealPlan = async (req, res) => {
  try {
    const { preferences, startDate, endDate } = req.body;

    // Get meals matching preferences
    const meals = await Meal.find({
      $or: [
        { tags: { $in: preferences.dietaryRestrictions } },
        { 'nutrition.calories': { $lte: preferences.calorieGoal } }
      ]
    });

    if (meals.length === 0) {
      return res.status(404).json({ message: 'No meals found matching preferences' });
    }

    // Create meal plan
    const mealPlan = new MealPlan({
      user: req.user.id,
      startDate,
      endDate,
      preferences,
      meals: generateMealSchedule(meals, startDate, endDate),
      status: 'active'
    });

    const savedMealPlan = await mealPlan.save();
    res.status(201).json(savedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to generate meal schedule
function generateMealSchedule(meals, startDate, endDate) {
  const schedule = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  let currentDate = new Date(startDate);
  const end = new Date(endDate);

  while (currentDate <= end) {
    const day = days[currentDate.getDay()];
    
    for (const mealType of mealTypes) {
      const randomMeal = meals[Math.floor(Math.random() * meals.length)];
      schedule.push({
        day,
        mealType,
        meal: randomMeal._id
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedule;
} 