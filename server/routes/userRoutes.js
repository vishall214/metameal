const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { saveQuizAnswers } = require('../controllers/userController');

// Protect all routes below
router.use(protect);

router.get('/profile', (req, res) => {
  res.json({ message: 'Profile route' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile route' });
});

// Save quiz answers to user profile
router.post('/quiz', saveQuizAnswers);

module.exports = router;