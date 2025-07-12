const mongoose = require('mongoose');
const GoalCalculationService = require('../services/GoalCalculationService');

const dashboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  weeklyProgress: {
    calories: {
      type: Number,
      default: 0
    },
    protein: {
      type: Number,
      default: 0
    },
    water: {
      type: Number,
      default: 0
    },
    exercise: {
      type: Number,
      default: 0
    }
  },
  weekStartDate: {
    type: Date,
    default: () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek;
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0); // Normalize to midnight
      return weekStart;
    }
  },
  todaysGoals: {
    calories: {
      type: Boolean,
      default: false
    },
    protein: {
      type: Boolean,
      default: false
    },
    water: {
      type: Boolean,
      default: false
    },
    exercise: {
      type: Boolean,
      default: false
    }
  },
  weeklyProgress: {
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  water: { type: Number, default: 0 },
  exercise: { type: Number, default: 0 }
},
  weeklyCompletions: {
    calories: {
      type: [Boolean],
      default: [false, false, false, false, false, false, false]
    },
    protein: {
      type: [Boolean],
      default: [false, false, false, false, false, false, false]
    },
    water: {
      type: [Boolean],
      default: [false, false, false, false, false, false, false]
    },
    exercise: {
      type: [Boolean],
      default: [false, false, false, false, false, false, false]
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
dashboardSchema.index({ user: 1 });

// Method to get user-specific weekly targets with smart calculations
dashboardSchema.methods.getWeeklyTargets = async function() {
  try {
    // Get fresh calculated goals
    const calculatedGoals = await GoalCalculationService.calculateUserGoals(this.user);
    
    return {
      calories: calculatedGoals.calories * 7,
      protein: calculatedGoals.protein * 7,
      water: calculatedGoals.water * 7,
      exercise: calculatedGoals.exercise // Already weekly
    };
  } catch (error) {
    console.error('Error calculating weekly targets:', error);
    // Fallback to basic calculation
    const User = require('./User');
    const user = await User.findById(this.user);
    
    return {
      calories: (user?.preferences?.calorieGoal || 2000) * 7,
      protein: (user?.preferences?.proteinGoal || 120) * 7,
      water: 56, // 8 glasses × 7 days
      exercise: 210 // 30 minutes × 7 days
    };
  }
};

// Method to get daily targets with smart calculations
dashboardSchema.methods.getDailyTargets = async function() {
  try {
    const calculatedGoals = await GoalCalculationService.calculateUserGoals(this.user);
    return calculatedGoals;
  } catch (error) {
    console.error('Error calculating daily targets:', error);
    // Fallback to user preferences
    const User = require('./User');
    const user = await User.findById(this.user);
    
    return {
      calories: user?.preferences?.calorieGoal || 2000,
      protein: user?.preferences?.proteinGoal || 120,
      carbs: user?.preferences?.carbGoal || 250,
      fats: user?.preferences?.fatGoal || 65,
      water: 8,
      exercise: 30,
      calculated: false
    };
  }
};

// Method to update weekly progress with smart goal calculation
dashboardSchema.methods.updateWeeklyProgress = function (goalType, contribution) {
  // Ensure the structure exists
  this.weeklyProgress = this.weeklyProgress || {
    calories: 0,
    protein: 0,
    water: 0,
    exercise: 0
  };
  this.weeklyCompletions = this.weeklyCompletions || {
    calories: [false, false, false, false, false, false, false],
    protein: [false, false, false, false, false, false, false],
    water: [false, false, false, false, false, false, false],
    exercise: [false, false, false, false, false, false, false]
  };

  // Add contribution
  this.weeklyProgress[goalType] += contribution;

  // Mark today's day as completed
  const today = new Date();
  const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Monday = 0, Sunday = 6
  this.weeklyCompletions[goalType][dayIndex] = true;

  // ✅ Mark fields as modified
  this.markModified('weeklyProgress');
  this.markModified('weeklyCompletions');

  // ❌ Do not call save() here
};



// Method to initialize weekly progress with smart calculations
dashboardSchema.methods.initializeWeeklyProgress = async function() {
  // Check if it's a new week
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  currentWeekStart.setHours(0, 0, 0, 0); // Normalize to midnight
  
  if (!this.weekStartDate) {
    // No week start date set, initialize with current week
    this.weekStartDate = currentWeekStart;
    console.log('📅 Initializing week start date:', this.weekStartDate);
    await this.save();
    return this;
  }
  
  const normalizedWeekStart = new Date(this.weekStartDate);
  normalizedWeekStart.setHours(0, 0, 0, 0); // Normalize to midnight
  
  // Only reset if it's actually a new week (different week start date)
  if (normalizedWeekStart.getTime() < currentWeekStart.getTime()) {
    console.log('🔄 New week detected, resetting weekly progress');
    this.weeklyProgress = {
      calories: 0,
      protein: 0,
      water: 0,
      exercise: 0
    };
    this.weekStartDate = currentWeekStart;
    // Reset today's goals for new week
    this.todaysGoals = {
      calories: false,
      protein: false,
      water: false,
      exercise: false
    };
    // Reset weeklyCompletions for new week
    this.weeklyCompletions = {
      calories: [false, false, false, false, false, false, false],
      protein: [false, false, false, false, false, false, false],
      water: [false, false, false, false, false, false, false],
      exercise: [false, false, false, false, false, false, false]
    };
    this.markModified('weeklyCompletions');
    await this.save();
  } else {
    console.log('📊 Same week, keeping existing progress:', this.weeklyProgress);
  }
  
  return this;
};

// Method to get today's goal completion status
dashboardSchema.methods.getTodaysGoals = function() {
  return this.todaysGoals;
};

// Method to get weekly completion status for a metric
dashboardSchema.methods.getWeeklyCompletions = function(metric) {
  // Return array of 7 boolean values for Mon-Sun
  if (this.weeklyCompletions && this.weeklyCompletions[metric]) {
    return this.weeklyCompletions[metric];
  }
  return [false, false, false, false, false, false, false];
};

// Method to set today's goal completion
dashboardSchema.methods.setTodaysGoal = function (goalType, completed) {
  console.log(`🎯 Setting ${goalType} goal to ${completed}`);

  this.todaysGoals = this.todaysGoals || {
    calories: false,
    protein: false,
    water: false,
    exercise: false
  };

  this.todaysGoals[goalType] = completed;

  // Update weeklyCompletions for the current day
  const now = new Date();
  let dayIndex = now.getDay(); // 0 = Sunday, 6 = Saturday
  dayIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Convert to Mon-Sun (0 = Monday)

  this.weeklyCompletions = this.weeklyCompletions || {};
  this.weeklyCompletions[goalType] = this.weeklyCompletions[goalType] || [false, false, false, false, false, false, false];

  this.weeklyCompletions[goalType][dayIndex] = completed;

  // Ensure Mongoose tracks the updates
  this.markModified('todaysGoals');
  this.markModified('weeklyCompletions');

  // ❌ Do not call save() here — controller handles it
};


// Method to get progress percentage for a metric
dashboardSchema.methods.getProgressPercentage = function(metric, userGoals = {}) {
  const targets = this.getWeeklyTargets(userGoals);
  const current = this.weeklyProgress[metric] || 0;
  const target = targets[metric];
  return Math.min(Math.round((current / target) * 100), 100);
};

// Method to check if week needs reset
dashboardSchema.methods.checkAndResetWeek = function() {
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  
  if (!this.weekStartDate || this.weekStartDate < currentWeekStart) {
    this.weeklyProgress = {
      calories: 0,
      protein: 0,
      water: 0,
      exercise: 0
    };
    this.weekStartDate = currentWeekStart;
    this.todaysGoals = {
      calories: false,
      protein: false,
      water: false,
      exercise: false
    };
    return true;
  }
  return false;
};

module.exports = mongoose.model('Dashboard', dashboardSchema);
