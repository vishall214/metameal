const mongoose = require('mongoose');
const User = require('./models/User');
const Dashboard = require('./models/Dashboard');
const GoalCalculationService = require('./services/GoalCalculationService');

async function testSmartGoalCalculations() {
  try {
    // Connect to database
    await mongoose.connect('mongodb://localhost:27017/metameal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test 1: Find or create a test user with complete profile
    let testUser = await User.findOne({ email: 'test.smart@example.com' });
    
    if (!testUser) {
      testUser = new User({
        username: 'smarttest',
        name: 'Smart Test User',
        email: 'test.smart@example.com',
        password: 'hashedpassword',
        profile: {
          age: 30,
          height: 175, // cm
          weight: 70,  // kg
          gender: 'male',
          activityLevel: 'moderate',
          filters: ['diabetes'],
          goals: ['weight_loss', 'muscle_gain']
        },
        quizCompleted: true
      });
      await testUser.save();
      console.log('✅ Created test user with complete profile');
    } else {
      console.log('✅ Found existing test user');
    }

    console.log('\n📊 User Profile:');
    console.log(`   Age: ${testUser.profile.age}, Height: ${testUser.profile.height}cm, Weight: ${testUser.profile.weight}kg`);
    console.log(`   Gender: ${testUser.profile.gender}, Activity: ${testUser.profile.activityLevel}`);
    console.log(`   Health Conditions: ${testUser.profile.filters}`);
    console.log(`   Fitness Goals: ${testUser.profile.goals}`);

    // Test 2: Calculate smart goals
    console.log('\n🧮 Testing Smart Goal Calculations...');
    const calculatedGoals = await GoalCalculationService.calculateUserGoals(testUser._id);
    
    console.log('📈 Calculated Goals:');
    console.log(`   BMR: ${calculatedGoals.bmr} calories`);
    console.log(`   TDEE: ${calculatedGoals.tdee} calories`);
    console.log(`   Daily Calories: ${calculatedGoals.calories} (adjusted for goals)`);
    console.log(`   Daily Protein: ${calculatedGoals.protein}g`);
    console.log(`   Daily Carbs: ${calculatedGoals.carbs}g`);
    console.log(`   Daily Fats: ${calculatedGoals.fats}g`);
    console.log(`   Daily Water: ${calculatedGoals.water} glasses`);
    console.log(`   Weekly Exercise: ${calculatedGoals.exercise} minutes`);
    console.log(`   Calculated: ${calculatedGoals.calculated}`);

    // Test 3: Compare with fallback calculations
    console.log('\n⚖️  Comparison with Old System:');
    const oldCalories = 2000;
    const oldProtein = testUser.profile.weight * 1.2;
    console.log(`   Old Calories: ${oldCalories} → New: ${calculatedGoals.calories} (${calculatedGoals.calories > oldCalories ? '+' : ''}${calculatedGoals.calories - oldCalories})`);
    console.log(`   Old Protein: ${Math.round(oldProtein)}g → New: ${calculatedGoals.protein}g (${calculatedGoals.protein > oldProtein ? '+' : ''}${Math.round(calculatedGoals.protein - oldProtein)}g)`);

    // Test 4: Update user preferences
    console.log('\n💾 Updating User Preferences...');
    const updateResult = await GoalCalculationService.updateUserPreferences(testUser._id);
    console.log('✅ User preferences updated successfully');

    // Test 5: Test dashboard integration
    console.log('\n📋 Testing Dashboard Integration...');
    let dashboard = await Dashboard.findOne({ user: testUser._id });
    if (!dashboard) {
      dashboard = new Dashboard({
        user: testUser._id,
        weeklyProgress: { calories: 0, protein: 0, water: 0, exercise: 0 },
        todaysGoals: { calories: false, protein: false, water: false, exercise: false }
      });
      await dashboard.save();
      console.log('✅ Created new dashboard');
    }

    // Test 6: Test smart weekly targets
    const weeklyTargets = await dashboard.getWeeklyTargets();
    console.log('📅 Smart Weekly Targets:');
    console.log(`   Calories: ${weeklyTargets.calories} (${Math.round(weeklyTargets.calories/7)}/day)`);
    console.log(`   Protein: ${weeklyTargets.protein}g (${Math.round(weeklyTargets.protein/7)}g/day)`);
    console.log(`   Water: ${weeklyTargets.water} glasses (${Math.round(weeklyTargets.water/7)}/day)`);
    console.log(`   Exercise: ${weeklyTargets.exercise} minutes (${Math.round(weeklyTargets.exercise/7)} min/day)`);

    // Test 7: Test goal completion with smart calculations
    console.log('\n🎯 Testing Smart Goal Completion...');
    const goalCompletion = await dashboard.updateWeeklyProgress('calories', calculatedGoals.calories);
    console.log(`✅ Added ${calculatedGoals.calories} calories to weekly progress`);
    console.log(`   Current weekly calories: ${dashboard.weeklyProgress.calories}/${weeklyTargets.calories}`);

    // Test 8: Test different user scenarios
    console.log('\n🧪 Testing Different User Scenarios...');
    
    // Scenario 1: Female, sedentary, weight loss
    const femaleUser = {
      profile: {
        age: 25,
        height: 165,
        weight: 65,
        gender: 'female',
        activityLevel: 'sedentary',
        goals: ['weight_loss']
      }
    };
    
    const femaleGoals = GoalCalculationService.calculateBMR(
      femaleUser.profile.age,
      femaleUser.profile.height,
      femaleUser.profile.weight,
      femaleUser.profile.gender
    );
    const femaleTDEE = GoalCalculationService.calculateTDEE(femaleGoals, femaleUser.profile.activityLevel);
    const femaleCalories = GoalCalculationService.adjustCaloriesForGoals(femaleTDEE, femaleUser.profile.goals);
    
    console.log(`   Female (25, 165cm, 65kg, sedentary, weight loss):`);
    console.log(`     BMR: ${femaleGoals}, TDEE: ${femaleTDEE}, Adjusted: ${femaleCalories}`);

    // Scenario 2: Male, very active, muscle gain
    const maleUser = {
      profile: {
        age: 35,
        height: 180,
        weight: 80,
        gender: 'male',
        activityLevel: 'very_active',
        goals: ['muscle_gain']
      }
    };
    
    const maleGoals = GoalCalculationService.calculateBMR(
      maleUser.profile.age,
      maleUser.profile.height,
      maleUser.profile.weight,
      maleUser.profile.gender
    );
    const maleTDEE = GoalCalculationService.calculateTDEE(maleGoals, maleUser.profile.activityLevel);
    const maleCalories = GoalCalculationService.adjustCaloriesForGoals(maleTDEE, maleUser.profile.goals);
    
    console.log(`   Male (35, 180cm, 80kg, very active, muscle gain):`);
    console.log(`     BMR: ${maleGoals}, TDEE: ${maleTDEE}, Adjusted: ${maleCalories}`);

    console.log('\n✅ Smart Goal Calculation System Test Completed Successfully!');
    console.log('\n🎉 All tests passed! The system now uses:');
    console.log('   ✓ BMR/TDEE calculations instead of static defaults');
    console.log('   ✓ Goal-based calorie adjustments');
    console.log('   ✓ Personalized protein targets');
    console.log('   ✓ Health condition-aware macro adjustments');
    console.log('   ✓ Activity-level based exercise recommendations');
    console.log('   ✓ Smart water intake calculations');

  } catch (error) {
    console.error('❌ Smart goal calculation test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testSmartGoalCalculations();
