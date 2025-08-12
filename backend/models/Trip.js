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
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        return value >= today;
      },
      message: 'Start date must be today or in the future'
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
      min: [0, 'Budget cannot be negative'],
      default: 1000
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    }
  },
  // Persisted budget summary for UI (derived but stored for convenience)
  budgetSummary: {
    transport: { type: Number, default: 0, min: 0 },
    stay: { type: Number, default: 0, min: 0 },
    activities: { type: Number, default: 0, min: 0 },
    meals: { type: Number, default: 0, min: 0 },
    total: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  // Selected cities with their activities
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
    },
    // Activities for this city
    activities: [{
      id: {
        type: String,
        required: true,
        trim: true
      },
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Activity name cannot be more than 100 characters']
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      category: {
        type: String,
        enum: ['Sightseeing', 'Food', 'Adventure', 'Culture', 'Nightlife'],
        required: true
      },
      cost: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
      },
      duration: {
        type: String,
        enum: ['1–3 hrs', 'Half-day', 'Full-day'],
        required: true
      },
      rating: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5'],
        default: 4.0
      },
      img: {
        type: String,
        default: '',
        validate: {
          validator: function(value) {
            if (!value) return true; // Allow empty string
            const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
            return urlPattern.test(value);
          },
          message: 'Please provide a valid image URL'
        }
      },
      description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
      },
      tags: [{
        type: String,
        trim: true,
        maxlength: [20, 'Tag cannot be more than 20 characters']
      }],
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }]
  ,
  // Persisted itinerary for calendar
  itinerary: [{
    id: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true }, // YYYY-MM-DD
    items: [{
      id: { type: String, required: true, trim: true },
      activityId: { type: String, trim: true },
      time: { type: String, required: true, trim: true }, // HH:mm
      name: { type: String, required: true, trim: true, maxlength: [120, 'Itinerary item name too long'] }
    }]
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
tripSchema.index({ 'selectedCities.id': 1 });
tripSchema.index({ 'selectedCities.activities.id': 1 });

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

// Virtual for total activities count
tripSchema.virtual('totalActivities').get(function() {
  return this.selectedCities.reduce((total, city) => total + (city.activities ? city.activities.length : 0), 0);
});

// Pre-save middleware to validate dates
tripSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Pre-save middleware to prevent duplicate cities
tripSchema.pre('save', function(next) {
  if (this.selectedCities && this.selectedCities.length > 0) {
    const cityIds = this.selectedCities.map(city => city.id);
    const uniqueCityIds = [...new Set(cityIds)];
    
    if (cityIds.length !== uniqueCityIds.length) {
      next(new Error('Duplicate cities are not allowed in a trip'));
    }
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

// Instance method to add activity to a city
tripSchema.methods.addActivityToCity = function(cityId, activity) {
  const city = this.selectedCities.find(c => c.id === cityId);
  if (!city) {
    throw new Error('City not found in trip');
  }
  
  // Check if activity already exists
  const existingActivity = city.activities.find(a => a.id === activity.id);
  if (existingActivity) {
    throw new Error('Activity already exists in this city');
  }
  
  city.activities.push(activity);
  return this.save();
};

// Instance method to remove activity from a city
tripSchema.methods.removeActivityFromCity = function(cityId, activityId) {
  const city = this.selectedCities.find(c => c.id === cityId);
  if (!city) {
    throw new Error('City not found in trip');
  }
  
  const activityIndex = city.activities.findIndex(a => a.id === activityId);
  if (activityIndex === -1) {
    throw new Error('Activity not found in this city');
  }
  
  city.activities.splice(activityIndex, 1);
  return this.save();
};

// Instance method to get activities for a city
tripSchema.methods.getCityActivities = function(cityId) {
  const city = this.selectedCities.find(c => c.id === cityId);
  return city ? city.activities : [];
};

module.exports = mongoose.model('Trip', tripSchema);
