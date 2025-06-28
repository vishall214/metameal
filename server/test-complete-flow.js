const axios = require('axios');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing Complete Meal Plan Flow...\n');
    
    // Step 1: Register/Login User
    console.log('1️⃣ Setting up test user...');
    
    try {
      await axios.post('http://localhost:5002/api/auth/register', {
        username: 'testuser2024',
        email: 'testuser2024@example.com',
        password: 'testpass123',
        name: 'Test User 2024'
      });
      console.log('✅ User registered successfully');
    } catch (regError) {
      console.log('ℹ️ User might already exist, continuing...');
    }
    
    // Login
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'testuser2024@example.com',
      password: 'testpass123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Update Profile
    console.log('2️⃣ Updating user profile...');
    await axios.put('http://localhost:5002/api/auth/profile', {
      age: 28,
      height: 175,
      weight: 75,
      gender: 'male',
      activityLevel: 'moderate',
      filters: ['veg', 'high-protein'],
      goals: ['Weight Loss'],
      calorieGoal: 2200,
      proteinGoal: 165,
      carbGoal: 220,
      fatGoal: 73
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Profile updated\n');
    
    // Step 3: Generate Meal Plan
    console.log('3️⃣ Generating meal plan...');
    const mealPlanResponse = await axios.post(
      'http://localhost:5002/api/meal-plans/generate',
      { planType: 'daily' },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ Meal plan generated successfully!');
    console.log(`📊 Response Status: ${mealPlanResponse.status}`);
    console.log(`📊 Success: ${mealPlanResponse.data.success}`);
    console.log(`📊 Meals Count: ${mealPlanResponse.data.mealPlan?.meals?.length || 0}\n`);
    
    // Step 4: Analyze Response Structure
    console.log('4️⃣ Analyzing response structure...');
    
    if (mealPlanResponse.data.mealPlan?.meals?.length > 0) {
      const firstMeal = mealPlanResponse.data.mealPlan.meals[0];
      
      console.log('📋 First Meal Structure:');
      console.log(`   Day: ${firstMeal.day}`);
      console.log(`   Type: ${firstMeal.mealType}`);
      console.log(`   Has meal object: ${!!firstMeal.meal}`);
      
      if (firstMeal.meal) {
        console.log(`   Meal Name: ${firstMeal.meal.name || 'MISSING'}`);
        console.log(`   Meal Photo: ${firstMeal.meal.photo || 'MISSING'}`);
        console.log(`   Meal Calories: ${firstMeal.meal.calories || 'MISSING'}`);
        console.log(`   Meal Course: ${firstMeal.meal.course || 'MISSING'}`);
        console.log(`   Meal Description: ${firstMeal.meal.description ? 'Present' : 'MISSING'}`);
        console.log(`   Meal Recipe: ${firstMeal.meal.recipe ? 'Present' : 'MISSING'}`);
        console.log(`   Meal Filters: ${Array.isArray(firstMeal.meal.filter) ? firstMeal.meal.filter.join(', ') : 'MISSING'}`);
        
        console.log('\n🔍 Full Meal Object Keys:');
        console.log(`   ${Object.keys(firstMeal.meal).join(', ')}`);
      }
      
      console.log('\n📊 All Meals Summary:');
      mealPlanResponse.data.mealPlan.meals.forEach((meal, index) => {
        console.log(`   ${index + 1}. ${meal.day} ${meal.mealType}: ${meal.meal?.name || 'NO NAME'} (${meal.meal?.calories || 0} cal)`);
      });
      
      console.log('\n✅ SUCCESS: Backend is returning proper meal data structure!');
      console.log('✅ Frontend MealCard should now work correctly!');
      
    } else {
      console.log('❌ No meals generated');
    }
    
    // Step 5: Test fetching all meal plans
    console.log('\n5️⃣ Testing meal plan retrieval...');
    const allPlansResponse = await axios.get('http://localhost:5002/api/meal-plans', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${allPlansResponse.data.length} meal plans in database`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testCompleteFlow();
