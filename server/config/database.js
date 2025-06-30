const mongoose = require('mongoose');
const config = require('./config');

// Set Mongoose to not buffer commands when disconnected
mongoose.set('bufferCommands', false);

const connectDB = async (retryCount = 0) => {
  const maxRetries = 3;
  
  try {
    console.log(`Attempting to connect to MongoDB... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
    console.log('MongoDB URI:', config.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

    // Test DNS resolution first
    const url = new URL(config.MONGODB_URI);
    console.log('Testing connection to host:', url.hostname);

    const conn = await mongoose.connect(config.MONGODB_URI, {
      // Database selection
      dbName: 'main',
      
      // Timeout settings
      serverSelectionTimeoutMS: 15000, // 15 seconds
      socketTimeoutMS: 20000, // 20 seconds
      connectTimeoutMS: 15000, // 15 seconds for initial connection
      
      // Connection management
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      
      // Retry and buffering
      retryWrites: true,
      retryReads: true,
      
      // Write concern
      w: 'majority',
      
      // Additional options for stability
      heartbeatFrequencyMS: 10000, // Send heartbeat every 10 seconds
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection state: ${mongoose.connection.readyState}`);
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('� Mongoose connected to MongoDB');
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔴 Mongoose disconnected from MongoDB');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err.message);
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📤 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      message: error.message
    });
    
    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying connection in 5 seconds... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => connectDB(retryCount + 1), 5000);
    } else {
      console.error('❌ Max retries reached. Please check your MongoDB connection settings.');
      console.error('Common issues:');
      console.error('1. Check if your IP address is whitelisted in MongoDB Atlas');
      console.error('2. Verify your username and password are correct');
      console.error('3. Ensure your internet connection is stable');
      console.error('4. Check if there are any firewall restrictions');
      
      // Don't exit the process, just log the error
      // process.exit(1);
    }
  }
};

module.exports = connectDB; 