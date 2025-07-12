const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const asyncHandler = require('express-async-handler');

// Helper function to get dashboard data
const getDashboardData = async (userId) => {
  const user = await User.findById(userId);
  const mealPlans = await MealPlan.find({ user: userId }).sort({ createdAt: -1 }).limit(1);
  
  // Get today's day name
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  const todayDate = new Date().toISOString().split('T')[0];
  
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

  // Get today's goal completions
  const todayCompletions = user.dailyGoalCompletions.get(todayDate) || {
    breakfast: false,
    lunch: false,
    dinner: false,
    water: false
  };

  return {
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
        completed: todayCompletions.breakfast || todayMeals.some(meal => meal.mealType === 'breakfast')
      },
      { 
        id: 'lunch',
        text: 'Eat lunch', 
        completed: todayCompletions.lunch || todayMeals.some(meal => meal.mealType === 'lunch')
      },
      { 
        id: 'dinner',
        text: 'Eat dinner', 
        completed: todayCompletions.dinner || todayMeals.some(meal => meal.mealType === 'dinner')
      },
      { 
        id: 'water',
        text: 'Drink 8 glasses of water', 
        completed: todayCompletions.water
      }
    ]
  };
};

// @desc    Get user's dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  try {
    const dashboard = await getDashboardData(req.user.id);
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
  try {
    // For now, this is a placeholder since general dashboard updates aren't implemented
    // This would typically update user preferences or dashboard settings
    res.json({ message: 'Dashboard updated' });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Failed to update dashboard' });
  }
});

// @desc    Update meal status
// @route   PUT /api/dashboard/meals/:mealId
// @access  Private
const updateMealStatus = asyncHandler(async (req, res) => {
  try {
    const { mealId } = req.params;
    const { completed } = req.body;

    // For now, this is a placeholder since meal status tracking isn't implemented
    // In the future, this could track individual meal consumption
    res.json({ message: 'Meal status updated', mealId, completed });
  } catch (error) {
    console.error('Error updating meal status:', error);
    res.status(500).json({ error: 'Failed to update meal status' });
  }
});
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

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Initialize today's completions if they don't exist
    if (!user.dailyGoalCompletions.get(today)) {
      user.dailyGoalCompletions.set(today, {
        date: new Date(),
        breakfast: false,
        lunch: false,
        dinner: false,
        water: false
      });
    }

    // Update the specific goal
    const todayCompletions = user.dailyGoalCompletions.get(today);
    if (goalId in todayCompletions) {
      todayCompletions[goalId] = completed;
      user.dailyGoalCompletions.set(today, todayCompletions);
    } else {
      return res.status(400).json({ error: 'Invalid goal ID' });
    }

    await user.save();
    
    // Return updated dashboard data
    const dashboardData = await getDashboardData(req.user.id);
    res.json(dashboardData);
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