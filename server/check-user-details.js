const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const config = require('./config/config');

async function checkUsers() {
  try {
    await mongoose.connect(config.MONGODB_URI, { dbName: 'main' });
    console.log('✅ Connected to database');
    
    const users = await User.find({}).select('+password');
    console.log(`📊 Found ${users.length} users:`);
    
    for (const user of users) {
      console.log(`\n👤 User: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Has password: ${!!user.password}`);
      console.log(`   Quiz completed: ${user.quizCompleted}`);
      console.log(`   Profile: ${JSON.stringify(user.profile, null, 2)}`);
      
      // Test password
      if (user.email === 'vishalnyapathi214@gmail.com') {
        const testPasswords = ['password123', 'hellohibye'];
        for (const testPassword of testPasswords) {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          console.log(`   Password "${testPassword}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUsers();
