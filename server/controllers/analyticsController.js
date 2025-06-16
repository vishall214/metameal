const User = require('../models/User');
const Meal = require('../models/Meal');

// Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's meal history
    const meals = await Meal.find({ user: userId });

    // Calculate analytics
    const analytics = {
      totalMeals: meals.length,
      averageCalories: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.calories, 0) / meals.length || 0,
      averageProtein: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.protein, 0) / meals.length || 0,
      averageCarbs: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.carbs, 0) / meals.length || 0,
      averageFat: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.fat, 0) / meals.length || 0,
      mealTypes: meals.reduce((acc, meal) => {
        meal.categories.forEach(category => {
          acc[category] = (acc[category] || 0) + 1;
        });
        return acc;
      }, {}),
      tags: meals.reduce((acc, meal) => {
        meal.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meal analytics
const getMealAnalytics = async (req, res) => {
  try {
    const meals = await Meal.find();

    // Calculate analytics
    const analytics = {
      totalMeals: meals.length,
      averageCalories: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.calories, 0) / meals.length || 0,
      averageProtein: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.protein, 0) / meals.length || 0,
      averageCarbs: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.carbs, 0) / meals.length || 0,
      averageFat: meals.reduce((acc, meal) => acc + meal.nutritionalInfo.fat, 0) / meals.length || 0,
      mealTypes: meals.reduce((acc, meal) => {
        meal.categories.forEach(category => {
          acc[category] = (acc[category] || 0) + 1;
        });
        return acc;
      }, {}),
      tags: meals.reduce((acc, meal) => {
        meal.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {})
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserAnalytics,
  getMealAnalytics
}; 