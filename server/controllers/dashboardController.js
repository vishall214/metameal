const Dashboard = require('../models/Dashboard');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get user's dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne({ user: req.user.id });

    // If no dashboard exists, create one with default values
    if (!dashboard) {
      const user = await User.findById(req.user.id);
      dashboard = await Dashboard.create({
        user: req.user.id,
        calories: {
          consumed: 0,
          goal: user.preferences?.calorieGoal || 2000
        },
        water: {
          consumed: 0,
          goal: 2.5
        },
        weight: {
          current: user.profile?.weight || 0,
          goal: user.profile?.goals?.includes('weight_loss') ? user.profile.weight - 5 : user.profile?.weight || 0
        },
        meals: [],
        goals: [
          { text: 'Complete daily water intake', completed: false },
          { text: 'Track all meals', completed: false },
          { text: 'Exercise for 30 minutes', completed: false }
        ]
      });
    }

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