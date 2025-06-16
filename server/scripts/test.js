const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting API tests...\n');

  try {
    // Test 1: Health Check
    console.log('Test 1: Health Check');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Register a test user
    console.log('\nTest 2: Register User');
    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    });
    console.log('✅ Register response:', registerResponse.data);

    // Test 3: Login with test user
    console.log('\nTest 3: Login User');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful');
    
    const token = loginResponse.data.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Test 4: Submit quiz data
    console.log('\nTest 4: Submit Quiz');
    const quizData = {
      age: 25,
      height: 170,
      weight: 70,
      bmi: 24.2,
      bmiCategory: 'Normal weight',
      healthTags: ['High Blood Pressure'],
      fitnessGoal: 'Weight Loss',
      dietaryPreference: 'Non-Vegetarian'
    };
    const quizResponse = await axios.post(`${API_URL}/api/quiz/submit`, quizData, config);
    console.log('✅ Quiz submission successful:', quizResponse.data);

    console.log('\n✨ All tests passed successfully!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
  }
}

runTests(); 