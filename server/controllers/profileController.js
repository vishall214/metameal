const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    profile: user.profile,
    preferences: user.preferences,
    quizCompleted: user.quizCompleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    name,
    age,
    height,
    weight,
    gender,
    activityLevel,
    dietaryRestrictions,
    allergies,
    goals
  } = req.body;

  // Update basic user info
  if (name) user.name = name;

  // Update profile information
  if (age) user.profile.age = age;
  if (height) user.profile.height = height;
  if (weight) user.profile.weight = weight;
  if (gender) user.profile.gender = gender;
  if (activityLevel) user.profile.activityLevel = activityLevel;
  if (dietaryRestrictions) user.profile.dietaryRestrictions = dietaryRestrictions;
  if (allergies) user.profile.allergies = allergies;
  if (goals) user.profile.goals = goals;

  // Recalculate BMR and calorie goals if weight, height, age, or activity level changed
  if (weight || height || age || activityLevel) {
    let bmr = 0;
    const currentAge = age || user.profile.age;
    const currentWeight = weight || user.profile.weight;
    const currentHeight = height || user.profile.height;
    const currentActivity = activityLevel || user.profile.activityLevel;

    // Calculate BMR using Harris-Benedict equation
    if (user.profile.gender === 'male') {
      bmr = 88.362 + (13.397 * currentWeight) + (4.799 * currentHeight) - (5.677 * currentAge);
    } else {
      bmr = 447.593 + (9.247 * currentWeight) + (3.098 * currentHeight) - (4.330 * currentAge);
    }

    // Apply activity level multiplier
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    };
    const dailyCalories = Math.round(bmr * activityMultipliers[currentActivity]);

    // Update nutrition goals
    user.preferences.calorieGoal = dailyCalories;
    user.preferences.proteinGoal = Math.round((dailyCalories * 0.3) / 4); // 30% of calories from protein
    user.preferences.carbGoal = Math.round((dailyCalories * 0.4) / 4);    // 40% of calories from carbs
    user.preferences.fatGoal = Math.round((dailyCalories * 0.3) / 9);     // 30% of calories from fat
  }

  await user.save();

  res.json({
    profile: user.profile,
    preferences: user.preferences
  });
});

// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    mealTypes,
    cuisineTypes,
    calorieGoal,
    proteinGoal,
    carbGoal,
    fatGoal
  } = req.body;

  // Update preferences
  if (mealTypes) user.preferences.mealTypes = mealTypes;
  if (cuisineTypes) user.preferences.cuisineTypes = cuisineTypes;
  if (calorieGoal) user.preferences.calorieGoal = calorieGoal;
  if (proteinGoal) user.preferences.proteinGoal = proteinGoal;
  if (carbGoal) user.preferences.carbGoal = carbGoal;
  if (fatGoal) user.preferences.fatGoal = fatGoal;

  await user.save();

  res.json({
    preferences: user.preferences
  });
});

// @desc    Get user nutrition goals
// @route   GET /api/profile/nutrition
// @access  Private
const getNutritionGoals = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { calorieGoal, proteinGoal, carbGoal, fatGoal } = user.preferences;

  res.json({
    dailyGoals: {
      calories: calorieGoal,
      macros: {
        protein: proteinGoal,
        carbs: carbGoal,
        fat: fatGoal
      }
    },
    mealDistribution: {
      breakfast: { calories: Math.round(calorieGoal * 0.25) },
      lunch: { calories: Math.round(calorieGoal * 0.35) },
      dinner: { calories: Math.round(calorieGoal * 0.30) },
      snack: { calories: Math.round(calorieGoal * 0.10) }
    }
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  getNutritionGoals
}; 