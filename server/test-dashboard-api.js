const axios = require('axios');

async function testDashboardAPI() {
  try {
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🔍 Testing Dashboard API Endpoints...\n');
    
    // Test user credentials (you may need to adjust these)
    const testCredentials = {
      email: 'testuser@example.com',
      password: 'testpassword123'
    };
    
    console.log('🔐 Step 1: Login to get auth token...');
    try {
      const loginResponse = await axios.post(`${baseURL}/auth/login`, testCredentials);
      const token = loginResponse.data.token;
      console.log('✅ Login successful');
      
      const headers = { Authorization: `Bearer ${token}` };
      
      console.log('\n📊 Step 2: Get goal progress...');
      const progressResponse = await axios.get(`${baseURL}/dashboard/goals/progress`, { headers });
      console.log('✅ Goal progress retrieved:', JSON.stringify(progressResponse.data, null, 2));
      
      console.log('\n🎯 Step 3: Complete a goal...');
      const completeGoalResponse = await axios.post(`${baseURL}/dashboard/goals/complete`, {
        goalType: 'calories',
        contribution: 500
      }, { headers });
      console.log('✅ Goal completed:', JSON.stringify(completeGoalResponse.data, null, 2));
      
      console.log('\n🍽️ Step 4: Get today\'s nutrition...');
      const nutritionResponse = await axios.get(`${baseURL}/dashboard/nutrition/today`, { headers });
      console.log('✅ Today\'s nutrition:', JSON.stringify(nutritionResponse.data, null, 2));
      
      console.log('\n📈 Step 5: Get updated progress...');
      const updatedProgressResponse = await axios.get(`${baseURL}/dashboard/goals/progress`, { headers });
      console.log('✅ Updated progress:', JSON.stringify(updatedProgressResponse.data, null, 2));
      
      console.log('\n✅ All Dashboard API tests completed successfully!');
      
    } catch (authError) {
      if (authError.response && authError.response.status === 401) {
        console.log('⚠️ Authentication failed. Please check credentials or create a test user.');
        console.log('   You can create a test user by registering at /api/auth/register');
      } else {
        throw authError;
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Server not running. Please start the server with: npm start');
    } else {
      console.error('❌ Dashboard API test failed:', error.message);
      if (error.response) {
        console.error('   Response:', error.response.data);
      }
    }
  }
}

testDashboardAPI();
