const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  filter: { type: [String], required: true },
  photo: { type: String, required: true },
  description: { type: String, required: true },
  recipe: { type: String, required: true },
  cookingTime: { type: Number, required: true },
  course: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fats: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fibre: { type: Number, required: true },
  sugar: { type: Number, required: true },
  addedSugar: { type: Number, required: true },
  sodium: { type: Number, required: true },
  portionSize: { type: Number, required: true },
});

module.exports = mongoose.model('Food', foodSchema);