const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Food = require('../models/Food');
const MealPlan = require('../models/MealPlan');

/**
 * Generate JWT token for testing
 * @param {string} userId - User ID
 * @returns {string} JWT token
 */
const generateAuthToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Create a test user
 * @param {Object} [overrides={}] - User data overrides
 * @returns {Promise<Object>} Created user and auth token
 */
const createTestUser = async (overrides = {}) => {
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    quizCompleted: true,
    dietaryPreference: 'vegetarian',
    dietaryRestrictions: ['gluten'],
    mealTypes: ['breakfast', 'lunch', 'dinner'],
    ...overrides
  };

  // Hash password
  userData.password = await User.encryptPassword(userData.password);
  
  const user = await User.create(userData);
  const token = generateAuthToken(user._id);
  
  return { user, token };
};

/**
 * Create test meals
 * @param {number} count - Number of meals to create
 * @param {Object} [overrides={}] - Meal data overrides
 * @returns {Promise<Array>} Created meals
 */
const createTestMeals = async (count, overrides = {}) => {
  const meals = [];
  const courses = ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert'];
  
  for (let i = 0; i < count; i++) {
    const course = courses[i % courses.length];
    const meal = await Food.create({
      name: `Test Meal ${i + 1}`,
      description: `Test description ${i + 1}`,
      course,
      filter: ['vegetarian', course],
      calories: 300 + (i * 50),
      cookingTime: 15 + (i * 5),
      status: 'active',
      ...overrides
    });
    
    meals.push(meal);
  }
  
  return meals;
};

/**
 * Create a test meal plan
 * @param {Object} user - User object
 * @param {Array} meals - Array of meals
 * @param {Object} [overrides={}] - Meal plan data overrides
 * @returns {Promise<Object>} Created meal plan
 */
const createTestMealPlan = async (user, meals = [], overrides = {}) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealPlanData = {
    user: user._id,
    name: 'Test Meal Plan',
    description: 'Test meal plan description',
    startDate: new Date(),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 7 days from now
    days: {},
    preferences: {
      dietaryPreference: user.dietaryPreference,
      dietaryRestrictions: user.dietaryRestrictions,
      mealTypes: user.mealTypes
    },
    status: 'active',
    ...overrides
  };

  // Add meals to each day
  days.forEach(day => {
    mealPlanData.days[day] = meals.map(meal => ({
      course: meal.course,
      mealId: meal._id,
      name: meal.name,
      photo: meal.photo,
      calories: meal.calories,
      cookingTime: meal.cookingTime,
      completed: false,
      notes: ''
    }));
  });

  return await MealPlan.create(mealPlanData);
};

/**
 * Clean up test data
 * @returns {Promise<void>}
 */
const cleanupTestData = async () => {
  await User.deleteMany({});
  await Food.deleteMany({});
  await MealPlan.deleteMany({});
};

module.exports = {
  generateAuthToken,
  createTestUser,
  createTestMeals,
  createTestMealPlan,
  cleanupTestData
};
