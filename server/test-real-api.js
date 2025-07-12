const axios = require('axios');

const testRealAPI = async () => {
  try {
    const baseURL = 'http://localhost:5003/api';
    
    console.log('🧪 TESTING REAL API ENDPOINTS');
    console.log('================================');

    // Step 1: Login to get token
    console.log('\n🔑 Step 1: Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'gayu@gmail.com',
      password: 'Vishal@123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Get initial dashboard state
    console.log('\n📊 Step 2: Get Dashboard Progress');
    const dashboardResponse = await axios.get(`${baseURL}/dashboard/goal-progress`, { headers });
    
    console.log('Current Weekly Progress:');
    Object.keys(dashboardResponse.data.weeklyProgress).forEach(metric => {
      const data = dashboardResponse.data.weeklyProgress[metric];
      const percentage = Math.round((data.current / data.target) * 100);
      console.log(`${metric}: ${data.current}/${data.target} (${percentage}%)`);
    });

    console.log('\nToday\'s Goals Status:');
    console.log(dashboardResponse.data.todayGoals);

    console.log('\nUser Smart Goals:');
    console.log(dashboardResponse.data.userGoals);

    // Step 3: Complete a goal
    console.log('\n🎯 Step 3: Complete Exercise Goal');
    const completeResponse = await axios.post(`${baseURL}/dashboard/complete-goal`, {
      goalType: 'exercise'
    }, { headers });

    console.log('Goal completion response:', completeResponse.data);

    // Step 4: Check updated progress
    console.log('\n📈 Step 4: Check Updated Progress');
    const updatedResponse = await axios.get(`${baseURL}/dashboard/goal-progress`, { headers });
    
    console.log('Updated Weekly Progress:');
    Object.keys(updatedResponse.data.weeklyProgress).forEach(metric => {
      const data = updatedResponse.data.weeklyProgress[metric];
      const percentage = Math.round((data.current / data.target) * 100);
      console.log(`${metric}: ${data.current}/${data.target} (${percentage}%)`);
    });

    console.log('\nUpdated Today\'s Goals Status:');
    console.log(updatedResponse.data.todayGoals);

    console.log('\n✅ REAL API TEST COMPLETE!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testRealAPI();
