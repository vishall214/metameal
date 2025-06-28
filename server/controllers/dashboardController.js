const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
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
        goal: user.profile?.calorieGoal || 2000
      },
      protein: {
        consumed: totalProtein,
        goal: user.profile?.proteinGoal || 120
      },
      carbs: {
        consumed: totalCarbs,
        goal: user.profile?.carbGoal || 250
      },
      fats: {
        consumed: totalFats,
        goal: user.profile?.fatGoal || 65
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

module.exports = {
  getDashboard,
  updateDashboard,
  updateMealStatus,
  updateGoalStatus,
  addMeal,
  addGoal
}; 