const Dashboard = require('../models/Dashboard');
const User = require('../models/User');
const MealPlan = require('../models/MealPlan');
const asyncHandler = require('express-async-handler');

// @desc    Get user's dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
  try {
    let dashboard = await Dashboard.findOne({ user: req.user._id });

    // If no dashboard exists, create one with default values
    if (!dashboard) {
      const user = await User.findById(req.user._id);
      
      // Calculate daily goals if not set
      let calorieGoal = user.preferences?.calorieGoal || 2000;
      let proteinGoal = user.preferences?.proteinGoal || 150;
      
      if (!user.preferences?.calorieGoal && user.profile) {
        const { age, height, weight, gender, activityLevel } = user.profile;
        if (age && height && weight && gender && activityLevel) {
          // Calculate BMR using Harris-Benedict equation
          let bmr = 0;
          if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
          } else {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
          }
          // Activity multiplier
          const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very_active': 1.9
          };
          const multiplier = activityMultipliers[activityLevel] || 1.2;
          calorieGoal = Math.round(bmr * multiplier);
          proteinGoal = Math.round((calorieGoal * 0.3) / 4); // 30% of calories from protein
        }
      }
      
      // Create personalized goals based on user profile
      const goals = [];
      goals.push({ text: 'Complete daily water intake', completed: false });
      goals.push({ text: 'Track all meals', completed: false });
      
      if (user.profile?.goals?.includes('Weight Loss')) {
        goals.push({ text: 'Stay within calorie goal', completed: false });
      }
      if (user.profile?.goals?.includes('Muscle Gain')) {
        goals.push({ text: 'Meet protein target', completed: false });
      }
      if (!user.profile?.goals?.includes('Weight Loss') && !user.profile?.goals?.includes('Muscle Gain')) {
        goals.push({ text: 'Exercise for 30 minutes', completed: false });
      }
      
      dashboard = await Dashboard.create({
        user: req.user._id,
        calories: {
          consumed: 0,
          goal: calorieGoal
        },
        water: {
          consumed: 0,
          goal: 2.5
        },
        weight: {
          current: user.profile?.weight || 0,
          goal: user.profile?.goals?.includes('Weight Loss') ? 
            (user.profile.weight ? user.profile.weight - 5 : 70) : 
            user.profile?.weight || 70
        },
        meals: [],
        goals: goals
      });
    }

    // Check if we need to populate today's meals from active meal plan
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    if (dashboard.meals.length === 0) {
      // Find active meal plan
      const activeMealPlan = await MealPlan.findOne({ 
        user: req.user._id, 
        status: 'active' 
      });
      
      if (activeMealPlan && activeMealPlan.meals) {
        // Get today's meals from the meal plan
        const todaysMeals = activeMealPlan.meals.filter(meal => meal.day === today);
        
        // Add today's meals to dashboard
        for (const mealPlanItem of todaysMeals) {
          if (mealPlanItem.meal && mealPlanItem.meal.preview) {
            dashboard.meals.push({
              name: mealPlanItem.meal.preview.name,
              time: new Date(), // Current time as default
              calories: mealPlanItem.meal.preview.calories || 0,
              completed: false
            });
          }
        }
        
        if (todaysMeals.length > 0) {
          await dashboard.save();
        }
      }
    }

    // Populate dashboard with meals from active meal plan
    const mealPlan = await MealPlan.findOne({ user: req.user._id, active: true });
    if (mealPlan) {
      dashboard.meals = mealPlan.meals.map(meal => ({
        name: meal.name,
        time: meal.time,
        calories: meal.calories,
        completed: false
      }));
      await dashboard.save();
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

    const dashboard = await Dashboard.findOne({ user: req.user._id });
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

    const dashboard = await Dashboard.findOne({ user: req.user._id });
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

    const dashboard = await Dashboard.findOne({ user: req.user._id });
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

    const dashboard = await Dashboard.findOne({ user: req.user._id });
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