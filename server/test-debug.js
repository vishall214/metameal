const axios = require('axios');

async function testMealGeneration() {
  try {
    console.log('🔍 Testing meal generation step by step...');
    
    // Login first
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'vishalnyapathi214@gmail.com',
      password: 'hellohibye'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Generate meal plan with detailed error handling
    try {
      const mealPlanResponse = await axios.post(
        'http://localhost:5002/api/meal-plans/generate',
        { planType: 'daily' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Meal plan generated successfully');
      console.log('📊 Response structure:');
      console.log('- Success:', mealPlanResponse.data.success);
      console.log('- Has mealPlan:', !!mealPlanResponse.data.mealPlan);
      console.log('- Has meals:', !!mealPlanResponse.data.mealPlan?.meals);
      console.log('- Meal count:', mealPlanResponse.data.mealPlan?.meals?.length || 0);
      
      if (mealPlanResponse.data.mealPlan?.meals?.length > 0) {
        const firstMeal = mealPlanResponse.data.mealPlan.meals[0];
        console.log('🍽️  First meal structure:');
        console.log('- Day:', firstMeal.day);
        console.log('- MealType:', firstMeal.mealType);
        console.log('- Has meal object:', !!firstMeal.meal);
        console.log('- Meal keys:', firstMeal.meal ? Object.keys(firstMeal.meal).join(', ') : 'N/A');
        console.log('- Meal name:', firstMeal.meal?.name || 'UNDEFINED');
        console.log('- Full meal object:', JSON.stringify(firstMeal.meal, null, 2));
      }
      
    } catch (mealError) {
      console.error('❌ Meal generation failed:', mealError.response?.data || mealError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMealGeneration();
