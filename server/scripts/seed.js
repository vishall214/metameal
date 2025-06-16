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
      activityLevel: 'moderate',
      dietaryRestrictions: [],
      allergies: [],
      goals: ['weight_loss', 'muscle_gain']
    },
    preferences: {
      mealTypes: ['breakfast', 'lunch', 'dinner'],
      cuisineTypes: ['italian', 'indian'],
      calorieGoal: 2500,
      proteinGoal: 180,
      carbGoal: 250,
      fatGoal: 80
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
      activityLevel: 'active',
      dietaryRestrictions: ['vegetarian'],
      allergies: ['nuts'],
      goals: ['weight_loss']
    },
    preferences: {
      mealTypes: ['lunch', 'dinner'],
      cuisineTypes: ['mediterranean', 'japanese'],
      calorieGoal: 2000,
      proteinGoal: 150,
      carbGoal: 200,
      fatGoal: 65
    }
  }
];

// Sample meals matching our schema
const meals = [
  {
    title: 'High-Protein Breakfast Bowl',
    description: 'A protein-rich breakfast bowl with eggs, quinoa, and vegetables',
    image: 'https://example.com/breakfast-bowl.jpg',
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 20,
    prepTime: 15,
    cookTime: 20,
    ingredients: [
      { name: 'Eggs', amount: '2', unit: 'large' },
      { name: 'Quinoa', amount: '100', unit: 'g' },
      { name: 'Spinach', amount: '50', unit: 'g' },
      { name: 'Cherry tomatoes', amount: '100', unit: 'g' }
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Sauté spinach and tomatoes',
      'Poach eggs',
      'Assemble bowl with quinoa base, vegetables, and top with eggs'
    ],
    tags: ['high-protein', 'vegetarian', 'healthy', 'weight_loss'],
    category: 'breakfast',
    difficulty: 'easy'
  },
  {
    title: 'Grilled Chicken Salad',
    description: 'Fresh salad with grilled chicken breast and avocado',
    image: 'https://example.com/chicken-salad.jpg',
    calories: 550,
    protein: 45,
    carbs: 20,
    fat: 35,
    prepTime: 15,
    cookTime: 15,
    ingredients: [
      { name: 'Chicken breast', amount: '200', unit: 'g' },
      { name: 'Mixed greens', amount: '100', unit: 'g' },
      { name: 'Avocado', amount: '1', unit: 'medium' },
      { name: 'Olive oil', amount: '1', unit: 'tbsp' }
    ],
    instructions: [
      'Grill chicken breast',
      'Prepare salad base with mixed greens',
      'Slice avocado',
      'Top with grilled chicken and drizzle with olive oil'
    ],
    tags: ['high-protein', 'low-carb', 'muscle_gain'],
    category: 'lunch',
    difficulty: 'easy'
  },
  {
    title: 'Vegetarian Stir-Fry',
    description: 'Quick and healthy vegetable stir-fry with tofu',
    image: 'https://example.com/stir-fry.jpg',
    calories: 400,
    protein: 20,
    carbs: 45,
    fat: 18,
    prepTime: 20,
    cookTime: 15,
    ingredients: [
      { name: 'Tofu', amount: '200', unit: 'g' },
      { name: 'Mixed vegetables', amount: '300', unit: 'g' },
      { name: 'Brown rice', amount: '100', unit: 'g' },
      { name: 'Soy sauce', amount: '2', unit: 'tbsp' }
    ],
    instructions: [
      'Press and cube tofu',
      'Cook brown rice',
      'Stir-fry vegetables',
      'Add tofu and sauce',
      'Serve over rice'
    ],
    tags: ['vegetarian', 'vegan', 'weight_loss'],
    category: 'dinner',
    difficulty: 'medium'
  },
  {
    title: 'Protein Smoothie',
    description: 'Quick and nutritious protein smoothie',
    image: 'https://example.com/smoothie.jpg',
    calories: 250,
    protein: 20,
    carbs: 30,
    fat: 8,
    prepTime: 5,
    cookTime: 0,
    ingredients: [
      { name: 'Protein powder', amount: '1', unit: 'scoop' },
      { name: 'Banana', amount: '1', unit: 'medium' },
      { name: 'Almond milk', amount: '250', unit: 'ml' },
      { name: 'Berries', amount: '100', unit: 'g' }
    ],
    instructions: [
      'Add all ingredients to blender',
      'Blend until smooth',
      'Serve immediately'
    ],
    tags: ['quick', 'high-protein', 'muscle_gain'],
    category: 'snack',
    difficulty: 'easy'
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
    console.log('Created users:', createdUsers.length);

    // Create meals
    const createdMeals = await Meal.create(meals);
    console.log('Created meals:', createdMeals.length);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase(); 