const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// TODO: Import user controller functions once created
// const { getProfile, updateProfile } = require('../controllers/userController');

// Protected routes
router.use(protect);

// TODO: Add actual route handlers once controller is created
router.get('/profile', (req, res) => {
  res.json({ message: 'Profile route' });
});

router.put('/profile', (req, res) => {
  res.json({ message: 'Update profile route' });
});

module.exports = router; 