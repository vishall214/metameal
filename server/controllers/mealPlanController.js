const MealPlan = require('../models/MealPlan');
const Food = require('../models/Food');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Get all meal plans for a user
// @route   GET /api/meal-plans
// @access  Private
const getMealPlans = asyncHandler(async (req, res) => {
  const mealPlans = await MealPlan.find({ user: req.user._id })
    .populate('meals.meal')
    .sort({ createdAt: -1 });
  res.json(mealPlans);
});

// @desc    Get specific meal plan
// @route   GET /api/meal-plans/:id
// @access  Private
const getMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOne({
    _id: req.params.id,
    user: req.user._id
  }).populate('meals.meal');

  if (!mealPlan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }

  res.json(mealPlan);
});

// @desc    Create new meal plan
// @route   POST /api/meal-plans
// @access  Private
const createMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = new MealPlan({
    ...req.body,
    user: req.user._id
  });

  const savedMealPlan = await mealPlan.save();
  res.status(201).json(savedMealPlan);
});

// @desc    Update meal plan
// @route   PUT /api/meal-plans/:id
// @access  Private
const updateMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  ).populate('meals.meal');

  if (!mealPlan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }

  res.json(mealPlan);
});

// @desc    Delete meal plan
// @route   DELETE /api/meal-plans/:id
// @access  Private
const deleteMealPlan = asyncHandler(async (req, res) => {
  const mealPlan = await MealPlan.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!mealPlan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }

  res.json({ message: 'Meal plan deleted' });
});

// @desc    Generate meal plan based on user profile
// @route   POST /api/meal-plans/generate
// @access  Private
const generateMealPlan = asyncHandler(async (req, res) => {
  const { planType = 'daily' } = req.body;

  try {
    // Get user profile and preferences
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { profile, preferences } = user;
    
    // Calculate date range
    const startDate = new Date();
    const endDate = new Date();
    if (planType === 'weekly') {
      endDate.setDate(endDate.getDate() + 6);
    }

    // Calculate meal calorie distribution
    const mealDistribution = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snack: 0.10
    };

    // Find suitable meals for each meal type
    const mealPlanItems = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = startDate.getDay();
    const daysToGenerate = planType === 'weekly' ? 7 : 1;

    for (let i = 0; i < daysToGenerate; i++) {
      const dayIndex = (currentDay + i) % 7;
      const day = days[dayIndex];

      for (const [mealType, percentage] of Object.entries(mealDistribution)) {
        const targetCalories = Math.round(preferences.calorieGoal * percentage);
        const calorieRange = {
          min: targetCalories * 0.9,
          max: targetCalories * 1.1
        };

        // Calculate macro targets for this meal
        const mealMacroTargets = {
          protein: Math.round((targetCalories * 0.3) / 4), // 30% from protein
          carbs: Math.round((targetCalories * 0.4) / 4),   // 40% from carbs
          fat: Math.round((targetCalories * 0.3) / 9)      // 30% from fat
        };

        // Query meals matching user preferences and nutritional needs
        let meals = await Food.find({
          course: mealType.toLowerCase(),
          calories: {
            $gte: calorieRange.min,
            $lte: calorieRange.max
          },
          // Filter by dietary restrictions
          filter: {
            $nin: profile.dietaryRestrictions || []
          },
          // Match macro nutrients within 20% range
          protein: {
            $gte: mealMacroTargets.protein * 0.8,
            $lte: mealMacroTargets.protein * 1.2
          },
          carbs: {
            $gte: mealMacroTargets.carbs * 0.8,
            $lte: mealMacroTargets.carbs * 1.2
          },
          fats: {
            $gte: mealMacroTargets.fat * 0.8,
            $lte: mealMacroTargets.fat * 1.2
          }
        }).exec();

        // If no exact matches, relax constraints gradually
        if (meals.length === 0) {
          meals = await Food.find({
            course: mealType.toLowerCase(),
            calories: {
              $gte: calorieRange.min * 0.8,
              $lte: calorieRange.max * 1.2
            },
            filter: {
              $nin: profile.dietaryRestrictions || []
            }
          }).limit(3).exec();
        }

        // Format meals for response
        const formattedMeals = meals.map(meal => ({
          preview: {
            _id: meal._id.toString(),
            name: meal.name,
            photo: meal.photo,
            calories: meal.calories,
            course: meal.course,
            cookingTime: meal.cookingTime
          },
          details: {
            description: meal.description,
            recipe: meal.recipe,
            nutritionalInfo: {
              protein: meal.protein,
              fats: meal.fats,
              carbs: meal.carbs,
              fibre: meal.fibre,
              sugar: meal.sugar,
              addedSugar: meal.addedSugar,
              sodium: meal.sodium
            },
            portionSize: meal.portionSize,
            filter: meal.filter
          }
        }));

        if (formattedMeals.length > 0) {
          // Select one meal randomly for this slot
          const selectedMealIndex = Math.floor(Math.random() * formattedMeals.length);
          
          mealPlanItems.push({
            day,
            mealType,
            meal: formattedMeals[selectedMealIndex],
            targetNutrition: {
              calories: targetCalories,
              ...mealMacroTargets
            }
          });
        }
      }
    }

    // Create new meal plan
    const mealPlan = await MealPlan.create({
      user: req.user._id,
      name: `${planType === 'weekly' ? 'Weekly' : 'Daily'} Plan - ${startDate.toLocaleDateString()}`,
      startDate,
      endDate,
      preferences: {
        dietaryRestrictions: profile.dietaryRestrictions || [],
        allergies: profile.allergies || [],
        calorieGoal: preferences.calorieGoal,
        proteinGoal: preferences.proteinGoal,
        carbGoal: preferences.carbGoal,
        fatGoal: preferences.fatGoal
      },
      meals: mealPlanItems.map(item => ({
        day: item.day,
        mealType: item.mealType,
        meal: item.meal.preview._id
      }))
    });

    // Return meal plan with full meal details
    res.status(201).json({
      success: true,
      mealPlan: {
        ...mealPlan.toObject(),
        meals: mealPlanItems
      }
    });

  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get current active meal plan
// @route   GET /api/meal-plans/active
// @access  Private
const getActiveMealPlan = asyncHandler(async (req, res) => {
  try {
    const activePlan = await MealPlan.findOne({
      user: req.user._id,
      status: 'active',
      endDate: { $gte: new Date() }
    }).populate({
      path: 'meals.meal',
      model: 'Food'
    });

    if (!activePlan) {
      res.status(404);
      throw new Error('No active meal plan found');
    }

    // Format the response
    const formattedPlan = {
      ...activePlan.toObject(),
      meals: activePlan.meals.map(meal => ({
        day: meal.day,
        mealType: meal.mealType,
        meal: {
          preview: {
            _id: meal.meal._id.toString(),
            name: meal.meal.name,
            photo: meal.meal.photo,
            calories: meal.meal.calories,
            course: meal.meal.course,
            cookingTime: meal.meal.cookingTime
          },
          details: {
            description: meal.meal.description,
            recipe: meal.meal.recipe,
            nutritionalInfo: {
              protein: meal.meal.protein,
              fats: meal.meal.fats,
              carbs: meal.meal.carbs,
              fibre: meal.meal.fibre,
              sugar: meal.meal.sugar,
              addedSugar: meal.meal.addedSugar,
              sodium: meal.meal.sodium
            },
            portionSize: meal.meal.portionSize,
            filter: meal.meal.filter
          }
        }
      }))
    };

    res.json({
      success: true,
      data: formattedPlan
    });
  } catch (error) {
    console.error('Error fetching active meal plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Update meal selection in plan
// @route   PUT /api/meal-plans/:id/meal
// @access  Private
const updateMealSelection = asyncHandler(async (req, res) => {
  const { mealId, day, mealType } = req.body;

  const mealPlan = await MealPlan.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!mealPlan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }

  // Find and update the specific meal
  const mealIndex = mealPlan.meals.findIndex(
    m => m.day === day && m.mealType === mealType
  );

  if (mealIndex === -1) {
    res.status(404);
    throw new Error('Meal not found in plan');
  }

  mealPlan.meals[mealIndex].meal = mealId;
  await mealPlan.save();

  res.json(mealPlan);
});

module.exports = {
  getMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
  getActiveMealPlan,
  updateMealSelection
}; 