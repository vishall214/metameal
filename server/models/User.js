const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  restrictedTags: { type: [String], default: [] },
  recommendedTags: { type: [String], default: [] },
  need: { type: String, enum: ['fatloss', 'musclegain', 'weightgain'], required: true },
});

module.exports = mongoose.model('User', userSchema);