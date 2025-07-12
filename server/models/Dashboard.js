const mongoose = require('mongoose');

const dailyGoalSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
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
});

const weeklyProgressSchema = new mongoose.Schema({
  metric: {
    type: String,
    enum: ['calories', 'protein', 'water', 'exercise'],
    required: true
  },
  current: {
    type: Number,
    default: 0
  },
  target: {
    type: Number,
    required: true
  },
  dailyCompletions: [Boolean] // Array of 7 booleans for each day of the week
});

const dashboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dailyGoals: [dailyGoalSchema],
  weeklyProgress: [weeklyProgressSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
dashboardSchema.index({ user: 1 });
dashboardSchema.index({ 'dailyGoals.date': 1 });

// Method to get today's goal completion
dashboardSchema.methods.getTodayGoals = function() {
  const today = new Date().toDateString();
  return this.dailyGoals.find(goal => goal.date === today) || null;
};

// Method to set today's goal completion
dashboardSchema.methods.setTodayGoal = function(goalType, completed) {
  const today = new Date().toDateString();
  let todayGoals = this.dailyGoals.find(goal => goal.date === today);
  
  if (!todayGoals) {
    todayGoals = { date: today };
    this.dailyGoals.push(todayGoals);
  }
  
  const goalIndex = this.dailyGoals.findIndex(goal => goal.date === today);
  this.dailyGoals[goalIndex][goalType] = completed;
  this.lastUpdated = new Date();
};

// Method to get weekly progress for a metric
dashboardSchema.methods.getWeeklyProgress = function(metric) {
  return this.weeklyProgress.find(progress => progress.metric === metric);
};

// Method to update weekly progress
dashboardSchema.methods.updateWeeklyProgress = function(metric, dayIndex, completed) {
  let progress = this.weeklyProgress.find(p => p.metric === metric);
  
  if (!progress) {
    // Initialize weekly progress if it doesn't exist
    const targets = {
      calories: 7, // 7 days of calorie goals
      protein: 7,  // 7 days of protein goals  
      water: 56,   // 8 glasses × 7 days
      exercise: 7  // 7 days of exercise
    };
    
    progress = {
      metric,
      current: 0,
      target: targets[metric],
      dailyCompletions: new Array(7).fill(false)
    };
    this.weeklyProgress.push(progress);
    progress = this.weeklyProgress[this.weeklyProgress.length - 1];
  }
  
  const progressIndex = this.weeklyProgress.findIndex(p => p.metric === metric);
  const wasCompleted = this.weeklyProgress[progressIndex].dailyCompletions[dayIndex];
  
  // Update the daily completion
  this.weeklyProgress[progressIndex].dailyCompletions[dayIndex] = completed;
  
  // Update current count
  if (completed && !wasCompleted) {
    this.weeklyProgress[progressIndex].current += 1;
  } else if (!completed && wasCompleted) {
    this.weeklyProgress[progressIndex].current -= 1;
  }
  
  this.lastUpdated = new Date();
};

// Method to reset weekly progress (called at start of new week)
dashboardSchema.methods.resetWeeklyProgress = function() {
  this.weeklyProgress.forEach(progress => {
    progress.current = 0;
    progress.dailyCompletions = new Array(7).fill(false);
  });
  this.lastUpdated = new Date();
};

module.exports = mongoose.model('Dashboard', dashboardSchema);
