const Quiz = require('../models/Quiz');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Submit quiz answers
// @route   POST /api/quiz
// @access  Private
const submitQuiz = asyncHandler(async (req, res) => {
  const { age, height, weight, activityLevel, dietaryPreferences, healthConditions, fitnessGoals } = req.body;

  // Calculate BMI
  const heightInMeters = height / 100;
  const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

  // Determine BMI category
  let bmiCategory;
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // Check if user has already completed a quiz
  let quiz = await Quiz.findOne({ user: req.user._id });

  if (quiz) {
    // Update existing quiz
    quiz.age = age;
    quiz.height = height;
    quiz.weight = weight;
    quiz.bmi = bmi;
    quiz.bmiCategory = bmiCategory;
    quiz.activityLevel = activityLevel;
    quiz.dietaryPreferences = dietaryPreferences;
    quiz.healthConditions = healthConditions;
    quiz.fitnessGoals = fitnessGoals;
    quiz.completedAt = Date.now();

    await quiz.save();
  } else {
    // Create new quiz
    quiz = await Quiz.create({
      user: req.user._id,
      age,
      height,
      weight,
      bmi,
      bmiCategory,
      activityLevel,
      dietaryPreferences,
      healthConditions,
      fitnessGoals
    });
  }

  res.status(201).json(quiz);
});

// @desc    Get user's quiz results
// @route   GET /api/quiz
// @access  Private
const getQuizResults = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ user: req.user._id });

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  res.status(200).json(quiz);
});

// Get user's latest quiz result
exports.getLatestQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'No quiz results found'
      });
    }

    res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's quiz history
exports.getQuizHistory = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  submitQuiz,
  getQuizResults
}; 