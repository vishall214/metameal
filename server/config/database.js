const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', config.MONGODB_URI);

    const conn = await mongoose.connect(config.MONGODB_URI, {
      dbName: 'main'  // Explicitly specify the database name
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Log when the connection is lost
    mongoose.connection.on('disconnected', () => {
      console.log('Lost MongoDB connection...');
    });
    
    // Log when the connection is reconnected
    mongoose.connection.on('reconnected', () => {
      console.log('Reconnected to MongoDB...');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB; 