const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const Dashboard = require('../models/Dashboard');
const GoalCalculationService = require('../services/GoalCalculationService');
const asyncHandler = require('express-async-handler');

// @desc    Get user's dashboard data with smart goal calculations
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mealPlans = await MealPlan.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(1);
    
    // Get smart calculated goals
    let calculatedGoals;
    try {
      calculatedGoals = await GoalCalculationService.calculateUserGoals(req.user.id);
    } catch (error) {
      console.log('Using fallback goals due to:', error.message);
      calculatedGoals = {
        calories: user.preferences?.calorieGoal || 2000,
        protein: user.preferences?.proteinGoal || 120,
        carbs: user.preferences?.carbGoal || 250,
        fats: user.preferences?.fatGoal || 65,
        water: 8,
        exercise: 30,
        calculated: false
      };
    }
    
    // Get today's day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    let todayMeals = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    if (mealPlans.length > 0) {
      const currentPlan = mealPlans[0];
      todayMeals = (currentPlan.meals || []).filter(meal => meal.day === today);
      
      // Calculate nutrition totals for today
      todayMeals.forEach(mealItem => {
        const meal = mealItem.meal;
        if (meal) {
          totalCalories += Number(meal.calories) || 0;
          totalProtein += Number(meal.protein) || 0;
          totalCarbs += Number(meal.carbs) || 0;
          totalFats += Number(meal.fats) || 0;
        }
      });
    }

    const dashboard = {
      user: {
        name: user.name,
        email: user.email
      },
      calories: {
        consumed: totalCalories,
        goal: calculatedGoals.calories
      },
      protein: {
        consumed: totalProtein,
        goal: calculatedGoals.protein
      },
      carbs: {
        consumed: totalCarbs,
        goal: calculatedGoals.carbs
      },
      fats: {
        consumed: totalFats,
        goal: calculatedGoals.fats
      },
      todayMeals: todayMeals,
      totalMealsPlanned: mealPlans.length > 0 ? mealPlans[0].meals?.length || 0 : 0,
      goals: [
        { 
          id: 'breakfast',
          text: 'Eat breakfast', 
          completed: todayMeals.some(meal => meal.mealType === 'breakfast')
        },
        { 
          id: 'lunch',
          text: 'Eat lunch', 
          completed: todayMeals.some(meal => meal.mealType === 'lunch')
        },
        { 
          id: 'dinner',
          text: 'Eat dinner', 
          completed: todayMeals.some(meal => meal.mealType === 'dinner')
        },
        { 
          id: 'water',
          text: `Drink ${calculatedGoals.water} glasses of water`, 
          completed: false 
        }
      ],
      calculationDetails: {
        calculated: calculatedGoals.calculated,
        bmr: calculatedGoals.bmr,
        tdee: calculatedGoals.tdee,
        adjustments: calculatedGoals.adjustments
      }
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// @desc    Update dashboard data
// @route   PUT /api/dashboard
// @access  Private
const updateDashboard = asyncHandler(async (req, res) => {
  const dashboard = await Dashboard.findOne({ user: req.user._id });

  if (!dashboard) {
    res.status(404);
    throw new Error('Dashboard not found');
  }

  const updatedDashboard = await Dashboard.findOneAndUpdate(
    { user: req.user._id },
    {
      ...req.body,
      lastUpdated: Date.now()
    },
    { new: true, runValidators: true }
  );

  res.status(200).json(updatedDashboard);
});

// @desc    Update meal status
// @route   PUT /api/dashboard/meals/:mealId
// @access  Private
const updateMealStatus = asyncHandler(async (req, res) => {
  try {
    const { mealId } = req.params;
    const { completed } = req.body;

    const dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const meal = dashboard.meals.id(mealId);
    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    meal.completed = completed;
    if (completed) {
      dashboard.calories.consumed += meal.calories;
    } else {
      dashboard.calories.consumed -= meal.calories;
    }

    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    console.error('Error updating meal status:', error);
    res.status(500).json({ error: 'Failed to update meal status' });
  }
});

// @desc    Update goal status
// @route   PUT /api/dashboard/goals/:goalId
// @access  Private
const updateGoalStatus = asyncHandler(async (req, res) => {
  try {
    const { goalId } = req.params;
    const { completed } = req.body;

    const dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    const goal = dashboard.goals.id(goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.completed = completed;
    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    console.error('Error updating goal status:', error);
    res.status(500).json({ error: 'Failed to update goal status' });
  }
});

// @desc    Add meal to dashboard
// @route   POST /api/dashboard/meals
// @access  Private
const addMeal = asyncHandler(async (req, res) => {
  try {
    const { name, time, calories } = req.body;

    const dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    dashboard.meals.push({ name, time, calories, completed: false });
    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ error: 'Failed to add meal' });
  }
});

// @desc    Add goal to dashboard
// @route   POST /api/dashboard/goals
// @access  Private
const addGoal = asyncHandler(async (req, res) => {
  try {
    const { text } = req.body;

    const dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    dashboard.goals.push({ text, completed: false });
    await dashboard.save();
    res.json(dashboard);
  } catch (error) {
    console.error('Error adding goal:', error);
    res.status(500).json({ error: 'Failed to add goal' });
  }
});

// @route   POST /api/dashboard/goals/complete
// @access  Private
const completeGoal = asyncHandler(async (req, res) => {
  try {
    const { goalType } = req.body; // 'calories', 'protein', 'water', 'exercise'

    if (!['calories', 'protein', 'water', 'exercise'].includes(goalType)) {
      return res.status(400).json({ error: 'Invalid goal type' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let calculatedGoals;
    try {
      calculatedGoals = await GoalCalculationService.calculateUserGoals(req.user.id);
    } catch (error) {
      console.log('Using fallback goals for completion:', error.message);
      calculatedGoals = {
        calories: user.preferences?.calorieGoal || 2000,
        protein: user.preferences?.proteinGoal || 120,
        water: 8,
        exercise: 30
      };
    }

    let dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      dashboard = new Dashboard({
        user: req.user.id,
        weeklyProgress: {
          calories: 0,
          protein: 0,
          water: 0,
          exercise: 0
        },
        todaysGoals: {
          calories: false,
          protein: false,
          water: false,
          exercise: false
        }
      });
      await dashboard.save();
    }

    const todayGoals = dashboard.getTodaysGoals();
    if (todayGoals && todayGoals[goalType]) {
      return res.status(400).json({
        error: `You've already completed your ${goalType} goal today! Come back tomorrow 🌅`,
        alreadyCompleted: true
      });
    }

    dashboard.setTodaysGoal(goalType, true);

    // Use daily contribution for exercise instead of weekly total
    let todaysContribution;
    if (goalType === 'exercise') {
      todaysContribution = Math.round((calculatedGoals.exercise || 210) / 7);
    } else {
      todaysContribution = calculatedGoals[goalType] || 0;
    }

    dashboard.updateWeeklyProgress(goalType, todaysContribution);
    await dashboard.save();

    // Store progress in user.progress[]
    const todayKey = new Date().toDateString();
    const userProgress = user.progress || [];

    let todayRecord = userProgress.find(p => p.date === todayKey);
    if (!todayRecord) {
      todayRecord = {
        date: todayKey,
        calories: false,
        protein: false,
        water: false,
        exercise: false
      };
      userProgress.push(todayRecord);
    }
    todayRecord[goalType] = true;

    user.progress = userProgress;
    await user.save();

    res.json({
      success: true,
      message: `🎉 ${goalType.charAt(0).toUpperCase() + goalType.slice(1)} goal completed! Great job! (+${todaysContribution} ${goalType === 'calories' ? 'kcal' : goalType === 'protein' ? 'g' : goalType === 'water' ? 'glasses' : 'min'})`,
      todayGoals: dashboard.getTodaysGoals(),
      goalType: goalType,
      todaysContribution: todaysContribution,
      calculatedGoals: calculatedGoals
    });

  } catch (error) {
    console.error('Error completing goal:', error);
    res.status(500).json({ error: 'Failed to complete goal' });
  }
});

// @route   GET /api/dashboard/goals/progress
// @access  Private
const getGoalProgress = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let calculatedGoals;
    try {
      calculatedGoals = await GoalCalculationService.calculateUserGoals(req.user.id);
    } catch (error) {
      console.log('Using fallback goals for progress:', error.message);
      calculatedGoals = {
        calories: user.preferences?.calorieGoal || 2000,
        protein: user.preferences?.proteinGoal || 120,
        carbs: user.preferences?.carbGoal || 250,
        fats: user.preferences?.fatGoal || 65,
        water: 8,
        exercise: 210,
        calculated: false
      };
    }

    let dashboard = await Dashboard.findOne({ user: req.user.id });
    
    if (!dashboard) {
      dashboard = new Dashboard({ 
        user: req.user.id,
        weeklyProgress: {
          calories: 0,
          protein: 0,
          water: 0,
          exercise: 0
        },
        todaysGoals: {
          calories: false,
          protein: false,
          water: false,
          exercise: false
        }
      });
      await dashboard.save();
    }

    await dashboard.initializeWeeklyProgress();

    let todayGoals = dashboard.getTodaysGoals() || { 
      calories: false, protein: false, water: false, exercise: false 
    };

    // Override with user.progress record for today
    const todayKey = new Date().toDateString();
    const todayDbRecord = user.progress?.find(p => p.date === todayKey);
    if (todayDbRecord) {
      todayGoals = {
        calories: todayDbRecord.calories || false,
        protein: todayDbRecord.protein || false,
        water: todayDbRecord.water || false,
        exercise: todayDbRecord.exercise || false
      };
    }

    const weeklyTargets = await dashboard.getWeeklyTargets();

    const weeklyProgress = {
      calories: {
        current: dashboard.weeklyProgress.calories,
        target: weeklyTargets.calories,
        dailyCompletions: dashboard.getWeeklyCompletions('calories')
      },
      protein: {
        current: dashboard.weeklyProgress.protein,
        target: weeklyTargets.protein,
        dailyCompletions: dashboard.getWeeklyCompletions('protein')
      },
      water: {
        current: dashboard.weeklyProgress.water,
        target: weeklyTargets.water,
        dailyCompletions: dashboard.getWeeklyCompletions('water')
      },
      exercise: {
        current: dashboard.weeklyProgress.exercise,
        target: weeklyTargets.exercise,
        dailyCompletions: dashboard.getWeeklyCompletions('exercise')
      }
    };

    const todayContributions = {
      calories: calculatedGoals.calories,
      protein: calculatedGoals.protein,
      water: calculatedGoals.water,
      exercise: Math.round(calculatedGoals.exercise / 7)
    };

    res.json({
      todayGoals,
      weeklyProgress,
      todayContributions,
      userGoals: {
        dailyCalories: calculatedGoals.calories,
        dailyProtein: calculatedGoals.protein,
        dailyCarbs: calculatedGoals.carbs,
        dailyFats: calculatedGoals.fats,
        dailyWater: calculatedGoals.water,
        weeklyExercise: calculatedGoals.exercise
      },
      calculationDetails: {
        calculated: calculatedGoals.calculated,
        bmr: calculatedGoals.bmr,
        tdee: calculatedGoals.tdee,
        adjustments: calculatedGoals.adjustments
      }
    });

  } catch (error) {
    console.error('Error getting goal progress:', error);
    res.status(500).json({ error: 'Failed to get goal progress' });
  }
});

// Helper function to calculate today's nutritional contribution from meals
const calculateTodaysNutritionFromMeals = async (userId) => {
  try {
    // Get today's day name
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    
    // Find user's active meal plan
    const activeMealPlan = await MealPlan.findOne({ 
      user: userId, 
      status: 'active' 
    }).populate('meals.meal');
    
    if (!activeMealPlan) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }
    
    // Filter meals for today
    const todaysMeals = activeMealPlan.meals.filter(meal => meal.day === today);
    
    // Calculate total nutrition from today's meals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    
    todaysMeals.forEach(mealItem => {
      const meal = mealItem.meal;
      if (meal) {
        totalCalories += Number(meal.calories) || 0;
        totalProtein += Number(meal.protein) || 0;
        totalCarbs += Number(meal.carbs) || 0;
        totalFats += Number(meal.fats) || 0;
      }
    });
    
    return {
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fats: Math.round(totalFats),
      mealsCount: todaysMeals.length
    };
    
  } catch (error) {
    console.error('Error calculating nutrition from meals:', error);
    return { calories: 0, protein: 0, carbs: 0, fats: 0, mealsCount: 0 };
  }
};

// @route   GET /api/dashboard/nutrition/today
// @access  Private
const getTodaysNutrition = asyncHandler(async (req, res) => {
  try {
    const nutrition = await calculateTodaysNutritionFromMeals(req.user.id);
    
    res.json({
      success: true,
      nutrition: nutrition,
      date: new Date().toDateString()
    });
    
  } catch (error) {
    console.error('Error getting today\'s nutrition:', error);
    res.status(500).json({ error: 'Failed to get today\'s nutrition' });
  }
});
// @route   POST /api/dashboard/goals/recalculate
// @access  Private
const recalculateGoals = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Recalculate goals using the smart service
    const result = await GoalCalculationService.updateUserPreferences(userId);
    
    res.json({
      success: true,
      message: 'Goals recalculated successfully!',
      user: result.user,
      calculatedGoals: result.calculatedGoals
    });

  } catch (error) {
    console.error('Error recalculating goals:', error);
    res.status(500).json({ 
      error: 'Failed to recalculate goals',
      details: error.message 
    });
  }
});

module.exports = {
  getDashboard,
  updateDashboard,
  updateMealStatus,
  updateGoalStatus,
  addMeal,
  addGoal,
  completeGoal,
  getGoalProgress,
  getTodaysNutrition,
  recalculateGoals
};