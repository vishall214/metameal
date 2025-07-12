const mongoose = require('mongoose');
const User = require('./models/User');
const Dashboard = require('./models/Dashboard');
const MealPlan = require('./models/MealPlan');

async function testDashboardSystem() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/metameal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Find a test user
    const testUser = await User.findOne().limit(1);
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }
    console.log(`✅ Found test user: ${testUser.name || testUser.email}`);
    console.log(`   User preferences: Calories=${testUser.calorieGoal}, Protein=${testUser.proteinGoal}`);

    // Test 2: Initialize dashboard for user
    let dashboard = await Dashboard.findOne({ user: testUser._id });
    if (!dashboard) {
      dashboard = new Dashboard({
        user: testUser._id,
        weeklyProgress: {
          calories: 0,
          protein: 0,
          water: 0,
          exercise: 0
        },
        todaysGoals: {
          calories: false,
          protein: false,
          water: false,
          exercise: false
        }
      });
      await dashboard.save();
      console.log('✅ Created new dashboard for user');
    } else {
      console.log('✅ Found existing dashboard for user');
    }

    // Test 3: Test user-specific target calculations
    const userCalorieTarget = (testUser.calorieGoal || 2000) * 7;
    const userProteinTarget = (testUser.proteinGoal || 150) * 7;
    const waterTarget = 56; // 8 glasses * 7 days
    const exerciseTarget = 210; // 30 minutes * 7 days

    console.log('\n📊 User-specific weekly targets:');
    console.log(`   Calories: ${userCalorieTarget} (${testUser.calorieGoal || 2000}/day)`);
    console.log(`   Protein: ${userProteinTarget}g (${testUser.proteinGoal || 150}g/day)`);
    console.log(`   Water: ${waterTarget} glasses (8/day)`);
    console.log(`   Exercise: ${exerciseTarget} minutes (30/day)`);

    // Test 4: Current progress
    console.log('\n📈 Current weekly progress:');
    console.log(`   Calories: ${dashboard.weeklyProgress.calories}/${userCalorieTarget}`);
    console.log(`   Protein: ${dashboard.weeklyProgress.protein}g/${userProteinTarget}g`);
    console.log(`   Water: ${dashboard.weeklyProgress.water}/${waterTarget} glasses`);
    console.log(`   Exercise: ${dashboard.weeklyProgress.exercise}/${exerciseTarget} minutes`);

    // Test 5: Test goal completion simulation
    console.log('\n🎯 Testing goal completion...');
    
    // Simulate completing a calorie goal
    const calorieContribution = testUser.calorieGoal || 2000;
    dashboard.weeklyProgress.calories += calorieContribution;
    await dashboard.save();
    console.log(`✅ Added ${calorieContribution} calories to weekly progress`);

    // Simulate completing a protein goal
    const proteinContribution = testUser.proteinGoal || 150;
    dashboard.weeklyProgress.protein += proteinContribution;
    await dashboard.save();
    console.log(`✅ Added ${proteinContribution}g protein to weekly progress`);

    // Test 6: Check for meal plan integration
    const mealPlan = await MealPlan.findOne({ user: testUser._id, status: 'active' });
    if (mealPlan) {
      console.log('\n🍽️ Found active meal plan for user');
      console.log(`   Total meals in plan: ${mealPlan.meals.length}`);
      
      // Get today's day
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      const todaysMeals = mealPlan.meals.filter(meal => meal.day === today);
      console.log(`   Meals for ${today}: ${todaysMeals.length}`);
    } else {
      console.log('\n🍽️ No active meal plan found for user');
    }

    // Test 7: Final progress check
    const updatedDashboard = await Dashboard.findOne({ user: testUser._id });
    console.log('\n📊 Updated weekly progress:');
    console.log(`   Calories: ${updatedDashboard.weeklyProgress.calories}/${userCalorieTarget} (${Math.round((updatedDashboard.weeklyProgress.calories/userCalorieTarget)*100)}%)`);
    console.log(`   Protein: ${updatedDashboard.weeklyProgress.protein}g/${userProteinTarget}g (${Math.round((updatedDashboard.weeklyProgress.protein/userProteinTarget)*100)}%)`);
    console.log(`   Water: ${updatedDashboard.weeklyProgress.water}/${waterTarget} glasses (${Math.round((updatedDashboard.weeklyProgress.water/waterTarget)*100)}%)`);
    console.log(`   Exercise: ${updatedDashboard.weeklyProgress.exercise}/${exerciseTarget} minutes (${Math.round((updatedDashboard.weeklyProgress.exercise/exerciseTarget)*100)}%)`);

    console.log('\n✅ Dashboard system test completed successfully!');

  } catch (error) {
    console.error('❌ Dashboard system test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testDashboardSystem();
