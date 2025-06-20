const mongoose = require('mongoose');

// Define valid filter categories
const FILTER_CATEGORIES = {
  DIETARY: ['veg', 'non-veg', 'vegan', 'gluten-free', 'dairy-free', 'nut-free'],
  HEALTH_CONDITIONS: ['diabetes', 'thyroid', 'high BP', 'cholesterol', 'pcos'],
  MEAL_TYPES: ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert']
};

const foodSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  filter: { 
    type: [{
      type: String,
      enum: [...FILTER_CATEGORIES.DIETARY, ...FILTER_CATEGORIES.HEALTH_CONDITIONS, ...FILTER_CATEGORIES.MEAL_TYPES],
      required: true
    }],
    validate: {
      validator: function(filters) {
        // At least one meal type must be specified
        const hasMealType = filters.some(filter => FILTER_CATEGORIES.MEAL_TYPES.includes(filter));
        if (!hasMealType) return false;
        
        // Check for conflicting dietary types
        const dietaryCount = filters.filter(filter => FILTER_CATEGORIES.DIETARY.includes(filter)).length;
        return dietaryCount <= 1; // Can't have both 'veg' and 'non-veg' for example
      },
      message: 'Invalid filter combination. Must include exactly one meal type and no conflicting dietary filters.'
    }
  },
  photo: { 
    type: String, 
    required: [true, 'Photo URL is required'],
    match: [/^https?:\/\//, 'Please use a valid URL with HTTP/HTTPS']
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  recipe: { 
    type: String, 
    required: [true, 'Recipe is required'],
    trim: true
  },
  cookingTime: { 
    type: Number, 
    required: [true, 'Cooking time is required'],
    min: [1, 'Cooking time must be at least 1 minute']
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    enum: {
      values: FILTER_CATEGORIES.MEAL_TYPES,
      message: 'Invalid course type. Must be one of: ' + FILTER_CATEGORIES.MEAL_TYPES.join(', ')
    }
  },
  calories: { 
    type: Number, 
    required: [true, 'Calories are required'],
    min: [0, 'Calories cannot be negative']
  },
  protein: { 
    type: Number, 
    required: true,
    min: [0, 'Protein cannot be negative']
  },
  fats: { 
    type: Number, 
    required: true,
    min: [0, 'Fats cannot be negative']
  },
  carbs: { 
    type: Number, 
    required: true,
    min: [0, 'Carbs cannot be negative']
  },
  fibre: { 
    type: Number, 
    required: true,
    min: [0, 'Fibre cannot be negative']
  },
  sugar: { 
    type: Number, 
    required: true,
    min: [0, 'Sugar cannot be negative']
  },
  addedSugar: { 
    type: Number, 
    required: true,
    min: [0, 'Added sugar cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.sugar;
      },
      message: 'Added sugar cannot be more than total sugar'
    }
  },
  sodium: { 
    type: Number, 
    required: true,
    min: [0, 'Sodium cannot be negative']
  },
  portionSize: { 
    type: Number, 
    required: true,
    min: [1, 'Portion size must be at least 1g']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for frequently queried fields
foodSchema.index({ name: 'text', description: 'text' });
foodSchema.index({ 'filter': 1 });
foodSchema.index({ course: 1 });
foodSchema.index({ calories: 1 });

// Add virtual for nutritional values per 100g
foodSchema.virtual('nutritionPer100g').get(function() {
  const factor = 100 / this.portionSize;
  return {
    calories: Math.round(this.calories * factor * 10) / 10,
    protein: Math.round(this.protein * factor * 10) / 10,
    fats: Math.round(this.fats * factor * 10) / 10,
    carbs: Math.round(this.carbs * factor * 10) / 10,
    fibre: Math.round(this.fibre * factor * 10) / 10,
    sugar: Math.round(this.sugar * factor * 10) / 10,
    addedSugar: Math.round(this.addedSugar * factor * 10) / 10,
    sodium: Math.round(this.sodium * factor * 10) / 10
  };
});

// Pre-save hook to ensure data consistency
foodSchema.pre('save', function(next) {
  // Ensure course is always included in filters
  if (!this.filter.includes(this.course)) {
    this.filter.push(this.course);
  }
  
  // Ensure no duplicate filters
  this.filter = [...new Set(this.filter)];
  
  next();
});

module.exports = mongoose.model('Food', foodSchema);