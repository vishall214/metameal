const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Food = require('../models/Food');
const MealPlan = require('../models/MealPlan');
const { connectDB, disconnectDB } = require('../config/database');

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  quizCompleted: true,
  dietaryPreference: 'vegetarian',
  dietaryRestrictions: ['gluten'],
  mealTypes: ['breakfast', 'lunch', 'dinner']
};

const testMeals = [
  {
    name: 'Vegetarian Breakfast',
    description: 'A healthy vegetarian breakfast',
    course: 'breakfast',
    filter: ['vegetarian', 'breakfast'],
    calories: 350,
    cookingTime: 15,
    status: 'active'
  },
  {
    name: 'Vegetarian Lunch',
    description: 'A healthy vegetarian lunch',
    course: 'lunch',
    filter: ['vegetarian', 'lunch'],
    calories: 500,
    cookingTime: 30,
    status: 'active'
  },
  {
    name: 'Vegetarian Dinner',
    description: 'A healthy vegetarian dinner',
    course: 'dinner',
    filter: ['vegetarian', 'dinner'],
    calories: 600,
    cookingTime: 45,
    status: 'active'
  }
];

describe('Meal Plan Generation', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await connectDB();
    
    // Create test user
    const user = await User.create(testUser);
    userId = user._id;
    
    // Generate auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginRes.body.token;
    
    // Create test meals
    await Food.insertMany(testMeals);
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    await Food.deleteMany({});
    await MealPlan.deleteMany({});
    
    await disconnectDB();
  });

  describe('POST /api/meal-plans/generate-from-quiz', () => {
    it('should generate a meal plan based on user quiz data', async () => {
      const res = await request(app)
        .post('/api/meal-plans/generate-from-quiz')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user', userId.toString());
      expect(res.body.data).toHaveProperty('days');
      
      // Check if all days have meals
      const days = Object.keys(res.body.data.days);
      expect(days.length).toBe(7); // 7 days in a week
      
      // Check each day has the expected meals
      days.forEach(day => {
        expect(res.body.data.days[day].length).toBeGreaterThan(0);
        
        // Check each meal has required fields
        res.body.data.days[day].forEach(meal => {
          expect(meal).toHaveProperty('course');
          expect(meal).toHaveProperty('name');
          expect(meal).toHaveProperty('calories');
          expect(meal).toHaveProperty('cookingTime');
        });
      });
      
      // Check user's currentMealPlan is updated
      const updatedUser = await User.findById(userId);
      expect(updatedUser.currentMealPlan.toString()).toBe(res.body.data._id);
    });
    
    it('should return 400 if user has not completed the quiz', async () => {
      // Create a user who hasn't completed the quiz
      const incompleteUser = await User.create({
        name: 'Incomplete User',
        email: 'incomplete@example.com',
        password: 'password123',
        quizCompleted: false
      });
      
      // Get auth token for incomplete user
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'incomplete@example.com',
          password: 'password123'
        });
      
      const res = await request(app)
        .post('/api/meal-plans/generate-from-quiz')
        .set('Authorization', `Bearer ${loginRes.body.token}`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please complete the quiz first');
    });
    
    it('should return 404 if no meals match user preferences', async () => {
      // Create a user with very specific preferences
      const pickyUser = await User.create({
        name: 'Picky Eater',
        email: 'picky@example.com',
        password: 'password123',
        quizCompleted: true,
        dietaryPreference: 'vegan',
        dietaryRestrictions: ['gluten', 'soy', 'nuts'],
        mealTypes: ['breakfast']
      });
      
      // Get auth token for picky user
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'picky@example.com',
          password: 'password123'
        });
      
      const res = await request(app)
        .post('/api/meal-plans/generate-from-quiz')
        .set('Authorization', `Bearer ${loginRes.body.token}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No meals found matching your preferences');
    });
  });
});
