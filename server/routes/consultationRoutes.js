const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', (req, res) => {
  res.json({ message: 'Get consultations route' });
});

router.post('/book', (req, res) => {
  res.json({ message: 'Book consultation route' });
});

module.exports = router; 