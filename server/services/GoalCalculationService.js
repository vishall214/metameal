const User = require('../models/User');

/**
 * Advanced Goal Calculation Service
 * Calculates personalized nutrition and fitness goals based on user demographics,
 * activity level, health conditions, and fitness objectives
 */

class GoalCalculationService {
  
  /**
   * Calculate BMR using Harris-Benedict equation
   */
  static calculateBMR(age, height, weight, gender) {
    if (!age || !height || !weight || !gender) {
      throw new Error('Missing required demographic data for BMR calculation');
    }

    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else if (gender === 'female') {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    } else {
      // For 'other' gender, use average of male/female calculations
      const maleBMR = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
      const femaleBMR = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
      bmr = (maleBMR + femaleBMR) / 2;
    }
    
    return Math.round(bmr);
  }

  /**
   * Calculate TDEE (Total Daily Energy Expenditure)
   */
  static calculateTDEE(bmr, activityLevel) {
    const activityMultipliers = {
      'sedentary': 1.2,        // Little/no exercise
      'light': 1.375,         // Light exercise 1-3 days/week
      'moderate': 1.55,       // Moderate exercise 3-5 days/week
      'active': 1.725,        // Heavy exercise 6-7 days/week
      'very_active': 1.9      // Very heavy exercise & physical job
    };

    const multiplier = activityMultipliers[activityLevel] || 1.2;
    return Math.round(bmr * multiplier);
  }

  /**
   * Adjust calories based on fitness goals
   */
  static adjustCaloriesForGoals(tdee, fitnessGoals = []) {
    let calorieAdjustment = 0;
    
    // Goal-based adjustments (can have multiple goals)
    if (fitnessGoals.includes('weight_loss') || fitnessGoals.includes('lose_weight')) {
      calorieAdjustment -= 500; // 1lb/week deficit
    }
    if (fitnessGoals.includes('weight_gain') || fitnessGoals.includes('gain_weight')) {
      calorieAdjustment += 500; // 1lb/week surplus
    }
    if (fitnessGoals.includes('muscle_gain') || fitnessGoals.includes('build_muscle')) {
      calorieAdjustment += 300; // Slight surplus for muscle building
    }
    if (fitnessGoals.includes('maintain_weight') || fitnessGoals.includes('maintenance')) {
      calorieAdjustment += 0; // No change
    }
    
    // Ensure minimum safe calories
    const adjustedCalories = tdee + calorieAdjustment;
    return Math.max(1200, adjustedCalories);
  }

  /**
   * Calculate personalized protein needs
   */
  static calculateProteinGoal(weight, fitnessGoals = [], activityLevel = 'sedentary') {
    let proteinPerKg = 0.8; // Base RDA
    
    // Adjust based on goals
    if (fitnessGoals.includes('muscle_gain') || fitnessGoals.includes('build_muscle')) {
      proteinPerKg = 2.2; // High protein for muscle building
    } else if (fitnessGoals.includes('weight_loss') || fitnessGoals.includes('lose_weight')) {
      proteinPerKg = 1.6; // Higher protein to preserve muscle during weight loss
    } else if (fitnessGoals.includes('athletic_performance')) {
      proteinPerKg = 1.8; // Athletic performance
    }
    
    // Activity level bonus
    if (activityLevel === 'very_active' || activityLevel === 'active') {
      proteinPerKg += 0.3; // Extra protein for active individuals
    }
    
    return Math.round(weight * proteinPerKg);
  }

  /**
   * Adjust macros based on health conditions
   */
  static adjustMacrosForHealthConditions(calories, filters = []) {
    let proteinPercent = 0.25; // 25% of calories from protein
    let carbPercent = 0.45;    // 45% of calories from carbs
    let fatPercent = 0.30;     // 30% of calories from fat
    
    // Diabetes management
    if (filters.includes('diabetes')) {
      carbPercent = 0.35;      // Lower carbs (35%)
      proteinPercent = 0.30;   // Higher protein (30%)
      fatPercent = 0.35;       // Higher healthy fats (35%)
    }
    
    // Thyroid support
    if (filters.includes('thyroid')) {
      proteinPercent = 0.30;   // Higher protein to support metabolism
      carbPercent = 0.40;      // Moderate carbs
      fatPercent = 0.30;       // Standard fats
    }
    
    // High blood pressure
    if (filters.includes('high BP')) {
      // No major macro changes, but this could influence food choices
      proteinPercent = 0.25;
      carbPercent = 0.45;
      fatPercent = 0.30;
    }
    
    return {
      protein: Math.round((calories * proteinPercent) / 4), // 4 cal per gram
      carbs: Math.round((calories * carbPercent) / 4),      // 4 cal per gram
      fats: Math.round((calories * fatPercent) / 9)         // 9 cal per gram
    };
  }

  /**
   * Calculate exercise goals based on activity level and goals
   */
  static calculateExerciseGoal(activityLevel, fitnessGoals = [], filters = []) {
    let baseMinutes = 150; // WHO recommendation (weekly)
    
    // Adjust for current activity level
    const activityAdjustments = {
      'sedentary': 0,      // Start with base
      'light': 30,         // Already doing some exercise
      'moderate': 60,      // Moderate exerciser
      'active': 90,        // Active individual
      'very_active': 120   // Very active
    };
    
    baseMinutes += activityAdjustments[activityLevel] || 0;
    
    // Adjust for health conditions
    if (filters.includes('diabetes')) baseMinutes += 30;    // Extra cardio for blood sugar
    if (filters.includes('high BP')) baseMinutes += 20;     // Heart health
    if (filters.includes('thyroid')) baseMinutes -= 10;     // Gentler approach
    
    // Adjust for goals
    if (fitnessGoals.includes('weight_loss')) baseMinutes += 60;   // More cardio
    if (fitnessGoals.includes('muscle_gain')) baseMinutes += 90;   // Include strength training
    if (fitnessGoals.includes('athletic_performance')) baseMinutes += 120; // High performance
    
    return Math.max(150, baseMinutes); // Minimum WHO recommendation
  }

  /**
   * Calculate water intake based on weight and activity
   */
  static calculateWaterGoal(weight, activityLevel, fitnessGoals = []) {
    // Base water needs: 35ml per kg of body weight
    let baseWaterMl = weight * 35;
    
    // Activity level adjustments
    const activityWaterBonus = {
      'sedentary': 0,
      'light': 250,
      'moderate': 500,
      'active': 750,
      'very_active': 1000
    };
    
    baseWaterMl += activityWaterBonus[activityLevel] || 0;
    
    // Goal adjustments
    if (fitnessGoals.includes('weight_loss')) baseWaterMl += 250; // Metabolism boost
    if (fitnessGoals.includes('muscle_gain')) baseWaterMl += 500; // Muscle hydration
    
    // Convert to glasses (250ml each)
    return Math.round(baseWaterMl / 250);
  }

  /**
   * Main function to calculate all goals for a user
   */
  static async calculateUserGoals(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { profile, preferences } = user;
      const { age, height, weight, gender, activityLevel, filters, goals } = profile;

      // Check if we have the minimum required data
      if (!age || !height || !weight || !gender || !activityLevel) {
        // Return default values with current preferences if available
        return {
          calories: preferences?.calorieGoal || 2000,
          protein: preferences?.proteinGoal || 120,
          carbs: preferences?.carbGoal || 250,
          fats: preferences?.fatGoal || 65,
          water: 8,
          exercise: 210, // 30 min x 7 days
          calculated: false,
          reason: 'Missing profile data for calculation'
        };
      }

      // Calculate BMR and TDEE
      const bmr = this.calculateBMR(age, height, weight, gender);
      const tdee = this.calculateTDEE(bmr, activityLevel);

      // Adjust calories for fitness goals
      const dailyCalories = this.adjustCaloriesForGoals(tdee, goals);

      // Calculate protein based on goals and activity
      const dailyProtein = this.calculateProteinGoal(weight, goals, activityLevel);

      // Get health-condition adjusted macros
      const macros = this.adjustMacrosForHealthConditions(dailyCalories, filters);

      // Calculate water and exercise goals
      const dailyWater = this.calculateWaterGoal(weight, activityLevel, goals);
      const weeklyExercise = this.calculateExerciseGoal(activityLevel, goals, filters);

      return {
        calories: dailyCalories,
        protein: Math.max(dailyProtein, macros.protein), // Use higher of goal-based or macro-based
        carbs: macros.carbs,
        fats: macros.fats,
        water: dailyWater,
        exercise: weeklyExercise,
        calculated: true,
        bmr: bmr,
        tdee: tdee,
        adjustments: {
          goals: goals,
          filters: filters,
          activityLevel: activityLevel
        }
      };

    } catch (error) {
      console.error('Error calculating user goals:', error);
      throw error;
    }
  }

  /**
   * Update user preferences with calculated goals
   */
  static async updateUserPreferences(userId) {
    try {
      const calculatedGoals = await this.calculateUserGoals(userId);
      
      // Update user preferences
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.calorieGoal': calculatedGoals.calories,
            'preferences.proteinGoal': calculatedGoals.protein,
            'preferences.carbGoal': calculatedGoals.carbs,
            'preferences.fatGoal': calculatedGoals.fats
          }
        },
        { new: true }
      );

      return {
        user: updatedUser,
        calculatedGoals: calculatedGoals
      };

    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }
}

module.exports = GoalCalculationService;
