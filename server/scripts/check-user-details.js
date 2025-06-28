const mongoose = require('mongoose');
const User = require('../models/User');

async function checkUserDetails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/metameal');
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('  Email:', user.email);
      console.log('  Name:', user.name);
      console.log('  Profile:', user.profile);
      console.log('  Preferences:', user.preferences);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

require('dotenv').config();
checkUserDetails();
