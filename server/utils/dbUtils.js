const mongoose = require('mongoose');

/**
 * Executes a database transaction
 * @param {Function} transactionFn - The function containing the transaction logic
 * @param {Object} options - Transaction options
 * @returns {Promise<*>} - The result of the transaction
 */
const withTransaction = async (transactionFn, options = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await transactionFn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Handles database errors and sends appropriate responses
 * @param {Error} error - The error object
 * @param {Object} res - Express response object
 * @param {string} context - Context of the error (e.g., 'fetching meals', 'creating meal plan')
 */
const handleDatabaseError = (error, res, context = '') => {
  console.error(`Database error while ${context}:`, error);
  
  let statusCode = 500;
  let message = 'Database operation failed';
  
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(err => err.message).join('. ');
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key error';
  }
  
  return res.status(statusCode).json({
    success: false,
    message: `${message}${context ? ` while ${context}` : ''}`,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

/**
 * Checks if the database is connected
 * @returns {boolean} - True if connected, false otherwise
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Waits for the database to be connected
 * @param {number} [timeout=5000] - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if connected, false if timed out
 */
const waitForConnection = async (timeout = 5000) => {
  if (isConnected()) return true;
  
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(false), timeout);
    
    const connectionCheck = () => {
      if (isConnected()) {
        clearTimeout(timer);
        mongoose.connection.removeListener('connected', connectionCheck);
        resolve(true);
      }
    };
    
    mongoose.connection.on('connected', connectionCheck);
  });
};

module.exports = {
  withTransaction,
  handleDatabaseError,
  isConnected,
  waitForConnection
};
