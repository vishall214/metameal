const mongoose = require('mongoose');

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
      return new Date(now.setDate(diff));
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
  }
}, {
  timestamps: true
});

// Index for efficient queries
dashboardSchema.index({ user: 1 });

// Method to get user-specific weekly targets
dashboardSchema.methods.getWeeklyTargets = function(userGoals = {}) {
  return {
    calories: (userGoals.calorieGoal || 2000) * 7,
    protein: (userGoals.proteinGoal || 120) * 7,
    water: 56, // 8 glasses × 7 days
    exercise: 210 // 30 minutes × 7 days
  };
};

// Method to update weekly progress
dashboardSchema.methods.updateWeeklyProgress = async function(metric, contribution, userGoals = {}) {
  // Check if it's a new week and reset if needed
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay());
  
  if (this.weekStartDate < currentWeekStart) {
    this.weeklyProgress = {
      calories: 0,
      protein: 0,
      water: 0,
      exercise: 0
    };
    this.weekStartDate = currentWeekStart;
  }
  
  // Add contribution to weekly progress
  this.weeklyProgress[metric] += contribution;
  
  return this.save();
};

// Method to initialize weekly progress with user goals
dashboardSchema.methods.initializeWeeklyProgress = async function(userGoals = {}) {
  // Check if it's a new week
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
    await this.save();
  }
  
  return this;
};

// Method to get today's goal completion status
dashboardSchema.methods.getTodaysGoals = function() {
  return this.todaysGoals;
};

// Method to set today's goal completion
dashboardSchema.methods.setTodaysGoal = function(goalType, completed) {
  this.todaysGoals[goalType] = completed;
  return this.save();
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
