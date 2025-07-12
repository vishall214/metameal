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
    age: Number,
    height: Number,
    weight: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active']
    },
    // User's selected filters, must match Food.filter values exactly
    filters: [{
      type: String,
      enum: ['veg', 'non-veg', 'diabetes', 'thyroid', 'high BP']
    }],
    goals: [String],
    // User's allergies for meal planning
    allergies: [{
      type: String,
      enum: ['nuts', 'dairy', 'gluten', 'eggs', 'shellfish', 'soy', 'fish', 'sesame', 'sulfites', 'wheat']
    }]
  },
  preferences: {
    calorieGoal: Number,
    proteinGoal: Number,
    carbGoal: Number,
    fatGoal: Number
  },
  progress: [
  {
    date: { type: String }, // e.g. "2025-07-12"
    calories: { type: Boolean, default: false },
    protein: { type: Boolean, default: false },
    water: { type: Boolean, default: false },
    exercise: { type: Boolean, default: false }
  }
  ],
  isVerified: {
    type: Boolean,
    default: false
  },
  quizCompleted: {
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