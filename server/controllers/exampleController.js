const Example = require('../models/exampleModel');

// @desc    Get all examples
// @route   GET /api/example
// @access  Public
const getExamples = async (req, res) => {
  try {
    const examples = await Example.find();
    res.json(examples);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new example
// @route   POST /api/example
// @access  Public
const createExample = async (req, res) => {
  const example = new Example({
    name: req.body.name
  });

  try {
    const newExample = await example.save();
    res.status(201).json(newExample);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getExamples, createExample };
