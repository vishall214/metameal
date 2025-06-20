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
  const { planType = 'weekly' } = req.body;

  try {
    // Get user profile and preferences
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { profile, preferences } = user;
    
    // Validate preferences - use defaults if not set
    const userPreferences = {
      calorieGoal: Number(preferences?.calorieGoal) || 2000,
      proteinGoal: Number(preferences?.proteinGoal) || 150,
      carbGoal: Number(preferences?.carbGoal) || 250,
      fatGoal: Number(preferences?.fatGoal) || 67
    };

    // Helper function to check if a meal matches user's health conditions (simplified)
    const meetsHealthConditions = (meal) => {
      if (!profile?.healthConditions) return true;
      
      let score = 0;
      let totalConditions = 0;
      
      // Check for diabetes compatibility (less restrictive)
      if (profile.healthConditions.diabetes) {
        totalConditions++;
        if (meal.sugar <= 10 && meal.addedSugar <= 2) score++;
      }
      
      // Check for high blood pressure compatibility (less restrictive)
      if (profile.healthConditions.highBloodPressure) {
        totalConditions++;
        if (meal.sodium <= 600) score++;
      }
      
      // Check for thyroid compatibility (simplified)
      if (profile.healthConditions.thyroid) {
        totalConditions++;
        // For thyroid, we'll be less restrictive and just give a point
        score++;
      }
      
      // If no health conditions, return true
      if (totalConditions === 0) return true;
      
      // Return true if at least 50% of conditions are met
      return score >= Math.ceil(totalConditions * 0.5);
    };

    // Helper function to check if a meal matches dietary preferences (simplified)
    const meetsDietaryPreferences = (meal) => {
      if (!profile?.dietaryPreferences?.length || profile.dietaryPreferences.includes('none')) {
        return true;
      }

      const mealFilters = meal.filter.map(f => f.toLowerCase());
      
      // Check each dietary preference
      for (const pref of profile.dietaryPreferences) {
        switch(pref.toLowerCase()) {
          case 'vegetarian':
            if (mealFilters.some(f => 
              f.includes('meat') || f.includes('chicken') || f.includes('beef') || f.includes('fish'))) {
              return false;
            }
            break;
          case 'vegan':
            if (mealFilters.some(f => 
              f.includes('meat') || f.includes('dairy') || f.includes('egg') || 
              f.includes('honey') || f.includes('fish') || f.includes('chicken'))) {
              return false;
            }
            break;
          case 'pescatarian':
            if (mealFilters.some(f => 
              f.includes('meat') || f.includes('chicken') || f.includes('beef'))) {
              return false;
            }
            break;
          case 'gluten_free':
            if (mealFilters.some(f => f.includes('wheat') || f.includes('gluten'))) {
              return false;
            }
            break;
          case 'dairy_free':
            if (mealFilters.some(f => f.includes('dairy') || f.includes('milk') || f.includes('cheese'))) {
              return false;
            }
            break;
        }
      }
      return true;
    };

    // Adjust macro targets based on fitness goals
    if (profile?.fitnessGoals?.length > 0) {
      if (profile.fitnessGoals.includes('muscle_gain')) {
        userPreferences.proteinGoal *= 1.2; // Increase protein for muscle gain
      } else if (profile.fitnessGoals.includes('weight_loss')) {
        userPreferences.calorieGoal *= 0.85; // Reduce calories for weight loss
        userPreferences.carbGoal *= 0.8;     // Reduce carbs for weight loss
      }
    }
    
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
      snacks: 0.10
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
        const targetCalories = Math.round(userPreferences.calorieGoal * percentage);
        const calorieRange = {
          min: targetCalories * 0.7, // More flexible range
          max: targetCalories * 1.3
        };

        // Query meals with more flexible criteria
        let meals = await Food.find({
          course: mealType.toLowerCase(),
          calories: {
            $gte: Math.max(0, calorieRange.min),
            $lte: calorieRange.max
          }
        }).exec();

        // Apply health and dietary filters
        meals = meals.filter(meal => 
          meetsHealthConditions(meal) && 
          meetsDietaryPreferences(meal)
        );

        // If no meals match, try with even more relaxed criteria
        if (meals.length === 0) {
          meals = await Food.find({
            course: mealType.toLowerCase()
          }).exec();

          // Still apply dietary preferences as they're most critical
          meals = meals.filter(meal => meetsDietaryPreferences(meal));
        }

        // If still no meals, get any meals from that course
        if (meals.length === 0) {
          meals = await Food.find({
            course: mealType.toLowerCase()
          }).exec();
        }

        if (meals.length > 0) {
          // Select one meal randomly for this slot
          const selectedMealIndex = Math.floor(Math.random() * meals.length);
          const selectedMeal = meals[selectedMealIndex];
          
          mealPlanItems.push({
            day,
            mealType,
            meal: selectedMeal._id,
            targetNutrition: {
              calories: targetCalories
            }
          });
        }
      }
    }

    if (mealPlanItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No meals found in the database. Please add some meals first.'
      });
    }

    // Create new meal plan
    const mealPlan = await MealPlan.create({
      user: req.user._id,
      name: `${planType === 'weekly' ? 'Weekly' : 'Daily'} Plan - ${startDate.toLocaleDateString()}`,
      startDate,
      endDate,
      preferences: {
        dietaryRestrictions: profile?.dietaryRestrictions || [],
        allergies: profile?.allergies || [],
        calorieGoal: userPreferences.calorieGoal,
        proteinGoal: userPreferences.proteinGoal,
        carbGoal: userPreferences.carbGoal,
        fatGoal: userPreferences.fatGoal
      },
      meals: mealPlanItems
    });

    // Populate the meal plan with full meal details
    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate('meals.meal')
      .exec();

    res.status(201).json({
      success: true,
      data: populatedMealPlan
    });

  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate meal plan'
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

    res.json({
      success: true,
      data: activePlan
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

// Helper function to get random items from array
const getRandomItems = (array, count) => {
  if (!array || array.length === 0) return [];
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

// Helper function to distribute meals by course
const distributeMealsByCourse = (meals) => {
  const mealsByType = {
    breakfast: meals.filter(meal => meal.course.toLowerCase() === 'breakfast'),
    lunch: meals.filter(meal => meal.course.toLowerCase() === 'lunch'),
    snacks: meals.filter(meal => 
      meal.course.toLowerCase() === 'snacks' || 
      meal.course.toLowerCase() === 'dessert'
    ),
    dinner: meals.filter(meal => meal.course.toLowerCase() === 'dinner')
  };

  // Log the distribution for debugging
  console.log('Meals distribution:', {
    breakfast: mealsByType.breakfast.length,
    lunch: mealsByType.lunch.length,
    snacks: mealsByType.snacks.length,
    dinner: mealsByType.dinner.length
  });

  return mealsByType;
};

// Get daily meals
const getDailyMeals = (mealsByType) => {
  return {
    breakfast: getRandomItems(mealsByType.breakfast, 1)[0] || null,
    lunch: getRandomItems(mealsByType.lunch, 1)[0] || null,
    snacks: getRandomItems(mealsByType.snacks, 1)[0] || null,
    dinner: getRandomItems(mealsByType.dinner, 1)[0] || null
  };
};

// Generate weekly meal plan
const getWeeklyMealPlan = async (req, res) => {
  try {
    console.log('Fetching meals from database...');
    
    // Get all meals from database
    const allMeals = await Food.find().lean();
    
    console.log(`Found ${allMeals.length} total meals`);

    if (!allMeals.length) {
      return res.status(404).json({ 
        success: false,
        message: 'No meals found in database',
        details: 'The Food collection is empty. Please add some meals first.'
      });
    }

    // Distribute meals by course
    const mealsByType = distributeMealsByCourse(allMeals);

    // Check if we have meals for each course type
    const missingCourses = [];
    if (!mealsByType.breakfast.length) missingCourses.push('breakfast');
    if (!mealsByType.lunch.length) missingCourses.push('lunch');
    if (!mealsByType.snacks.length) missingCourses.push('snacks');
    if (!mealsByType.dinner.length) missingCourses.push('dinner');

    // Generate weekly plan even if some courses are missing
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeklyPlan = {};

    days.forEach(day => {
      const dailyMeals = getDailyMeals(mealsByType);
      weeklyPlan[day] = Object.values(dailyMeals).filter(meal => meal !== null);
    });

    // Add warning if some courses are missing
    const response = {
      success: true,
      data: weeklyPlan
    };

    if (missingCourses.length > 0) {
      response.warning = `No meals found for: ${missingCourses.join(', ')}`;
    }

    console.log('Weekly plan generated successfully');
    res.json(weeklyPlan);
  } catch (error) {
    console.error('Error generating meal plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating meal plan',
      error: error.message
    });
  }
};

// Get today's meals
const getTodaysMeals = async (req, res) => {
  try {
    console.log('Fetching meals for today...');
    
    // Get all meals from database
    const allMeals = await Food.find().lean();
    
    if (!allMeals.length) {
      return res.status(404).json({ 
        success: false,
        message: 'No meals found in database',
        details: 'The Food collection is empty'
      });
    }

    // Distribute meals by course
    const mealsByType = distributeMealsByCourse(allMeals);

    // Generate today's meals
    const todaysMeals = Object.values(getDailyMeals(mealsByType)).filter(meal => meal !== null);

    console.log('Today\'s meals generated successfully');
    res.json({
      success: true,
      data: todaysMeals
    });
  } catch (error) {
    console.error('Error getting today\'s meals:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting today\'s meals',
      error: error.message
    });
  }
};

module.exports = {
  getMealPlans,
  getMealPlan,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  generateMealPlan,
  getActiveMealPlan,
  updateMealSelection,
  getWeeklyMealPlan,
  getTodaysMeals
};