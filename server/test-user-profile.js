const mongoose = require('mongoose');
const User = require('./models/User');
const Dashboard = require('./models/Dashboard');
const GoalCalculationService = require('./services/GoalCalculationService');
require('dotenv').config();

const testUserProfile = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user gayu from the screenshot
    const user = await User.findOne({ name: 'gayu' });
    if (!user) {
      console.log('❌ User gayu not found, using first user');
      const users = await User.find().select('name email profile preferences');
      if (users.length === 0) {
        console.log('❌ No users found in database');
        return;
      }
      user = users[0];
    }

    console.log(`\n🎯 Testing with user: ${user.name} (${user.email})`);

    console.log('📊 USER PROFILE ANALYSIS:');
    console.log('=========================');
    console.log('User ID:', user._id);
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    
    console.log('\n📋 PROFILE DATA:');
    console.log('Profile:', user.profile);
    
    console.log('\n🎯 PREFERENCES:');
    console.log('Preferences:', user.preferences);
    
    console.log('\n🧮 SMART GOAL CALCULATION TEST:');
    try {
      const calculatedGoals = await GoalCalculationService.calculateUserGoals(user._id);
      console.log('✅ Smart Goals Calculated:', calculatedGoals);
    } catch (error) {
      console.log('❌ Smart Goal Calculation Failed:', error.message);
      console.log('🔧 Fallback goals will be used');
    }

    console.log('\n📈 DASHBOARD STATUS:');
    const dashboard = await Dashboard.findOne({ user: user._id });
    if (dashboard) {
      console.log('✅ Dashboard exists');
      console.log('Weekly Progress:', dashboard.weeklyProgress);
      console.log('Today\'s Goals:', dashboard.todaysGoals);
      console.log('Week Start Date:', dashboard.weekStartDate);
      
      // Test weekly targets calculation
      try {
        const weeklyTargets = await dashboard.getWeeklyTargets();
        console.log('✅ Weekly Targets:', weeklyTargets);
      } catch (error) {
        console.log('❌ Weekly Targets Failed:', error.message);
      }
    } else {
      console.log('❌ No dashboard found');
    }

    console.log('\n🔍 GAPS ANALYSIS:');
    const issues = [];
    
    if (!user.profile || !user.profile.age) issues.push('Missing age');
    if (!user.profile || !user.profile.height) issues.push('Missing height');
    if (!user.profile || !user.profile.weight) issues.push('Missing weight');
    if (!user.profile || !user.profile.gender) issues.push('Missing gender');
    if (!user.profile || !user.profile.activityLevel) issues.push('Missing activity level');
    if (!user.profile || !user.profile.goals || user.profile.goals.length === 0) issues.push('Missing goals');
    
    if (issues.length > 0) {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      console.log('✅ All required profile data present');
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testUserProfile();
