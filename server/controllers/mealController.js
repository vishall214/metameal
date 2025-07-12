const Food = require('../models/Food');
const User = require('../models/User');

// Get all meals
const getMeals = async (req, res) => {
  try {
    const { search, course, page = 1, limit = 20 } = req.query;
    let query = {};
    
    // Handle search by name (case-insensitive)
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }
    
    // Handle course/category filter
    if (course && course.trim()) {
      query.course = course.toLowerCase().trim();
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count for pagination
    const total = await Food.countDocuments(query);
    
    // Get meals with pagination
    const meals = await Food.find(query)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Return with pagination info
    res.json({
      meals,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      hasMore: skip + meals.length < total
    });
  } catch (error) {
    console.error('Error in getMeals:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single meal
const getMeal = async (req, res) => {
  try {
    const meal = await Food.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search meals
const searchMeals = async (req, res) => {
  try {
    const { name, course } = req.query;
    let query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (course) {
      query.course = course.toLowerCase();
    }

    const meals = await Food.find(query);
    
    if (meals.length === 0) {
      return res.status(404).json({ message: 'No meals found matching your criteria' });
    }
    
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create meal
const createMeal = async (req, res) => {
  try {
    const meal = await Food.create({
      ...req.body,
      user: req.user.id
    });
    res.status(201).json(meal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update meal
const updateMeal = async (req, res) => {
  try {
    const meal = await Food.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user is the owner of the meal
    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this meal' });
    }

    const updatedMeal = await Food.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    res.json(updatedMeal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete meal
const deleteMeal = async (req, res) => {
  try {
    const meal = await Food.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    // Check if user is the owner of the meal
    if (meal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this meal' });
    }

    await meal.remove();
    res.json({ message: 'Meal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meals by category
const getMealsByCategory = async (req, res) => {
  try {
    const meals = await Food.find({ categories: req.params.category });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meals by tag
const getMealsByTag = async (req, res) => {
  try {
    const meals = await Food.find({ tags: req.params.tag });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get random meal
const getRandomMeal = async (req, res) => {
  try {
    const count = await Food.countDocuments();
    const random = Math.floor(Math.random() * count);
    const meal = await Food.findOne().skip(random);
    
    if (!meal) {
      return res.status(404).json({ message: 'No meals found' });
    }
    
    res.json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate meals based on user preferences
const generateMeals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user preferences
    const {
      calorieGoal,
      proteinGoal,
      carbGoal,
      fatGoal
    } = user.preferences;

    const dietaryRestrictions = user.profile.dietaryRestrictions || [];

    // Calculate meal distribution
    const mealDistribution = {
      breakfast: { calories: Math.round(calorieGoal * 0.25) }, // 25% of daily calories
      lunch: { calories: Math.round(calorieGoal * 0.35) },     // 35% of daily calories
      dinner: { calories: Math.round(calorieGoal * 0.30) },    // 30% of daily calories
      snack: { calories: Math.round(calorieGoal * 0.10) }      // 10% of daily calories
    };

    // Find suitable meals for each category
    const mealPlan = {};
    for (const [mealType, targets] of Object.entries(mealDistribution)) {
      // Find meals that match the criteria
      const meals = await Food.find({
        category: mealType.toLowerCase(),
        calories: { 
          $gte: targets.calories * 0.9, // Within 10% of target calories
          $lte: targets.calories * 1.1
        },
        // Filter out meals that don't match dietary restrictions
        tags: { 
          $nin: dietaryRestrictions
        }
      }).limit(3); // Get 3 options for each meal type

      mealPlan[mealType] = meals;
    }

    res.json({
      success: true,
      dailyTargets: {
        calories: calorieGoal,
        protein: proteinGoal,
        carbs: carbGoal,
        fat: fatGoal
      },
      mealDistribution,
      mealPlan
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get personalized meal recommendations
const getRecommendedMeals = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { dietaryRestrictions } = user.profile;
    const { calorieGoal } = user.preferences;

    // Find meals that match user's preferences
    const meals = await Food.find({
      calories: { 
        $lte: Math.round(calorieGoal * 0.4) // No single meal should exceed 40% of daily calories
      },
      tags: { 
        $nin: dietaryRestrictions
      }
    })
    .sort({ calories: -1 })
    .limit(10);

    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMeals,
  getMeal,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealsByCategory,
  getMealsByTag,
  getRandomMeal,
  generateMeals,
  getRecommendedMeals,
  searchMeals
};