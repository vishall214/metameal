const axios = require('axios');

// Test meal plan generation API with the correct user
async function testMealPlanAPI() {
  try {
    console.log('Testing meal plan generation API...');
    
    // First, we need to login to get a token
    console.log('Attempting login...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'user@example.com',  // correct user from database
      password: 'test123'
    });
    
    console.log('Login successful, status:', loginResponse.status);
    const token = loginResponse.data.token;
    
    // Now generate a meal plan
    const mealPlanResponse = await axios.post(
      'http://localhost:5002/api/meal-plans/generate', 
      {
        planType: 'daily'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Meal plan generation response:', mealPlanResponse.status);
    console.log('Generated meals:', mealPlanResponse.data.mealPlan.meals.length);
    
    if (mealPlanResponse.data.mealPlan.meals.length > 0) {
      console.log('SUCCESS: Meal cards will now be displayed!');
      console.log('Sample meals:');
      mealPlanResponse.data.mealPlan.meals.forEach(meal => {
        console.log(`- ${meal.day} ${meal.mealType}: ${meal.meal.name} (${meal.meal.calories} cal)`);
      });
    } else {
      console.log('No meals generated - check backend logs');
    }
    
  } catch (error) {
    console.error('Error testing meal plan API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request made but no response received');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testMealPlanAPI();
