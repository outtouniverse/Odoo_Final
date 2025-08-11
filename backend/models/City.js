const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  region: {
    type: String,
    trim: true
  },
  costIndex: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  popularity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  meta: {
    population: Number,
    timezone: String
  }
}, {
  timestamps: true
});

citySchema.index({ name: 1, country: 1 }, { unique: true });

module.exports = mongoose.model('City', citySchema);
