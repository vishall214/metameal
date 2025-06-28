const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/config');

async function verifySetup() {
  try {
    console.log('🔍 Verifying database setup...');
    
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI, {
      dbName: 'main'
    });
    console.log('✅ MongoDB connected successfully');
    
    // Check if test user exists
    const testUser = await User.findOne({ email: 'vishalnyapathi214@gmail.com' });
    
    if (!testUser) {
      console.log('👤 Creating test user...');
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Create test user
      await User.create({
        username: 'vishal214',
        email: 'vishalnyapathi214@gmail.com',
        name: 'Vishal Nyapathi',
        password: hashedPassword,
        isVerified: true,
        profile: {
          age: 25,
          height: 175,
          weight: 70,
          gender: 'male',
          activityLevel: 'moderate',
          filters: ['non-veg'],
          goals: ['weight_loss']
        },
        quizCompleted: true
      });
      
      console.log('✅ Test user created successfully');
    } else {
      console.log('✅ Test user already exists');
    }
    
    // Count total users
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);
    
    console.log('🎉 Database setup verification complete!');
    
  } catch (error) {
    console.error('❌ Setup verification failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

verifySetup();
