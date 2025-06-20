const { validationResult } = require('express-validator');
const { handleDatabaseError } = require('../utils/dbUtils');

/**
 * Middleware to handle validation errors from express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: 'Validation failed',
    });
  }
  next();
};

/**
 * Middleware to validate ObjectId parameters
 * @param {string} paramName - Name of the parameter to validate
 * @returns {Function} - Express middleware function
 */
const validateObjectId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];
  
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid ${paramName} ID format`,
    });
  }
  
  next();
};

/**
 * Middleware to validate request body against a schema
 * @param {Object} schema - Joi validation schema
 * @returns {Function} - Express middleware function
 */
const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.context.key,
      message: detail.message.replace(/\"/g, ""),
      type: detail.type,
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  
  next();
};

/**
 * Middleware to handle async/await errors in route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    handleDatabaseError(error, res, 'processing request');
  });
};

module.exports = {
  handleValidationErrors,
  validateObjectId,
  validateRequest,
  asyncHandler,
};
