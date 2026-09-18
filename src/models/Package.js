const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g Wedding Full Band
  description: String,
  price: { type: Number, required: true },
  duration: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema);