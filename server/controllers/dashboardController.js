const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const Dashboard = require('../models/Dashboard');
const asyncHandler = require('express-async-handler');

// @desc    Get user's dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const mealPlans = await MealPlan.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(1);
    
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
        goal: user.preferences?.calorieGoal || 2000
      },
      protein: {
        consumed: totalProtein,
        goal: user.preferences?.proteinGoal || 120
      },
      carbs: {
        consumed: totalCarbs,
        goal: user.preferences?.carbGoal || 250
      },
      fats: {
        consumed: totalFats,
        goal: user.preferences?.fatGoal || 65
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
          text: 'Drink 8 glasses of water', 
          completed: false 
        }
      ]
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

// @desc    Complete a goal for today
// @route   POST /api/dashboard/goals/complete
// @access  Private
const completeGoal = asyncHandler(async (req, res) => {
  try {
    const { goalType } = req.body; // 'calories', 'protein', 'water', 'exercise'
    
    if (!['calories', 'protein', 'water', 'exercise'].includes(goalType)) {
      return res.status(400).json({ error: 'Invalid goal type' });
    }

    // Find or create dashboard for user
    let dashboard = await Dashboard.findOne({ user: req.user.id });
    if (!dashboard) {
      dashboard = new Dashboard({ 
        user: req.user.id,
        dailyGoals: [],
        weeklyProgress: []
      });
    }

    // Check if goal is already completed today
    const todayGoals = dashboard.getTodayGoals();
    if (todayGoals && todayGoals[goalType]) {
      return res.status(400).json({ 
        error: `You've already completed your ${goalType} goal today! Come back tomorrow 🌅`,
        alreadyCompleted: true
      });
    }

    // Get current day index (0 = Monday, 6 = Sunday)
    const getCurrentDayIndex = () => {
      const today = new Date();
      const day = today.getDay();
      return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    };

    const currentDayIndex = getCurrentDayIndex();

    // Mark goal as completed for today
    dashboard.setTodayGoal(goalType, true);
    
    // Update weekly progress
    dashboard.updateWeeklyProgress(goalType, currentDayIndex, true);

    await dashboard.save();

    // Get updated goal data
    const updatedTodayGoals = dashboard.getTodayGoals();
    const weeklyProgress = dashboard.getWeeklyProgress(goalType);

    res.json({
      success: true,
      message: `🎉 ${goalType.charAt(0).toUpperCase() + goalType.slice(1)} goal completed! Great job!`,
      todayGoals: updatedTodayGoals,
      weeklyProgress: weeklyProgress,
      goalType: goalType
    });

  } catch (error) {
    console.error('Error completing goal:', error);
    res.status(500).json({ error: 'Failed to complete goal' });
  }
});

// @desc    Get goal progress data
// @route   GET /api/dashboard/goals/progress
// @access  Private
const getGoalProgress = asyncHandler(async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne({ user: req.user.id });
    
    if (!dashboard) {
      // Return empty progress if dashboard doesn't exist yet
      return res.json({
        todayGoals: { calories: false, protein: false, water: false, exercise: false },
        weeklyProgress: {
          calories: { current: 0, target: 7, dailyCompletions: new Array(7).fill(false) },
          protein: { current: 0, target: 7, dailyCompletions: new Array(7).fill(false) },
          water: { current: 0, target: 56, dailyCompletions: new Array(7).fill(false) },
          exercise: { current: 0, target: 7, dailyCompletions: new Array(7).fill(false) }
        }
      });
    }

    const todayGoals = dashboard.getTodayGoals() || { 
      calories: false, protein: false, water: false, exercise: false 
    };

    const weeklyProgress = {};
    ['calories', 'protein', 'water', 'exercise'].forEach(metric => {
      const progress = dashboard.getWeeklyProgress(metric);
      if (progress) {
        weeklyProgress[metric] = {
          current: progress.current,
          target: progress.target,
          dailyCompletions: progress.dailyCompletions
        };
      } else {
        const targets = { calories: 7, protein: 7, water: 56, exercise: 7 };
        weeklyProgress[metric] = {
          current: 0,
          target: targets[metric],
          dailyCompletions: new Array(7).fill(false)
        };
      }
    });

    res.json({
      todayGoals,
      weeklyProgress
    });

  } catch (error) {
    console.error('Error getting goal progress:', error);
    res.status(500).json({ error: 'Failed to get goal progress' });
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
  getGoalProgress
}; 