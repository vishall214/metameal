const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');

// TODO: Import consultation controller functions once created
// const { getConsultations, bookConsultation } = require('../controllers/consultationController');

// Protected routes
router.use(protect);

router.get('/', (req, res) => {
  res.json({ message: 'Get consultations route' });
});

router.post('/book', (req, res) => {
  res.json({ message: 'Book consultation route' });
});

module.exports = router; 