const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// Protected routes
router.use(protect);

router.get('/user-stats', (req, res) => {
  res.json({ message: 'Get user stats route' });
});

router.get('/meal-stats', (req, res) => {
  res.json({ message: 'Get meal stats route' });
});

module.exports = router;
