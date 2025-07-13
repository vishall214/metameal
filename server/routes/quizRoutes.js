const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { completeQuiz } = require('../controllers/quizController');

router.use(protect);
router.post('/complete', completeQuiz);

module.exports = router;
