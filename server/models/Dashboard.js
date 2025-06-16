const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  text: String,
  completed: {
    type: Boolean,
    default: false
  }
});

const mealSchema = new mongoose.Schema({
  name: String,
  time: Date,
  calories: Number,
  completed: {
    type: Boolean,
    default: false
  }
});

const dashboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  calories: {
    consumed: {
      type: Number,
      default: 0
    },
    goal: {
      type: Number,
      default: 2000
    }
  },
  water: {
    consumed: {
      type: Number,
      default: 0
    },
    goal: {
      type: Number,
      default: 2.5
    }
  },
  weight: {
    current: Number,
    goal: Number
  },
  meals: [mealSchema],
  goals: [goalSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dashboard', dashboardSchema); 