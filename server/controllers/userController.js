const User = require('../models/User');
const GoalCalculationService = require('../services/GoalCalculationService');

// Save quiz answers to user profile with smart goal calculations
exports.saveQuizAnswers = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      age,
      height,
      weight,
      gender,
      activityLevel,
      dietaryPreferences,
      healthConditions,
      fitnessGoals
    } = req.body;

    // First, update user profile with all the demographic data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.age': age,
          'profile.height': height,
          'profile.weight': weight,
          'profile.gender': gender,
          'profile.activityLevel': activityLevel,
          'profile.filters': dietaryPreferences,
          'profile.goals': fitnessGoals,
          'profile.healthConditions': healthConditions,
          quizCompleted: true
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Now calculate smart goals based on the updated profile
    try {
      const calculatedGoals = await GoalCalculationService.calculateUserGoals(userId);
      
      // Update user preferences with calculated goals
      const finalUser = await User.findByIdAndUpdate(
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

      res.json({ 
        success: true, 
        user: finalUser,
        calculatedGoals: calculatedGoals,
        message: `Goals calculated successfully! Daily targets: ${calculatedGoals.calories} calories, ${calculatedGoals.protein}g protein, ${calculatedGoals.water} glasses water, ${Math.round(calculatedGoals.exercise/7)} min exercise.`
      });

    } catch (calculationError) {
      console.error('Goal calculation failed, using fallback:', calculationError.message);
      
      // Fallback to basic calculations if smart calculation fails
      const calorieGoal = 2000;
      const proteinGoal = Math.round(weight * 1.2);
      const carbGoal = Math.round(calorieGoal * 0.5 / 4);
      const fatGoal = Math.round(calorieGoal * 0.25 / 9);

      const finalUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            'preferences.calorieGoal': calorieGoal,
            'preferences.proteinGoal': proteinGoal,
            'preferences.carbGoal': carbGoal,
            'preferences.fatGoal': fatGoal
          }
        },
        { new: true }
      );

      res.json({ 
        success: true, 
        user: finalUser,
        message: 'Profile updated with basic goal calculations. Complete your profile for personalized goals.',
        fallback: true
      });
    }

  } catch (error) {
    console.error('Error saving quiz answers:', error);
    res.status(500).json({ success: false, error: 'Failed to save quiz answers' });
  }
};
