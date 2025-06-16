const mongoose = require('mongoose');

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
    current: {
      type: Number,
      required: true
    },
    goal: {
      type: Number,
      required: true
    }
  },
  meals: [{
    name: {
      type: String,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    calories: {
      type: Number,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  goals: [{
    text: {
      type: String,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Dashboard', dashboardSchema); 