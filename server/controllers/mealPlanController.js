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
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { profile, preferences } = user;
    const filters = profile.filters || [];
    const goals = profile.goals || [];
    const { calorieGoal, proteinGoal, carbGoal, fatGoal } = preferences;

    function scoreFood(food) {
      return (
        Math.abs(food.calories - calorieGoal) +
        Math.abs(food.protein - proteinGoal) +
        Math.abs(food.carbs - carbGoal) +
        Math.abs(food.fats - fatGoal)
      );
    }

    function goalFilter(food) {
      if (goals.includes('Weight Loss')) {
        return food.calories <= calorieGoal && food.protein >= proteinGoal * 0.7;
      }
      if (goals.includes('Muscle Gain')) {
        return food.protein >= proteinGoal * 0.8;
      }
      return true;
    }

    const startDate = new Date();
    const endDate = new Date();
    if (planType === 'weekly') endDate.setDate(endDate.getDate() + 6);

    const mealDistribution = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snack: 0.10
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = startDate.getDay();
    const daysToGenerate = planType === 'weekly' ? 7 : 1;
    const mealPlanItems = [];

    for (let i = 0; i < daysToGenerate; i++) {
      const dayIndex = (currentDay + i) % 7;
      const day = days[dayIndex];

      for (const [mealType, percentage] of Object.entries(mealDistribution)) {
        const targetCalories = Math.round(calorieGoal * percentage);
        const calorieRange = { min: targetCalories * 0.9, max: targetCalories * 1.1 };

        let foods = [];

        // 1. Try strict filter match + course in filter
        if (filters.length) {
          foods = await Food.find({
            calories: { $gte: calorieRange.min, $lte: calorieRange.max },
            filter: { $all: [...filters, mealType.toLowerCase()] }
          }).exec();
        }

        // 2. Any filter match + course in filter
        if ((!foods || foods.length < 1) && filters.length) {
          foods = await Food.find({
            calories: { $gte: calorieRange.min, $lte: calorieRange.max },
            filter: { $in: [...filters, mealType.toLowerCase()] }
          }).exec();
        }

        // 3. Match just course (which is inside filter)
        if (!foods || foods.length < 1) {
          foods = await Food.find({
            calories: { $gte: calorieRange.min * 0.8, $lte: calorieRange.max * 1.2 },
            filter: mealType.toLowerCase()
          }).exec();
        }

        // 4. Final fallback: any food with course in filter
        if (!foods || foods.length < 1) {
          foods = await Food.find({
            filter: mealType.toLowerCase()
          }).exec();
        }

        foods = foods
          .filter(goalFilter)
          .map(food => ({ ...food._doc, score: scoreFood(food) }))
          .sort((a, b) => a.score - b.score);

        const topFoods = foods.slice(0, 3);
        if (topFoods.length > 0) {
          const selectedMealIndex = Math.floor(Math.random() * topFoods.length);
          const meal = topFoods[selectedMealIndex];

          mealPlanItems.push({
            day,
            mealType,
            meal: {
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
            },
            targetNutrition: {
              calories: targetCalories,
              protein: proteinGoal * percentage,
              carbs: carbGoal * percentage,
              fat: fatGoal * percentage
            }
          });
        }
      }
    }

    const mealPlan = await MealPlan.create({
      user: req.user._id,
      name: `${planType === 'weekly' ? 'Weekly' : 'Daily'} Plan - ${startDate.toLocaleDateString()}`,
      startDate,
      endDate,
      preferences: {
        dietaryRestrictions: filters,
        calorieGoal,
        proteinGoal,
        carbGoal,
        fatGoal
      },
      meals: mealPlanItems.map(item => ({
        day: item.day,
        mealType: item.mealType,
        meal: item.meal.preview._id
      }))
    });

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