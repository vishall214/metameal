const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = "mongodb+srv://vishalnyapathi214:5QgwpkLnDSoxkdvf@maindb.mx4soxz.mongodb.net/main?retryWrites=true&w=majority&appName=MainDB";

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'testuser@metameal.com' });
    if (existingUser) {
      console.log('Test user already exists with ID:', existingUser._id);
      
      // Update the profile with test data
      existingUser.profile = {
        age: 28,
        height: 1.75, // in meters
        weight: 70,   // in kg
        gender: 'male',
        activityLevel: 'moderate',
        filters: [],
        dietaryRestrictions: [],
        allergies: [],
        goals: ['fitness', 'health']
      };
      
      await existingUser.save();
      console.log('✅ Updated test user profile');
      console.log('User ID for testing:', existingUser._id.toString());
      
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create test user with complete profile
    const testUser = new User({
      username: 'testuser',
      email: 'testuser@metameal.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'user',
      profile: {
        age: 28,
        height: 1.75, // in meters
        weight: 70,   // in kg
        gender: 'male',
        activityLevel: 'moderate',
        filters: [],
        dietaryRestrictions: [],
        allergies: [],
        goals: ['fitness', 'health']
      },
      isVerified: true
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: testuser@metameal.com');
    console.log('Password: password123');
    console.log('User ID for testing:', testUser._id.toString());

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    await mongoose.disconnect();
  }
}

createTestUser();
