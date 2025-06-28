const mongoose = require('mongoose');
const User = require('../models/User');
const Food = require('../models/Food');
const MealPlan = require('../models/MealPlan');

// Mock the mealPlanController logic
async function testMealPlanGeneration() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/metameal');
    console.log('Connected to MongoDB');

    const userEmail = 'user@example.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('User found:', user.email);

    // Mock req.user
    const req = {
      user: { _id: user._id },
      body: { planType: 'daily' }
    };

    // Copy the meal plan generation logic
    const { profile, preferences } = user;
    const userDietaryFilters = (profile.filters || []).filter(f => 
      ['veg', 'non-veg', 'diabetes', 'thyroid', 'high BP'].includes(f)
    );
    const goals = profile.goals || [];
    let { calorieGoal, proteinGoal, carbGoal, fatGoal } = preferences;

    // Calculate goals if missing
    if ([calorieGoal, proteinGoal, carbGoal, fatGoal].some(val => 
      typeof val !== 'number' || isNaN(val) || val <= 0)) {
      const { age, height, weight, gender, activityLevel } = profile;
      let bmr = 0;
      if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      }
      const activityMultipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
      };
      const multiplier = activityMultipliers[activityLevel] || 1.2;
      calorieGoal = Math.round(bmr * multiplier);
      proteinGoal = Math.round((calorieGoal * 0.3) / 4);
      carbGoal = Math.round((calorieGoal * 0.4) / 4);
      fatGoal = Math.round((calorieGoal * 0.3) / 9);
    }

    console.log(`Goals: Calories: ${calorieGoal}, Protein: ${proteinGoal}g, Carbs: ${carbGoal}g, Fat: ${fatGoal}g`);

    // Test for one meal
    const mealType = 'breakfast';
    const percentage = 0.25;
    const targetCalories = Math.round(calorieGoal * percentage);
    const calorieRange = { min: targetCalories * 0.9, max: targetCalories * 1.1 };

    console.log(`Testing ${mealType} generation with target calories: ${targetCalories}`);

    // Try to find foods for breakfast
    const foods = await Food.find({
      calories: { $gte: calorieRange.min, $lte: calorieRange.max },
      course: 'breakfast'
    }).exec();

    console.log(`Found ${foods.length} foods for breakfast`);

    if (foods.length > 0) {
      const meal = foods[0];
      console.log('First meal object:', meal);
      console.log('Meal name:', meal.name);

      // Test the meal data creation
      const mealData = {
        _id: (meal._id ? meal._id.toString() : null) || new Date().getTime().toString(),
        name: meal.name || meal.title || 'Unknown Meal',
        photo: meal.photo || meal.image || 'https://via.placeholder.com/400x200?text=No+Image',
        calories: Number(meal.calories) || 0,
        course: meal.course || 'Unknown',
        cookingTime: Number(meal.cookingTime) || 30,
        description: meal.description || 'No description available',
        recipe: meal.recipe || 'Recipe not available',
        protein: Number(meal.protein) || 0,
        fats: Number(meal.fats) || 0,
        carbs: Number(meal.carbs) || 0,
        fibre: Number(meal.fibre) || 0,
        sugar: Number(meal.sugar) || 0,
        addedSugar: Number(meal.addedSugar) || 0,
        sodium: Number(meal.sodium) || 0,
        portionSize: Number(meal.portionSize) || 100,
        filter: Array.isArray(meal.filter) ? meal.filter : []
      };

      console.log('Created mealData:', mealData);
      console.log('SUCCESS: Meal data created without errors');
    } else {
      console.log('No foods found for breakfast');
    }

  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Load environment variables if available
require('dotenv').config();

testMealPlanGeneration();
