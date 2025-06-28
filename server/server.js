const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/config');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mealRoutes = require('./routes/mealRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRoutes = require('./routes/profileRoutes');
const quizRoutes = require('./routes/quizRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: config.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/quiz', quizRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server with port fallback
const startServer = (port) => {
  // Ensure port is a number and within valid range
  const portNum = parseInt(port);
  if (portNum > 65535) {
    console.error('Cannot find available port, giving up');
    process.exit(1);
  }

  try {
    const server = app.listen(portNum, () => {
      console.log(`🚀 Server running on port ${portNum} in ${config.NODE_ENV} mode`);
    });

    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`Port ${portNum} is busy, trying ${portNum + 1}...`);
        startServer(portNum + 1);
      } else {
        console.error('Server error:', e);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(config.PORT);
