const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'nutritionist', 'admin'],
    default: 'user'
  },
  profile: {
    age: {
      type: Number,
      required: false
    },
    height: {
      type: Number,
      required: false
    },
    weight: {
      type: Number,
      required: false
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: false
    },
    activityLevel: {
      type: String,
      enum: [
        'sedentary',
        'lightly_active',
        'moderately_active',
        'very_active',
        'extra_active'
      ],
      required: false
    },
    healthConditions: {
      diabetes: { type: Boolean, default: false },
      highBloodPressure: { type: Boolean, default: false },
      thyroid: { type: Boolean, default: false },
      other: [String]
    },
    fitnessGoals: {
      type: [String],
      enum: [
        'weight_loss',
        'muscle_gain',
        'maintenance',
        'improved_energy',
        'better_sleep',
        'sports_performance'
      ],
      required: false
    },
    dietaryPreferences: {
      type: [String],
      enum: [
        'vegetarian',
        'vegan',
        'pescatarian',
        'gluten_free',
        'dairy_free',
        'none'
      ],
      default: ['none']
    }
  },
  preferences: {
    calorieGoal: Number,
    proteinGoal: Number,
    carbGoal: Number,
    fatGoal: Number
  },
  quizCompleted: {
    type: Boolean,
    default: false
  },
  lastQuizDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true,
  collection: 'User'
});

// Remove password when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

module.exports = mongoose.model('User', userSchema, 'User');