const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Meal = require('../models/Meal');
const config = require('../config/config');

// Sample users
const users = [
  {
    username: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      age: 30,
      gender: 'male',
      height: 180,
      weight: 75,
      activityLevel: 'moderate'
    },
    preferences: {
      dietaryRestrictions: [],
      allergies: [],
      favoriteCuisines: ['italian', 'indian'],
      mealPreferences: ['breakfast', 'lunch', 'dinner']
    }
  },
  {
    username: 'user',
    name: 'Regular User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    profile: {
      age: 25,
      gender: 'female',
      height: 165,
      weight: 60,
      activityLevel: 'active'
    },
    preferences: {
      dietaryRestrictions: ['vegetarian'],
      allergies: ['nuts'],
      favoriteCuisines: ['mediterranean', 'japanese'],
      mealPreferences: ['lunch', 'dinner']
    }
  }
];

// Sample meals
const meals = [
  {
    title: 'Grilled Chicken Salad',
    description: 'A healthy and delicious grilled chicken salad with fresh vegetables',
    image: 'https://example.com/chicken-salad.jpg',
    nutritionalInfo: {
      calories: 350,
      protein: 30,
      carbs: 15,
      fat: 20
    },
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    ingredients: [
      { name: 'Chicken breast', amount: 200, unit: 'g' },
      { name: 'Mixed salad greens', amount: 100, unit: 'g' },
      { name: 'Cherry tomatoes', amount: 50, unit: 'g' },
      { name: 'Cucumber', amount: 50, unit: 'g' },
      { name: 'Olive oil', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Season chicken breast with salt and pepper',
      'Grill chicken for 8-10 minutes per side',
      'Chop vegetables and combine in a bowl',
      'Slice chicken and add to salad',
      'Drizzle with olive oil and serve'
    ],
    categories: ['lunch', 'dinner'],
    tags: ['healthy', 'high-protein', 'low-carb']
  },
  {
    title: 'Vegetable Stir Fry',
    description: 'A quick and easy vegetable stir fry with tofu',
    image: 'https://example.com/stir-fry.jpg',
    nutritionalInfo: {
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 12
    },
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    ingredients: [
      { name: 'Tofu', amount: 200, unit: 'g' },
      { name: 'Broccoli', amount: 100, unit: 'g' },
      { name: 'Carrots', amount: 50, unit: 'g' },
      { name: 'Bell peppers', amount: 50, unit: 'g' },
      { name: 'Soy sauce', amount: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Cut tofu into cubes',
      'Chop vegetables into bite-sized pieces',
      'Heat oil in a wok or large pan',
      'Stir fry tofu until golden',
      'Add vegetables and stir fry for 5 minutes',
      'Add soy sauce and serve'
    ],
    categories: ['lunch', 'dinner'],
    tags: ['vegetarian', 'vegan', 'quick']
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Meal.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Create users
    const createdUsers = await User.create(hashedUsers);
    console.log('Created users');

    // Create meals
    const createdMeals = await Meal.create(meals);
    console.log('Created meals');

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase(); 