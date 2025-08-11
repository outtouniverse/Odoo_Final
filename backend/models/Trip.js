const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a trip name'],
    trim: true,
    maxlength: [100, 'Trip name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a trip description'],
    trim: true,
    maxlength: [1000, 'Trip description cannot be more than 1000 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  coverPhoto: {
    type: String,
    default: '',
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty string
        // Basic URL validation
        const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
        return urlPattern.test(value);
      },
      message: 'Please provide a valid image URL'
    }
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'cancelled'],
    default: 'planning'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Trip must belong to a user']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  budget: {
    amount: {
      type: Number,
      min: [0, 'Budget cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    }
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // New field to store selected cities
  selectedCities: [{
    id: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    img: {
      type: String,
      default: ''
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ startDate: 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ isPublic: 1 });

// Virtual for trip duration in days
tripSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for trip status based on dates
tripSchema.virtual('dateStatus').get(function() {
  const now = new Date();
  if (this.startDate > now) return 'upcoming';
  if (this.endDate < now) return 'past';
  return 'ongoing';
});

// Pre-save middleware to validate dates
tripSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Static method to find trips by user
tripSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to find public trips
tripSchema.statics.findPublic = function() {
  return this.find({ isPublic: true }).populate('user', 'name avatar').sort({ createdAt: -1 });
};

// Static method to find upcoming trips
tripSchema.statics.findUpcoming = function(userId) {
  const now = new Date();
  return this.find({ 
    user: userId, 
    startDate: { $gte: now },
    status: { $ne: 'cancelled' }
  }).sort({ startDate: 1 });
};

// Instance method to check if user can edit trip
tripSchema.methods.canEdit = function(userId) {
  return this.user.toString() === userId.toString();
};

// Instance method to update trip status based on dates
tripSchema.methods.updateStatus = function() {
  const now = new Date();
  if (this.startDate <= now && this.endDate >= now) {
    this.status = 'active';
  } else if (this.endDate < now) {
    this.status = 'completed';
  }
  return this.save();
};

module.exports = mongoose.model('Trip', tripSchema);
