const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { submitQuiz, getQuizResults } = require('../controllers/quizController');

// Base route: /api/quiz
router.route('/')
  .post(protect, submitQuiz)
  .get(protect, getQuizResults);

module.exports = router; 