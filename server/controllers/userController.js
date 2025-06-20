const User = require('../models/User');

// Save quiz answers to user profile
exports.saveQuizAnswers = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      age,
      height,
      weight,
      activityLevel,
      dietaryPreferences,
      healthConditions,
      fitnessGoals
    } = req.body;

    // Calculate calorie and macro goals (simple example, adjust as needed)
    const calorieGoal = 2000; // You can calculate based on quiz answers
    const proteinGoal = Math.round(weight * 1.2); // Example: 1.2g per kg
    const carbGoal = Math.round(calorieGoal * 0.5 / 4);
    const fatGoal = Math.round(calorieGoal * 0.25 / 9);

    // Update user document with quiz answers in profile and preferences
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'profile.age': age,
          'profile.height': height,
          'profile.weight': weight,
          'profile.activityLevel': activityLevel,
          'profile.dietaryRestrictions': dietaryPreferences,
          'profile.goals': fitnessGoals,
          'profile.healthConditions': healthConditions,
          'preferences.calorieGoal': calorieGoal,
          'preferences.proteinGoal': proteinGoal,
          'preferences.carbGoal': carbGoal,
          'preferences.fatGoal': fatGoal,
          quizCompleted: true
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error saving quiz answers:', error);
    res.status(500).json({ success: false, error: 'Failed to save quiz answers' });
  }
};
