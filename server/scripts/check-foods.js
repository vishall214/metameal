const mongoose = require('mongoose');
const Food = require('../models/Food');
const config = require('../config/config');

async function checkFoods() {
  try {
    console.log('🔍 Checking Food collection...');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      dbName: 'main'
    });
    console.log('✅ MongoDB connected successfully');
    
    // Count foods
    const foodCount = await Food.countDocuments();
    console.log(`📊 Total foods in database: ${foodCount}`);
    
    if (foodCount > 0) {
      // Get a sample food
      const sampleFood = await Food.findOne();
      console.log('📋 Sample food structure:');
      console.log(JSON.stringify(sampleFood, null, 2));
      
      // Check for foods by course
      const courses = ['breakfast', 'main course', 'snacks', 'dessert'];
      for (const course of courses) {
        const count = await Food.countDocuments({ course });
        console.log(`📊 ${course}: ${count} foods`);
      }
    } else {
      console.log('❌ No foods found in database! Need to seed data.');
    }
    
  } catch (error) {
    console.error('❌ Error checking foods:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkFoods();
