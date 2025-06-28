const axios = require('axios');

// Test meal plan generation API with correct credentials
async function testMealPlanAPI() {
  try {
    console.log('Testing meal plan generation API...');
    
    // First, register a user if needed, then login
    console.log('1. Attempting to register/login user...');
    
    // Try registration first
    try {
      const registerResponse = await axios.post('http://localhost:5002/api/auth/register', {
        username: 'testuser123',
        email: 'testuser@example.com',
        password: 'test123456',
        name: 'Test User'
      });
      console.log('Registration successful:', registerResponse.status);
    } catch (regError) {
      console.log('Registration failed (user might already exist):', regError.response?.data?.error || regError.message);
    }
    
    // Now try to login
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'testuser@example.com',
      password: 'test123456'
    });
    
    console.log('Login successful, status:', loginResponse.status);
    const token = loginResponse.data.token;
    
    // Update profile first
    console.log('2. Updating user profile...');
    try {
      await axios.put('http://localhost:5002/api/auth/profile', {
        age: 25,
        height: 170,
        weight: 70,
        gender: 'male',
        activityLevel: 'moderate',
        filters: ['veg'],
        goals: ['Weight Loss'],
        calorieGoal: 2000,
        proteinGoal: 150,
        carbGoal: 200,
        fatGoal: 67
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Profile updated successfully');
    } catch (profileError) {
      console.log('Profile update failed:', profileError.response?.data || profileError.message);
    }
    
    // Now generate a meal plan
    console.log('3. Generating meal plan...');
    const mealPlanResponse = await axios.post(
      'http://localhost:5002/api/meal-plans/generate', 
      { planType: 'daily' },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ Meal plan generation successful!');
    console.log('Response status:', mealPlanResponse.status);
    console.log('Response structure:', Object.keys(mealPlanResponse.data));
    
    if (mealPlanResponse.data.mealPlan && mealPlanResponse.data.mealPlan.meals) {
      const meals = mealPlanResponse.data.mealPlan.meals;
      console.log(`Generated ${meals.length} meals:`);
      
      meals.forEach((meal, index) => {
        console.log(`\n=== MEAL ${index + 1} ===`);
        console.log(`Day: ${meal.day}`);
        console.log(`Type: ${meal.mealType}`);
        console.log(`Meal object keys:`, Object.keys(meal.meal || {}));
        if (meal.meal) {
          console.log(`Name: ${meal.meal.name || 'MISSING NAME'}`);
          console.log(`Calories: ${meal.meal.calories || 'MISSING CALORIES'}`);
          console.log(`Photo: ${meal.meal.photo || 'MISSING PHOTO'}`);
          console.log(`Course: ${meal.meal.course || 'MISSING COURSE'}`);
        } else {
          console.log('❌ MEAL OBJECT IS NULL/UNDEFINED!');
        }
      });
    } else {
      console.log('❌ No meals in response or malformed response structure');
      console.log('Full response:', JSON.stringify(mealPlanResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error testing meal plan API:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error message:', error.message);
    }
  }
}

testMealPlanAPI();
