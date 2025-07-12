const mongoose = require('mongoose');
const User = require('./models/User');
const Dashboard = require('./models/Dashboard');
const GoalCalculationService = require('./services/GoalCalculationService');
require('dotenv').config();

const testCompleteSmartGoalFlow = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find gayu user
    const user = await User.findOne({ name: 'gayu' });
    if (!user) {
      console.log('❌ User gayu not found');
      return;
    }

    console.log('🧪 TESTING COMPLETE SMART GOAL FLOW');
    console.log('=====================================');

    // Step 1: Get current dashboard state
    let dashboard = await Dashboard.findOne({ user: user._id });
    console.log('\n📊 INITIAL DASHBOARD STATE:');
    console.log('Weekly Progress Before:', dashboard?.weeklyProgress);
    console.log('Today\'s Goals Before:', dashboard?.getTodaysGoals());

    // Step 2: Test smart goal calculation
    const calculatedGoals = await GoalCalculationService.calculateUserGoals(user._id);
    console.log('\n🧮 SMART CALCULATED GOALS:');
    console.log('Daily Calories:', calculatedGoals.calories);
    console.log('Daily Protein:', calculatedGoals.protein);
    console.log('Daily Water:', calculatedGoals.water);
    console.log('Weekly Exercise:', calculatedGoals.exercise);

    // Step 3: Simulate goal completion (like clicking in frontend)
    console.log('\n🎯 SIMULATING GOAL COMPLETION:');
    
    if (!dashboard) {
      console.log('📋 Creating new dashboard...');
      dashboard = new Dashboard({ 
        user: user._id,
        weeklyProgress: { calories: 0, protein: 0, water: 0, exercise: 0 },
        todaysGoals: { calories: false, protein: false, water: false, exercise: false }
      });
      await dashboard.save();
    }

    // Test completing calories goal
    const goalType = 'calories';
    const todaysContribution = calculatedGoals[goalType];
    
    console.log(`Completing ${goalType} goal...`);
    console.log(`Today's contribution: ${todaysContribution}`);
    
    // Mark goal as completed
    await dashboard.setTodaysGoal(goalType, true);
    
    // Update weekly progress
    await dashboard.updateWeeklyProgress(goalType, todaysContribution);
    await dashboard.save();

    // Step 4: Check updated state
    const updatedDashboard = await Dashboard.findOne({ user: user._id });
    console.log('\n📈 UPDATED DASHBOARD STATE:');
    console.log('Weekly Progress After:', updatedDashboard.weeklyProgress);
    console.log('Today\'s Goals After:', updatedDashboard.getTodaysGoals());

    // Step 5: Test API response structure (WITHOUT calling initializeWeeklyProgress)
    console.log('\n📡 TESTING API RESPONSE STRUCTURE:');
    const weeklyTargets = await updatedDashboard.getWeeklyTargets();
    
    const apiResponse = {
      todayGoals: updatedDashboard.getTodaysGoals(),
      weeklyProgress: {
        calories: {
          current: updatedDashboard.weeklyProgress.calories,
          target: weeklyTargets.calories,
          dailyCompletions: updatedDashboard.getWeeklyCompletions('calories')
        },
        protein: {
          current: updatedDashboard.weeklyProgress.protein,
          target: weeklyTargets.protein,
          dailyCompletions: updatedDashboard.getWeeklyCompletions('protein')
        },
        water: {
          current: updatedDashboard.weeklyProgress.water,
          target: weeklyTargets.water,
          dailyCompletions: updatedDashboard.getWeeklyCompletions('water')
        },
        exercise: {
          current: updatedDashboard.weeklyProgress.exercise,
          target: weeklyTargets.exercise,
          dailyCompletions: updatedDashboard.getWeeklyCompletions('exercise')
        }
      },
      userGoals: {
        dailyCalories: calculatedGoals.calories,
        dailyProtein: calculatedGoals.protein,
        dailyWater: calculatedGoals.water,
        weeklyExercise: calculatedGoals.exercise
      }
    };

    console.log('\n🔍 API RESPONSE ANALYSIS:');
    console.log('Calories - Current:', apiResponse.weeklyProgress.calories.current);
    console.log('Calories - Target:', apiResponse.weeklyProgress.calories.target);
    console.log('Calories - Percentage:', Math.round((apiResponse.weeklyProgress.calories.current / apiResponse.weeklyProgress.calories.target) * 100) + '%');
    
    console.log('\nProtein - Current:', apiResponse.weeklyProgress.protein.current);
    console.log('Protein - Target:', apiResponse.weeklyProgress.protein.target);
    console.log('Protein - Percentage:', Math.round((apiResponse.weeklyProgress.protein.current / apiResponse.weeklyProgress.protein.target) * 100) + '%');

    // Step 6: Test multiple goal completions
    console.log('\n🔄 TESTING MULTIPLE GOAL COMPLETIONS:');
    
    // Complete protein goal
    await updatedDashboard.setTodaysGoal('protein', true);
    await updatedDashboard.updateWeeklyProgress('protein', calculatedGoals.protein);
    
    // Complete water goal
    await updatedDashboard.setTodaysGoal('water', true);
    await updatedDashboard.updateWeeklyProgress('water', calculatedGoals.water);
    
    await updatedDashboard.save();

    const finalDashboard = await Dashboard.findOne({ user: user._id });
    console.log('\n📊 FINAL STATE AFTER MULTIPLE COMPLETIONS:');
    console.log('Weekly Progress:', finalDashboard.weeklyProgress);
    console.log('Today\'s Goals:', finalDashboard.getTodaysGoals());

    // Calculate final percentages
    const finalTargets = await finalDashboard.getWeeklyTargets();
    console.log('\n📈 WEEKLY PROGRESS PERCENTAGES:');
    Object.keys(finalDashboard.weeklyProgress).forEach(metric => {
      const current = finalDashboard.weeklyProgress[metric];
      const target = finalTargets[metric];
      const percentage = Math.round((current / target) * 100);
      console.log(`${metric}: ${current}/${target} (${percentage}%)`);
    });

    console.log('\n✅ SMART GOAL SYSTEM TEST COMPLETE!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testCompleteSmartGoalFlow();
