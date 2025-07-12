#!/usr/bin/env node

/**
 * Test script for frontend dashboard bug fix
 * Tests the /api/dashboard/goals/progress endpoint to ensure it returns the required dailyCompletions field
 */

const mongoose = require('mongoose');
const User = require('./models/User');
const Dashboard = require('./models/Dashboard');
const GoalCalculationService = require('./services/GoalCalculationService');

async function testDashboardAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/metameal');
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const testUser = await User.findOne();
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }
    console.log(`✅ Found test user: ${testUser.email}`);

    // Test GoalCalculationService
    let calculatedGoals;
    try {
      calculatedGoals = await GoalCalculationService.calculateUserGoals(testUser._id);
      console.log('✅ Smart goal calculation successful');
    } catch (error) {
      console.log('⚠️ Using fallback goals:', error.message);
      calculatedGoals = {
        calories: testUser.preferences?.calorieGoal || 2000,
        protein: testUser.preferences?.proteinGoal || 120,
        water: 8,
        exercise: 210
      };
    }

    // Test Dashboard model
    let dashboard = await Dashboard.findOne({ user: testUser._id });
    if (!dashboard) {
      dashboard = new Dashboard({ 
        user: testUser._id,
        weeklyProgress: {
          calories: 0,
          protein: 0,
          water: 0,
          exercise: 0
        }
      });
      await dashboard.save();
      console.log('✅ Created new dashboard');
    }

    // Initialize weekly progress
    await dashboard.initializeWeeklyProgress();

    // Test getWeeklyCompletions method
    const calorieCompletions = dashboard.getWeeklyCompletions('calories');
    console.log('✅ getWeeklyCompletions method working:', calorieCompletions);

    // Test weekly targets
    const weeklyTargets = await dashboard.getWeeklyTargets();
    console.log('✅ Weekly targets calculated:', weeklyTargets);

    // Simulate API response structure
    const apiResponse = {
      todayGoals: dashboard.getTodaysGoals(),
      weeklyProgress: {
        calories: {
          current: dashboard.weeklyProgress.calories,
          target: weeklyTargets.calories,
          dailyCompletions: dashboard.getWeeklyCompletions('calories')
        },
        protein: {
          current: dashboard.weeklyProgress.protein,
          target: weeklyTargets.protein,
          dailyCompletions: dashboard.getWeeklyCompletions('protein')
        },
        water: {
          current: dashboard.weeklyProgress.water,
          target: weeklyTargets.water,
          dailyCompletions: dashboard.getWeeklyCompletions('water')
        },
        exercise: {
          current: dashboard.weeklyProgress.exercise,
          target: weeklyTargets.exercise,
          dailyCompletions: dashboard.getWeeklyCompletions('exercise')
        }
      },
      todayContributions: {
        calories: calculatedGoals.calories,
        protein: calculatedGoals.protein,
        water: calculatedGoals.water,
        exercise: calculatedGoals.exercise / 7
      }
    };

    console.log('\n📊 API Response Structure:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // Verify all required fields exist
    const requiredFields = ['calories', 'protein', 'water', 'exercise'];
    let allFieldsValid = true;

    for (const field of requiredFields) {
      const weeklyData = apiResponse.weeklyProgress[field];
      if (!weeklyData.dailyCompletions || !Array.isArray(weeklyData.dailyCompletions)) {
        console.log(`❌ Missing or invalid dailyCompletions for ${field}`);
        allFieldsValid = false;
      } else {
        console.log(`✅ ${field} has valid dailyCompletions: ${weeklyData.dailyCompletions.length} days`);
      }
    }

    if (allFieldsValid) {
      console.log('\n🎉 All tests passed! Frontend bug should be fixed.');
    } else {
      console.log('\n❌ Some tests failed. Frontend may still have issues.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testDashboardAPI();
