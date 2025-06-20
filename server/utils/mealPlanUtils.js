const mongoose = require('mongoose');
const Food = require('../models/Food');
const { withTransaction } = require('./dbUtils');

/**
 * Get meals matching user preferences
 * @param {Object} user - User object with preferences
 * @param {Object} session - MongoDB session
 * @returns {Promise<Array>} - Array of meals grouped by course
 */
const getMatchingMeals = async (user, session) => {
  const { dietaryPreference, dietaryRestrictions = [], mealTypes = [] } = user;

  // Build the query based on user's preferences
  const matchStage = {
    status: 'active',
    $and: [
      { name: { $exists: true } },
      { filter: { $exists: true, $ne: [] } },
      { course: { $exists: true, $ne: '' } }
    ]
  };

  // Add dietary preference filter
  if (dietaryPreference && dietaryPreference !== 'none') {
    matchStage.filter = { $in: [dietaryPreference] };
  }

  // Add dietary restrictions filter
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    matchStage.filter = matchStage.filter || {};
    matchStage.filter.$nin = dietaryRestrictions;
  }

  // Add meal types filter
  if (mealTypes && mealTypes.length > 0) {
    matchStage.course = { $in: mealTypes };
  }

  // Use aggregation for better performance and flexibility
  const aggregationPipeline = [
    { $match: matchStage },
    // Add a random field for each meal
    { $addFields: { random: { $rand: {} } } },
    // Sort by the random field
    { $sort: { random: 1 } },
    // Group by course to get one random meal per course
    {
      $group: {
        _id: '$course',
        meals: { $push: '$$ROOT' },
        count: { $sum: 1 }
      }
    },
    // Project to get one random meal per course
    {
      $project: {
        course: '$_id',
        meal: { $arrayElemAt: ['$meals', 0] },
        count: 1,
        _id: 0
      }
    }
  ];

  // Execute aggregation
  const mealsByCourse = await Food.aggregate(aggregationPipeline).session(session);

  if (mealsByCourse.length === 0) {
    throw new Error('No meals found matching your preferences. Please try different preferences.');
  }

  // Transform the result into a more usable format
  return mealsByCourse.reduce((acc, item) => {
    acc[item.course] = item.meal;
    return acc;
  }, {});
};

/**
 * Generate a meal plan for a specific day
 * @param {Object} mealsMap - Meals grouped by course
 * @returns {Object} - Daily meal plan
 */
const generateDailyMealPlan = (mealsMap) => {
  const dailyMeals = [];
  
  // For each course type, add the meal to the day
  Object.entries(mealsMap).forEach(([course, meal]) => {
    if (meal) {
      dailyMeals.push({
        course,
        mealId: meal._id,
        name: meal.name,
        photo: meal.photo,
        calories: meal.calories,
        cookingTime: meal.cookingTime,
        completed: false,
        notes: ''
      });
    }
  });
  
  // Sort meals by course (breakfast, lunch, dinner, etc.)
  dailyMeals.sort((a, b) => {
    const order = ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert'];
    return order.indexOf(a.course) - order.indexOf(b.course);
  });
  
  return dailyMeals;
};

/**
 * Generate a meal plan for multiple days
 * @param {Object} user - User object
 * @param {Object} mealsMap - Meals grouped by course
 * @param {number} days - Number of days to generate
 * @returns {Object} - Meal plan object
 */
const generateMealPlan = (user, mealsMap, days = 7) => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const planDays = {};
  
  // Generate meals for each day
  for (let i = 0; i < days; i++) {
    const day = daysOfWeek[i % 7];
    planDays[day] = generateDailyMealPlan(mealsMap);
  }
  
  return {
    user: user._id,
    name: `Meal Plan for ${user.name || 'User'}`,
    description: `Personalized meal plan based on your ${user.dietaryPreference || 'dietary'} preferences`,
    startDate: new Date(),
    endDate: new Date(Date.now() + (days - 1) * 24 * 60 * 60 * 1000), // days from now
    days: planDays,
    preferences: {
      dietaryPreference: user.dietaryPreference,
      dietaryRestrictions: user.dietaryRestrictions,
      mealTypes: user.mealTypes
    },
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

module.exports = {
  getMatchingMeals,
  generateDailyMealPlan,
  generateMealPlan
};
