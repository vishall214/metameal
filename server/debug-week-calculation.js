const mongoose = require('mongoose');
const Dashboard = require('./models/Dashboard');
require('dotenv').config();

const debugWeekCalculation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const dashboard = await Dashboard.findOne();
    console.log('Current dashboard weekStartDate:', dashboard.weekStartDate);
    console.log('Type:', typeof dashboard.weekStartDate);

    const now = new Date();
    console.log('Current date:', now);
    
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    console.log('Calculated week start:', currentWeekStart);
    
    console.log('Comparison result (<):', dashboard.weekStartDate < currentWeekStart);
    console.log('Comparison result (getTime <):', dashboard.weekStartDate.getTime() < currentWeekStart.getTime());
    
    console.log('\nTime values:');
    console.log('Dashboard week start time:', dashboard.weekStartDate.getTime());
    console.log('Current week start time:', currentWeekStart.getTime());
    console.log('Difference:', currentWeekStart.getTime() - dashboard.weekStartDate.getTime());

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

debugWeekCalculation();
