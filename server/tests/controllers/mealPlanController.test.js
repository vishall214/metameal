const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const { createTestUser, createTestMeals, cleanupTestData } = require('../testUtils');
const Food = require('../../models/Food');
const User = require('../../models/User');
const MealPlan = require('../../models/MealPlan');

describe('Meal Plan Controller', () => {
  let user;
  let token;
  
  beforeAll(async () => {
    // Create a test user
    const testUser = await createTestUser({
      quizCompleted: true,
      dietaryPreference: 'vegetarian',
      dietaryRestrictions: ['gluten'],
      mealTypes: ['breakfast', 'lunch', 'dinner']
    });
    user = testUser.user;
    token = testUser.token;
    
    // Create test meals
    await createTestMeals(15, {
      filter: ['vegetarian', 'gluten'],
      status: 'active',
      course: { $in: ['breakfast', 'lunch', 'dinner'] }
    });
  });
  
  afterAll(async () => {
    await cleanupTestData();
  });
  
  describe('POST /api/meal-plans/generate-from-quiz', () => {
    it('should generate a meal plan from quiz data', async () => {
      const response = await request(app)
        .post('/api/meal-plans/generate-from-quiz')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('days');
      
      // Verify the meal plan was saved to the database
      const mealPlan = await MealPlan.findOne({ user: user._id });
      expect(mealPlan).toBeTruthy();
      expect(mealPlan.user.toString()).toBe(user._id.toString());
      expect(mealPlan.preferences.dietaryPreference).toBe('vegetarian');
      expect(mealPlan.preferences.dietaryRestrictions).toContain('gluten');
    });
    
    it('should return 400 if user has not completed the quiz', async () => {
      // Create a user who hasn't completed the quiz
      const { token: newUserToken } = await createTestUser({
        quizCompleted: false
      });
      
      const response = await request(app)
        .post('/api/meal-plans/generate-from-quiz')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Please complete the quiz first');
    });
    
    it('should return 404 if no meals match the criteria', async () => {
      // Delete all meals
      await Food.deleteMany({});
      
      const response = await request(app)
        .post('/api/meal-plans/generate-from-quiz')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No meals found matching your preferences');
      
      // Recreate test meals for other tests
      await createTestMeals(15, {
        filter: ['vegetarian', 'gluten'],
        status: 'active',
        course: { $in: ['breakfast', 'lunch', 'dinner'] }
      });
    });
  });
  
  describe('GET /api/meal-plans/current', () => {
    it('should get the current meal plan for the user', async () => {
      // First, generate a meal plan
      await request(app)
        .post('/api/meal-plans/generate-from-quiz')
        .set('Authorization', `Bearer ${token}`);
      
      const response = await request(app)
        .get('/api/meal-plans/current')
        .set('Authorization', `Bearer ${token}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('days');
      expect(Object.keys(response.body.data.days).length).toBe(7); // 7 days in a week
    });
    
    it('should return 404 if user has no meal plan', async () => {
      // Create a new user with no meal plan
      const { token: newUserToken } = await createTestUser({
        quizCompleted: true,
        dietaryPreference: 'vegetarian'
      });
      
      const response = await request(app)
        .get('/api/meal-plans/current')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'No active meal plan found');
    });
  });
});
