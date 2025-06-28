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
  // Deactivate all existing meal plans for the user
  await MealPlan.updateMany(
    { user: req.user._id, status: 'active' },
    { status: 'inactive' }
  );

  const mealPlan = new MealPlan({
    ...req.body,
    user: req.user._id,
    status: 'active' // Set default status
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

  console.log(`[MealPlan] Starting generation with planType: ${planType}`);

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { profile, preferences } = user;
    const filters = profile.filters || [];
    // Separate dietary/health filters from meal-type filters
    const allowedDietaryFilters = ['veg', 'non-veg', 'diabetes', 'thyroid', 'high BP'];
    const allowedMealTypeFilters = ['breakfast', 'main course', 'dessert', 'snacks'];
    const userDietaryFilters = (profile.filters || []).filter(f => allowedDietaryFilters.includes(f));
    const goals = profile.goals || [];
    let { calorieGoal, proteinGoal, carbGoal, fatGoal } = preferences;

    // If any nutrition goal is missing or invalid, calculate them
    if ([calorieGoal, proteinGoal, carbGoal, fatGoal].some(val => typeof val !== 'number' || isNaN(val) || val <= 0)) {
      // Get user profile values
      const { age, height, weight, gender, activityLevel } = profile;
      if (!age || !height || !weight || !gender || !activityLevel) {
        res.status(400);
        throw new Error('Missing profile information for nutrition goal calculation. Please complete your profile.');
      }
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
      carbGoal = Math.round((calorieGoal * 0.4) / 4);    // 40% of calories from carbs
      fatGoal = Math.round((calorieGoal * 0.3) / 9);     // 30% of calories from fat
      
      console.log(`[MealPlan] Calculated daily goals - Calories: ${calorieGoal}, Protein: ${proteinGoal}g, Carbs: ${carbGoal}g, Fat: ${fatGoal}g`);
    }

    // Validate nutrition goals
    if ([calorieGoal, proteinGoal, carbGoal, fatGoal].some(val => typeof val !== 'number' || isNaN(val) || val <= 0)) {
      res.status(400);
      throw new Error('Invalid or missing nutrition goals. Please set your calorie, protein, carb, and fat goals in your profile.');
    }

    // Check if we have foods in the database
    const totalFoods = await Food.countDocuments();
    console.log(`[MealPlan] Total foods in database: ${totalFoods}`);
    
    if (totalFoods === 0) {
      res.status(400);
      throw new Error('No foods available in database. Please seed the database with food data.');
    }

    function scoreFood(food) {
      // Typecast all nutrition fields to number for safety
      const calories = Number(food.calories);
      const protein = Number(food.protein);
      const carbs = Number(food.carbs);
      const fats = Number(food.fats);
      return (
        Math.abs(calories - calorieGoal) +
        Math.abs(protein - proteinGoal) +
        Math.abs(carbs - carbGoal) +
        Math.abs(fats - fatGoal)
      );
    }

    function goalFilter(food, targetCal = calorieGoal / 3, targetProt = proteinGoal / 3) {
      // Typecast all nutrition fields to number for safety
      const calories = Number(food.calories) || 0;
      const protein = Number(food.protein) || 0;
      
      // Much more relaxed ranges - allow wide ranges for individual foods
      const calMin = targetCal * 0.1;  // Very low minimum
      const calMax = targetCal * 2.0;  // Allow foods up to 2x the meal target
      const protMin = targetProt * 0.1; // Very relaxed protein minimum
      
      // Log first few foods to see what we're dealing with
      if (Math.random() < 0.05) { // Log 5% of foods randomly
        console.log(`[MealPlan] Food sample: ${food.name} - cal:${calories}, prot:${protein}, targets: cal:${targetCal}, prot:${targetProt}`);
      }
      
      if (goals.includes('Weight Loss')) {
        return calories <= calMax && protein >= protMin;
      }
      if (goals.includes('Muscle Gain')) {
        return protein >= protMin;
      }
      // For general case, be very permissive
      return calories >= calMin && calories <= calMax;
    }

    // Map mealType to course and filter values
    const mealTypeToCourse = {
      breakfast: 'breakfast',
      lunch: 'main course',
      snack: ['snacks', 'dessert'],
      dinner: 'main course'
    };

    const startDate = new Date();
    const endDate = new Date();
    if (planType === 'weekly') endDate.setDate(endDate.getDate() + 6);

    // Ensure 4 meals per day
    const mealDistribution = {
      breakfast: 0.25,
      lunch: 0.35,
      snack: 0.10,
      dinner: 0.30
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = startDate.getDay();
    const daysToGenerate = planType === 'weekly' ? 7 : 1;
    const mealPlanItems = [];

    console.log(`[MealPlan] Will generate ${daysToGenerate} days starting from ${startDate.toDateString()}`);

    for (let i = 0; i < daysToGenerate; i++) {
      const dayIndex = (currentDay + i) % 7;
      const day = days[dayIndex];
      
      // Calculate the actual date for this day
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);

      // Randomize meal order for the day
      const mealTypes = Object.entries(mealDistribution);
      for (let j = mealTypes.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [mealTypes[j], mealTypes[k]] = [mealTypes[k], mealTypes[j]];
      }

      for (const [mealType, percentage] of mealTypes) {
        const targetCalories = Math.round(calorieGoal * percentage);
        const calorieRange = { min: targetCalories * 0.9, max: targetCalories * 1.1 };

        let foods = [];
        let course = mealTypeToCourse[mealType];
        let courseQuery = Array.isArray(course) ? { course: { $in: course } } : { course };

        // 1. Try strict dietary filter match + course + meal-type filter
        if (userDietaryFilters.length) {
          const mealTypeFilter = mealType === 'snack' ? 'snacks' : mealType;
          foods = await Food.find({
            calories: { $gte: calorieRange.min, $lte: calorieRange.max },
            filter: { $all: [...userDietaryFilters, mealTypeFilter] },
            ...courseQuery
          }).exec();
          console.log(`[MealPlan] Strict dietary+meal-type filter+course for ${mealType} (${day}): found ${foods.length}`);
        }

        // 2. Try dietary filters only + course
        if ((!foods || foods.length < 1) && userDietaryFilters.length) {
          foods = await Food.find({
            calories: { $gte: calorieRange.min, $lte: calorieRange.max },
            filter: { $in: userDietaryFilters },
            ...courseQuery
          }).exec();
          console.log(`[MealPlan] Dietary filter only+course for ${mealType} (${day}): found ${foods.length}`);
        }

        // 3. Try meal-type filter + course (ignore dietary filters)
        if (!foods || foods.length < 1) {
          const mealTypeFilter = mealType === 'snack' ? 'snacks' : mealType;
          foods = await Food.find({
            calories: { $gte: calorieRange.min * 0.8, $lte: calorieRange.max * 1.2 },
            filter: { $in: [mealTypeFilter] },
            ...courseQuery
          }).exec();
          console.log(`[MealPlan] Meal-type filter+course for ${mealType} (${day}): found ${foods.length}`);
        }

        // 4. Final fallback: any food with course
        if (!foods || foods.length < 1) {
          foods = await Food.find({
            ...courseQuery
          }).exec();
          console.log(`[MealPlan] Fallback course only for ${mealType} (${day}): found ${foods.length}`);
        }

        // Calculate per-meal targets for this meal type
        const targetCaloriesForMeal = targetCalories;
        const targetProteinForMeal = proteinGoal * percentage;
        
        foods = foods
          .filter(food => goalFilter(food, targetCaloriesForMeal, targetProteinForMeal))
          .map(food => {
            // Ensure we have the _doc property or use the food directly
            const foodData = food._doc || food;
            return { ...foodData, score: scoreFood(foodData) };
          });
        console.log(`[MealPlan] After goalFilter for ${mealType} (${day}): ${foods.length} foods (targets: cal=${targetCaloriesForMeal}, prot=${targetProteinForMeal.toFixed(1)})`);

        // If still no foods, try without any filters at all
        if (!foods || foods.length < 1) {
          foods = await Food.find({
            calories: { $gte: calorieRange.min * 0.5, $lte: calorieRange.max * 2 }
          }).exec();
          console.log(`[MealPlan] No filters fallback for ${mealType} (${day}): found ${foods.length} foods`);
          foods = foods
            .filter(food => goalFilter(food, targetCaloriesForMeal, targetProteinForMeal))
            .map(food => {
              const foodData = food._doc || food;
              return { ...foodData, score: scoreFood(foodData) };
            });
          console.log(`[MealPlan] After goalFilter (no filters) for ${mealType} (${day}): ${foods.length} foods (targets: cal=${targetCaloriesForMeal}, prot=${targetProteinForMeal.toFixed(1)})`);
        }

        // Shuffle foods for maximum randomness - shuffle multiple times
        for (let shuffle = 0; shuffle < 3; shuffle++) {
          for (let f = foods.length - 1; f > 0; f--) {
            const k = Math.floor(Math.random() * (f + 1));
            [foods[f], foods[k]] = [foods[k], foods[f]];
          }
        }

        // Instead of sorting by score, randomly select from a larger pool
        const poolSize = Math.min(10, foods.length); // Select from top 10 instead of top 3
        const randomPool = foods.slice(0, poolSize);
        
        // Shuffle the pool again for extra randomness
        for (let f = randomPool.length - 1; f > 0; f--) {
          const k = Math.floor(Math.random() * (f + 1));
          [randomPool[f], randomPool[k]] = [randomPool[k], randomPool[f]];
        }

        console.log(`[MealPlan] Random pool for ${mealType} (${day}): ${randomPool.length} foods`);
        
        if (randomPool.length > 0) {
          const selectedMealIndex = Math.floor(Math.random() * randomPool.length);
          const meal = randomPool[selectedMealIndex];
          
          console.log(`[MealPlan] Selected meal object:`, meal);
          console.log(`[MealPlan] Meal object type:`, typeof meal);
          console.log(`[MealPlan] Meal is null:`, meal === null);
          console.log(`[MealPlan] Meal is undefined:`, meal === undefined);
          
          if (!meal) {
            console.log(`[MealPlan] ERROR: Meal is null or undefined!`);
            throw new Error(`Selected meal is null or undefined for ${mealType}`);
          }
          
          console.log(`[MealPlan] Selected meal object keys:`, Object.keys(meal || {}));
          console.log(`[MealPlan] Selected meal name property:`, meal.name);
          console.log(`[MealPlan] Selected meal for ${mealType} (${day}): ${meal.name || 'NO NAME PROPERTY'}`);
          
          // Ensure we have all required properties with robust fallbacks
          const mealData = {
            _id: (meal._id ? meal._id.toString() : null) || new Date().getTime().toString(),
            name: meal.name || meal.title || 'Unknown Meal',
            photo: meal.photo || meal.image || 'https://via.placeholder.com/400x200?text=No+Image',
            calories: Number(meal.calories) || 0,
            course: meal.course || 'Unknown',
            cookingTime: Number(meal.cookingTime) || 30,
            description: meal.description || 'No description available',
            recipe: meal.recipe || 'Recipe not available',
            protein: Number(meal.protein) || 0,
            fats: Number(meal.fats) || 0,
            carbs: Number(meal.carbs) || 0,
            fibre: Number(meal.fibre) || 0,
            sugar: Number(meal.sugar) || 0,
            addedSugar: Number(meal.addedSugar) || 0,
            sodium: Number(meal.sodium) || 0,
            portionSize: Number(meal.portionSize) || 100,
            filter: Array.isArray(meal.filter) ? meal.filter : []
          };

          console.log(`[MealPlan] Created mealData:`, mealData);

          mealPlanItems.push({
            day,
            date: dayDate,
            mealType,
            meal: mealData,
            targetNutrition: {
              calories: targetCalories,
              protein: proteinGoal * percentage,
              carbs: carbGoal * percentage,
              fat: fatGoal * percentage
            }
          });
        } else {
          console.log(`[MealPlan] NO FOODS FOUND for ${mealType} (${day}) - adding placeholder meal`);
          // Add a placeholder meal so the UI doesn't break
          mealPlanItems.push({
            day,
            date: dayDate,
            mealType,
            meal: {
              _id: new Date().getTime().toString(),
              name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} (Coming Soon)`,
              photo: 'https://via.placeholder.com/400x200?text=Coming+Soon',
              calories: 0,
              course: mealType,
              cookingTime: 0,
              description: 'This meal will be available soon.',
              recipe: 'Recipe coming soon.',
              protein: 0,
              fats: 0,
              carbs: 0,
              fibre: 0,
              sugar: 0,
              addedSugar: 0,
              sodium: 0,
              portionSize: 0,
              filter: []
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
    }    // Deactivate existing meal plans
    await MealPlan.updateMany(
      { user: req.user._id, status: 'active' },
      { status: 'inactive' }
    );

    console.log(`[MealPlan] Generated ${mealPlanItems.length} total meal items`);
    console.log(`[MealPlan] Meal plan items:`, mealPlanItems.map(item => `${item.day}-${item.mealType}: ${item.meal.name}`));

    const mealPlan = await MealPlan.create({
      user: req.user._id,
      name: `${planType === 'weekly' ? 'Weekly' : 'Daily'} Plan - ${startDate.toLocaleDateString()}`,
      startDate,
      endDate,
      status: 'active',
      preferences: {
        dietaryRestrictions: userDietaryFilters,
        calorieGoal,
        proteinGoal,
        carbGoal,
        fatGoal
      },
      meals: mealPlanItems.map(item => ({
        day: item.day,
        date: item.date,
        mealType: item.mealType,
        meal: item.meal._id
      }))
    });

    console.log(`[MealPlan] Saving meal plan with ${mealPlan.meals.length} meals`);
    const savedMealPlan = await mealPlan.save();
    console.log(`[MealPlan] Successfully saved meal plan with ID: ${savedMealPlan._id}`);

    res.status(201).json({
      success: true,
      mealPlan: {
        ...savedMealPlan.toObject(),
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

// @desc    Reroll meals for a specific day
// @route   POST /api/meal-plans/reroll-day
// @access  Private
const rerollDay = asyncHandler(async (req, res) => {
  const { day } = req.body;
  
  if (!day) {
    res.status(400);
    throw new Error('Day is required');
  }

  try {
    console.log(`[MealPlan] Rerolling meals for day: ${day}`);
    
    // Get user data
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get or create active meal plan
    let activeMealPlan = await MealPlan.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!activeMealPlan) {
      // Create a new meal plan if none exists
      activeMealPlan = new MealPlan({
        user: req.user._id,
        planType: 'weekly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        status: 'active',
        meals: []
      });
    }

    // Remove existing meals for this day
    activeMealPlan.meals = activeMealPlan.meals.filter(meal => meal.day !== day);

    // Calculate the date for this day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const startDate = activeMealPlan.startDate;
    const currentDayIndex = days.indexOf(day);
    const startDayIndex = startDate.getDay();
    
    // Find how many days from start date to reach the target day
    let daysFromStart = (currentDayIndex - startDayIndex + 7) % 7;
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + daysFromStart);

    // Get user preferences
    const goals = user.goals || [];
    const dietaryRestrictions = user.dietaryRestrictions || [];
    const healthConditions = user.healthConditions || [];
    const allergies = user.allergies || [];
    
    // Calculate calorie and nutrition goals
    const calorieGoal = user.dailyCalories || 2000;
    const proteinGoal = user.dailyProtein || 120;
    const carbGoal = user.dailyCarbs || 250;
    const fatGoal = user.dailyFats || 65;

    // Generate new meals for the day
    const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    const newMeals = [];

    for (const mealType of mealTypes) {
      console.log(`[MealPlan] Generating ${mealType} for ${day}`);
      
      // Get course mapping
      const mealTypeToCourse = {
        breakfast: 'breakfast',
        lunch: 'main course',
        snack: ['snacks', 'dessert'],
        dinner: 'main course'
      };

      const targetCourse = mealTypeToCourse[mealType];
      
      // Build query for foods
      let query = {};
      if (Array.isArray(targetCourse)) {
        query.course = { $in: targetCourse };
      } else {
        query.course = targetCourse;
      }

      let foods = await Food.find(query).lean();
      console.log(`[MealPlan] Found ${foods.length} foods for ${mealType}`);

      if (foods.length === 0) {
        foods = await Food.find({}).lean();
        console.log(`[MealPlan] Fallback: Using all ${foods.length} foods`);
      }

      // Filter and score foods
      const targetCal = calorieGoal / 4;
      const targetProt = proteinGoal / 4;

      function goalFilter(food) {
        const calories = Number(food.calories) || 0;
        const protein = Number(food.protein) || 0;
        const calMin = targetCal * 0.1;
        const calMax = targetCal * 2.0;
        const protMin = targetProt * 0.1;
        
        if (goals.includes('Weight Loss')) {
          return calories <= calMax && protein >= protMin;
        }
        if (goals.includes('Muscle Gain')) {
          return protein >= protMin;
        }
        return calories >= calMin && calories <= calMax;
      }

      function scoreFood(food) {
        const calories = Number(food.calories);
        const protein = Number(food.protein);
        const carbs = Number(food.carbs);
        const fats = Number(food.fats);
        return (
          Math.abs(calories - targetCal) +
          Math.abs(protein - targetProt) +
          Math.abs(carbs - carbGoal / 4) +
          Math.abs(fats - fatGoal / 4)
        );
      }

      // Filter foods based on dietary restrictions
      let filteredFoods = foods.filter(food => {
        if (!food.filter || !Array.isArray(food.filter)) return true;
        
        const foodFilters = food.filter.map(f => f.toLowerCase());
        
        for (const restriction of [...dietaryRestrictions, ...healthConditions, ...allergies]) {
          const restrictionLower = restriction.toLowerCase();
          if (foodFilters.some(f => f.includes(restrictionLower))) {
            return false;
          }
        }
        
        return goalFilter(food);
      });

      if (filteredFoods.length === 0) {
        filteredFoods = foods.filter(goalFilter);
      }

      if (filteredFoods.length === 0) {
        filteredFoods = foods.slice(0, 10);
      }

      // Score and shuffle foods
      filteredFoods = filteredFoods.map(food => ({
        ...food,
        score: scoreFood(food)
      }));

      // Shuffle foods for maximum randomness - shuffle multiple times
      for (let shuffle = 0; shuffle < 3; shuffle++) {
        for (let f = filteredFoods.length - 1; f > 0; f--) {
          const k = Math.floor(Math.random() * (f + 1));
          [filteredFoods[f], filteredFoods[k]] = [filteredFoods[k], filteredFoods[f]];
        }
      }

      // Instead of sorting by score, randomly select from a larger pool
      const poolSize = Math.min(10, filteredFoods.length); // Select from top 10 instead of top 3
      const randomPool = filteredFoods.slice(0, poolSize);
      
      // Shuffle the pool again for extra randomness
      for (let f = randomPool.length - 1; f > 0; f--) {
        const k = Math.floor(Math.random() * (f + 1));
        [randomPool[f], randomPool[k]] = [randomPool[k], randomPool[f]];
      }
      
      if (randomPool.length > 0) {
        const selectedMealIndex = Math.floor(Math.random() * randomPool.length);
        const meal = randomPool[selectedMealIndex];
        
        const mealData = {
          _id: (meal._id ? meal._id.toString() : null) || new Date().getTime().toString(),
          name: meal.name || 'Unknown Meal',
          photo: meal.photo || 'https://via.placeholder.com/400x200?text=No+Image',
          calories: Number(meal.calories) || 0,
          course: meal.course || 'Unknown',
          cookingTime: Number(meal.cookingTime) || 30,
          description: meal.description || 'No description available',
          recipe: meal.recipe || 'Recipe not available',
          protein: Number(meal.protein) || 0,
          fats: Number(meal.fats) || 0,
          carbs: Number(meal.carbs) || 0,
          fibre: Number(meal.fibre) || 0,
          sugar: Number(meal.sugar) || 0,
          addedSugar: Number(meal.addedSugar) || 0,
          sodium: Number(meal.sodium) || 0,
          portionSize: Number(meal.portionSize) || 100,
          filter: Array.isArray(meal.filter) ? meal.filter : []
        };

        newMeals.push({
          day: day,
          date: dayDate,
          mealType: mealType,
          meal: mealData
        });
        
        console.log(`[MealPlan] Added ${mealType} for ${day}: ${mealData.name}`);
      } else {
        // Placeholder meal
        newMeals.push({
          day: day,
          date: dayDate,
          mealType: mealType,
          meal: {
            _id: new Date().getTime().toString(),
            name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Placeholder`,
            photo: 'https://via.placeholder.com/400x200?text=Coming+Soon',
            calories: 300,
            course: 'placeholder',
            cookingTime: 15,
            description: 'A delicious meal coming soon!',
            recipe: 'Recipe will be available soon.',
            protein: 20,
            fats: 10,
            carbs: 30,
            fibre: 5,
            sugar: 5,
            addedSugar: 0,
            sodium: 500,
            portionSize: 100,
            filter: []
          }
        });
      }
    }

    // Add new meals to the plan
    activeMealPlan.meals.push(...newMeals);
    
    // Save the updated meal plan
    const savedMealPlan = await activeMealPlan.save();
    
    console.log(`[MealPlan] Successfully rerolled ${newMeals.length} meals for ${day}`);
    
    res.json({
      success: true,
      message: `Successfully rerolled meals for ${day}`,
      mealPlan: savedMealPlan
    });
    
  } catch (error) {
    console.error('[MealPlan] Error rerolling day:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reroll meals for the day'
    });
  }
});

// @desc    Add next day to rolling meal plan (when current day is over)
// @route   POST /api/meal-plans/add-next-day
// @access  Private
const addNextDay = asyncHandler(async (req, res) => {
  try {
    console.log(`[MealPlan] Adding next day to rolling meal plan for user ${req.user._id}`);
    
    // Get user data
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get active meal plan
    let activeMealPlan = await MealPlan.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!activeMealPlan) {
      res.status(404);
      throw new Error('No active meal plan found');
    }

    // Find the latest day in the meal plan
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const existingDays = [...new Set(activeMealPlan.meals.map(meal => meal.day))];
    
    // Calculate what the next day should be
    const today = new Date();
    const nextDate = new Date(activeMealPlan.endDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDayName = daysOfWeek[nextDate.getDay()];

    // Remove the oldest day (first day in the plan) to maintain 7-day rolling window
    const oldestDay = existingDays[0]; // Assuming days are in order
    activeMealPlan.meals = activeMealPlan.meals.filter(meal => meal.day !== oldestDay);

    // Get user preferences for meal generation
    const goals = user.goals || [];
    const dietaryRestrictions = user.dietaryRestrictions || [];
    const healthConditions = user.healthConditions || [];
    const allergies = user.allergies || [];
    
    // Calculate calorie and nutrition goals
    const calorieGoal = user.dailyCalories || 2000;
    const proteinGoal = user.dailyProtein || 120;
    const carbGoal = user.dailyCarbs || 250;
    const fatGoal = user.dailyFats || 65;

    // Generate new meals for the next day
    const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
    const newMeals = [];

    const mealTypeToCourse = {
      breakfast: 'breakfast',
      lunch: 'main course',
      snack: ['snacks', 'dessert'],
      dinner: 'main course'
    };

    for (const mealType of mealTypes) {
      const targetCourse = mealTypeToCourse[mealType];
      const targetCaloriesForMeal = calorieGoal / 4;
      const targetProteinForMeal = proteinGoal / 4;

      // Build query for foods
      let query = {};
      if (Array.isArray(targetCourse)) {
        query.course = { $in: targetCourse };
      } else {
        query.course = targetCourse;
      }

      let foods = await Food.find(query).lean();
      
      if (foods.length === 0) {
        foods = await Food.find({}).lean();
      }

      // Filter and score foods (similar to rerollDay logic)
      function goalFilter(food) {
        const calories = Number(food.calories) || 0;
        const protein = Number(food.protein) || 0;
        const calMin = targetCaloriesForMeal * 0.1;
        const calMax = targetCaloriesForMeal * 2.0;
        const protMin = targetProteinForMeal * 0.1;
        
        if (goals.includes('Weight Loss')) {
          return calories <= calMax && protein >= protMin;
        }
        if (goals.includes('Muscle Gain')) {
          return protein >= protMin;
        }
        return calories >= calMin && calories <= calMax;
      }

      function scoreFood(food) {
        const calories = Number(food.calories);
        const protein = Number(food.protein);
        const carbs = Number(food.carbs);
        const fats = Number(food.fats);
        return (
          Math.abs(calories - targetCaloriesForMeal) +
          Math.abs(protein - targetProteinForMeal) +
          Math.abs(carbs - carbGoal / 4) +
          Math.abs(fats - fatGoal / 4)
        );
      }

      // Filter foods based on dietary restrictions
      let filteredFoods = foods.filter(food => {
        if (!food.filter || !Array.isArray(food.filter)) return true;
        
        const foodFilters = food.filter.map(f => f.toLowerCase());
        
        for (const restriction of [...dietaryRestrictions, ...healthConditions, ...allergies]) {
          const restrictionLower = restriction.toLowerCase();
          if (foodFilters.some(f => f.includes(restrictionLower))) {
            return false;
          }
        }
        
        return goalFilter(food);
      });

      if (filteredFoods.length === 0) {
        filteredFoods = foods.filter(goalFilter);
      }

      if (filteredFoods.length === 0) {
        filteredFoods = foods.slice(0, 10);
      }

      // Score and shuffle foods
      filteredFoods = filteredFoods.map(food => ({
        ...food,
        score: scoreFood(food)
      }));

      // Enhanced randomization
      for (let shuffle = 0; shuffle < 3; shuffle++) {
        for (let f = filteredFoods.length - 1; f > 0; f--) {
          const k = Math.floor(Math.random() * (f + 1));
          [filteredFoods[f], filteredFoods[k]] = [filteredFoods[k], filteredFoods[f]];
        }
      }

      const poolSize = Math.min(10, filteredFoods.length);
      const randomPool = filteredFoods.slice(0, poolSize);
      
      for (let f = randomPool.length - 1; f > 0; f--) {
        const k = Math.floor(Math.random() * (f + 1));
        [randomPool[f], randomPool[k]] = [randomPool[k], randomPool[f]];
      }
      
      if (randomPool.length > 0) {
        const selectedMealIndex = Math.floor(Math.random() * randomPool.length);
        const meal = randomPool[selectedMealIndex];
        
        const mealData = {
          _id: (meal._id ? meal._id.toString() : null) || new Date().getTime().toString(),
          name: meal.name || 'Unknown Meal',
          photo: meal.photo || 'https://via.placeholder.com/400x200?text=No+Image',
          calories: Number(meal.calories) || 0,
          course: meal.course || 'Unknown',
          cookingTime: Number(meal.cookingTime) || 30,
          description: meal.description || 'No description available',
          recipe: meal.recipe || 'Recipe not available',
          protein: Number(meal.protein) || 0,
          fats: Number(meal.fats) || 0,
          carbs: Number(meal.carbs) || 0,
          fibre: Number(meal.fibre) || 0,
          sugar: Number(meal.sugar) || 0,
          addedSugar: Number(meal.addedSugar) || 0,
          sodium: Number(meal.sodium) || 0,
          portionSize: Number(meal.portionSize) || 100,
          filter: Array.isArray(meal.filter) ? meal.filter : []
        };

        newMeals.push({
          day: nextDayName,
          mealType: mealType,
          meal: mealData,
          date: nextDate
        });
        
        console.log(`[MealPlan] Added ${mealType} for ${nextDayName}: ${mealData.name}`);
      } else {
        // Placeholder meal
        newMeals.push({
          day: nextDayName,
          date: nextDate,
          mealType: mealType,
          meal: {
            _id: new Date().getTime().toString(),
            name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Placeholder`,
            photo: 'https://via.placeholder.com/400x200?text=Coming+Soon',
            calories: 300,
            course: 'placeholder',
            cookingTime: 15,
            description: 'A delicious meal coming soon!',
            recipe: 'Recipe will be available soon.',
            protein: 20,
            fats: 10,
            carbs: 30,
            fibre: 5,
            sugar: 5,
            addedSugar: 0,
            sodium: 500,
            portionSize: 100,
            filter: []
          },
          date: nextDate
        });
      }
    }

    // Add new meals to the plan
    activeMealPlan.meals.push(...newMeals);
    
    // Update date range
    activeMealPlan.startDate = new Date(activeMealPlan.startDate);
    activeMealPlan.startDate.setDate(activeMealPlan.startDate.getDate() + 1);
    activeMealPlan.endDate = nextDate;
    
    // Save the updated meal plan
    const savedMealPlan = await activeMealPlan.save();
    
    console.log(`[MealPlan] Successfully added next day (${nextDayName}) and removed oldest day (${oldestDay})`);
    
    res.json({
      success: true,
      message: `Successfully added ${nextDayName} and removed ${oldestDay}`,
      mealPlan: savedMealPlan
    });
    
  } catch (error) {
    console.error('[MealPlan] Error adding next day:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add next day'
    });
  }
});

// @desc    Update rolling meal plan (remove old days, add new days)
// @route   POST /api/meal-plans/update-rolling
// @access  Private
const updateRollingMealPlan = asyncHandler(async (req, res) => {
  try {
    console.log('[MealPlan] Updating rolling meal plan');
    
    // Get user data
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Get or create active meal plan
    let activeMealPlan = await MealPlan.findOne({
      user: req.user._id,
      status: 'active'
    });

    if (!activeMealPlan) {
      // Create a new rolling meal plan
      activeMealPlan = await createInitialRollingMealPlan(req.user._id, user);
    } else {
      // Update existing rolling meal plan
      await updateExistingRollingMealPlan(activeMealPlan, user);
    }

    res.json({
      success: true,
      message: 'Rolling meal plan updated successfully',
      mealPlan: activeMealPlan
    });
    
  } catch (error) {
    console.error('[MealPlan] Error updating rolling meal plan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update rolling meal plan'
    });
  }
});

// Helper function to create initial 7-day rolling meal plan
const createInitialRollingMealPlan = async (userId, user) => {
  const today = new Date();
  const startDate = new Date(today);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 6); // 7 days total

  const mealPlan = new MealPlan({
    user: userId,
    name: 'Rolling Weekly Meal Plan',
    startDate: startDate,
    endDate: endDate,
    isRolling: true,
    lastUpdated: new Date(),
    status: 'active',
    meals: []
  });

  // Generate meals for the next 7 days
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + i);
    const dayName = daysOfWeek[currentDate.getDay()];
    
    const dayMeals = await generateMealsForDay(dayName, currentDate, user);
    mealPlan.meals.push(...dayMeals);
  }

  return await mealPlan.save();
};

// Helper function to update existing rolling meal plan
const updateExistingRollingMealPlan = async (mealPlan, user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Remove meals from past dates
  const originalMealCount = mealPlan.meals.length;
  mealPlan.meals = mealPlan.meals.filter(meal => {
    const mealDate = new Date(meal.date);
    mealDate.setHours(0, 0, 0, 0);
    return mealDate >= today;
  });
  
  const removedMealCount = originalMealCount - mealPlan.meals.length;
  console.log(`[MealPlan] Removed ${removedMealCount} past meals`);

  // Find the latest date in the current meal plan
  let latestDate = new Date(today);
  latestDate.setDate(latestDate.getDate() - 1); // Start from yesterday
  
  mealPlan.meals.forEach(meal => {
    const mealDate = new Date(meal.date);
    if (mealDate > latestDate) {
      latestDate = mealDate;
    }
  });

  // Add new days to maintain 7 days ahead
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetEndDate = new Date(today);
  targetEndDate.setDate(targetEndDate.getDate() + 6);
  
  let newMealsAdded = 0;
  let currentDate = new Date(latestDate);
  currentDate.setDate(currentDate.getDate() + 1);
  
  while (currentDate <= targetEndDate) {
    const dayName = daysOfWeek[currentDate.getDay()];
    
    // Check if we already have meals for this date
    const existingMeals = mealPlan.meals.filter(meal => {
      const mealDate = new Date(meal.date);
      mealDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(currentDate);
      checkDate.setHours(0, 0, 0, 0);
      return mealDate.getTime() === checkDate.getTime();
    });
    
    if (existingMeals.length === 0) {
      const dayMeals = await generateMealsForDay(dayName, currentDate, user);
      mealPlan.meals.push(...dayMeals);
      newMealsAdded += dayMeals.length;
      console.log(`[MealPlan] Added ${dayMeals.length} meals for ${dayName} (${currentDate.toDateString()})`);
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log(`[MealPlan] Added ${newMealsAdded} new meals`);
  
  // Update the meal plan dates
  mealPlan.startDate = today;
  mealPlan.endDate = targetEndDate;
  mealPlan.lastUpdated = new Date();
  
  return await mealPlan.save();
};

// Helper function to generate meals for a specific day
const generateMealsForDay = async (dayName, date, user) => {
  console.log(`[MealPlan] Generating meals for ${dayName} (${date.toDateString()})`);
  
  // Get user preferences
  const goals = user.goals || [];
  const dietaryRestrictions = user.dietaryRestrictions || [];
  const healthConditions = user.healthConditions || [];
  const allergies = user.allergies || [];
  
  // Calculate calorie and nutrition goals
  const calorieGoal = user.dailyCalories || 2000;
  const proteinGoal = user.dailyProtein || 120;
  const carbGoal = user.dailyCarbs || 250;
  const fatGoal = user.dailyFats || 65;

  const mealTypes = ['breakfast', 'lunch', 'snack', 'dinner'];
  const dayMeals = [];

  for (const mealType of mealTypes) {
    try {
      const meal = await generateSingleMeal(mealType, user, goals, dietaryRestrictions, healthConditions, allergies, calorieGoal, proteinGoal, carbGoal, fatGoal);
      
      if (meal) {
        dayMeals.push({
          day: dayName,
          date: new Date(date),
          mealType: mealType,
          meal: meal
        });
      }
    } catch (error) {
      console.error(`[MealPlan] Error generating ${mealType} for ${dayName}:`, error);
      // Add placeholder meal if generation fails
      dayMeals.push({
        day: dayName,
        date: new Date(date),
        mealType: mealType,
        meal: {
          _id: new Date().getTime().toString() + Math.random(),
          name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Placeholder`,
          photo: 'https://via.placeholder.com/400x200?text=Coming+Soon',
          calories: 300,
          course: 'placeholder',
          cookingTime: 15,
          description: 'A delicious meal coming soon!',
          recipe: 'Recipe will be available soon.',
          protein: 20,
          fats: 10,
          carbs: 30,
          fibre: 5,
          sugar: 5,
          addedSugar: 0,
          sodium: 500,
          portionSize: 100,
          filter: []
        }
      });
    }
  }

  return dayMeals;
};

// Helper function to generate a single meal
const generateSingleMeal = async (mealType, user, goals, dietaryRestrictions, healthConditions, allergies, calorieGoal, proteinGoal, carbGoal, fatGoal) => {
  // Get course mapping
  const mealTypeToCourse = {
    breakfast: 'breakfast',
    lunch: 'main course',
    snack: ['snacks', 'dessert'],
    dinner: 'main course'
  };

  const targetCourse = mealTypeToCourse[mealType];
  
  // Build query for foods
  let query = {};
  if (Array.isArray(targetCourse)) {
    query.course = { $in: targetCourse };
  } else {
    query.course = targetCourse;
  }

  let foods = await Food.find(query).lean();
  
  if (foods.length === 0) {
    foods = await Food.find({}).lean();
  }

  // Filter and score foods
  const targetCal = calorieGoal / 4;
  const targetProt = proteinGoal / 4;

  function goalFilter(food) {
    const calories = Number(food.calories) || 0;
    const protein = Number(food.protein) || 0;
    const calMin = targetCal * 0.1;
    const calMax = targetCal * 2.0;
    const protMin = targetProt * 0.1;
    
    if (goals.includes('Weight Loss')) {
      return calories <= calMax && protein >= protMin;
    }
    if (goals.includes('Muscle Gain')) {
      return protein >= protMin;
    }
    return calories >= calMin && calories <= calMax;
  }

  function scoreFood(food) {
    const calories = Number(food.calories);
    const protein = Number(food.protein);
    const carbs = Number(food.carbs);
    const fats = Number(food.fats);
    return (
      Math.abs(calories - targetCal) +
      Math.abs(protein - targetProt) +
      Math.abs(carbs - carbGoal / 4) +
      Math.abs(fats - fatGoal / 4)
    );
  }

  // Filter foods based on dietary restrictions
  let filteredFoods = foods.filter(food => {
    if (!food.filter || !Array.isArray(food.filter)) return true;
    
    const foodFilters = food.filter.map(f => f.toLowerCase());
    
    for (const restriction of [...dietaryRestrictions, ...healthConditions, ...allergies]) {
      const restrictionLower = restriction.toLowerCase();
      if (foodFilters.some(f => f.includes(restrictionLower))) {
        return false;
      }
    }
    
    return goalFilter(food);
  });

  if (filteredFoods.length === 0) {
    filteredFoods = foods.filter(goalFilter);
  }

  if (filteredFoods.length === 0) {
    filteredFoods = foods.slice(0, 10);
  }

  // Score and shuffle foods
  filteredFoods = filteredFoods.map(food => ({
    ...food,
    score: scoreFood(food)
  }));

  // Shuffle for maximum randomness
  for (let shuffle = 0; shuffle < 3; shuffle++) {
    for (let f = filteredFoods.length - 1; f > 0; f--) {
      const k = Math.floor(Math.random() * (f + 1));
      [filteredFoods[f], filteredFoods[k]] = [filteredFoods[k], filteredFoods[f]];
    }
  }

  // Select from a larger random pool
  const poolSize = Math.min(10, filteredFoods.length);
  const randomPool = filteredFoods.slice(0, poolSize);
  
  if (randomPool.length > 0) {
    const selected = randomPool[Math.floor(Math.random() * randomPool.length)];
    
    return {
      _id: (selected._id ? selected._id.toString() : null) || new Date().getTime().toString(),
      name: selected.name || 'Unknown Meal',
      photo: selected.photo || 'https://via.placeholder.com/400x200?text=No+Image',
      calories: Number(selected.calories) || 0,
      course: selected.course || 'Unknown',
      cookingTime: Number(selected.cookingTime) || 30,
      description: selected.description || 'No description available',
      recipe: selected.recipe || 'Recipe not available',
      protein: Number(selected.protein) || 0,
      fats: Number(selected.fats) || 0,
      carbs: Number(selected.carbs) || 0,
      fibre: Number(selected.fibre) || 0,
      sugar: Number(selected.sugar) || 0,
      addedSugar: Number(selected.addedSugar) || 0,
      sodium: Number(selected.sodium) || 0,
      portionSize: Number(selected.portionSize) || 100,
      filter: Array.isArray(selected.filter) ? selected.filter : []
    };
  }
  
  return null;
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
  rerollDay,
  addNextDay,
  updateRollingMealPlan
};