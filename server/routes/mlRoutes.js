const express = require('express');
const router = express.Router();

// Proxy route to ML service for workout predictions
router.post('/predict-workout', async (req, res) => {
  try {
    const fetch = await import('node-fetch').then(mod => mod.default);
    
    const response = await fetch('http://localhost:5001/predict-workout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`ML service responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML service error:', error);
    res.status(500).json({ 
      error: 'Failed to get workout recommendations',
      details: error.message 
    });
  }
});

router.post('/workout-suggestions', async (req, res) => {
  try {
    const fetch = await import('node-fetch').then(mod => mod.default);
    
    const response = await fetch('http://localhost:5001/workout-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      throw new Error(`ML service responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML service error:', error);
    res.status(500).json({ 
      error: 'Failed to get workout suggestions',
      details: error.message 
    });
  }
});

// Health check for ML service
router.get('/health', async (req, res) => {
  try {
    const fetch = await import('node-fetch').then(mod => mod.default);
    
    const response = await fetch('http://localhost:5001/health');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ML service health check error:', error);
    res.status(500).json({ 
      error: 'ML service unavailable',
      details: error.message 
    });
  }
});

module.exports = router;
