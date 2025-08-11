const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [function() { return !this.googleId; }, 'Password is required for local authentication'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'CHF']
  },
  theme: {
    type: String,
    default: 'light',
    enum: ['light', 'dark', 'auto']
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    marketing: {
      type: Boolean,
      default: false
    }
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      default: 'public',
      enum: ['public', 'friends', 'private']
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showLocation: {
      type: Boolean,
      default: true
    }
  },
  savedDestinations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot be more than 500 characters']
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

// Virtual for user's full profile
userSchema.virtual('fullProfile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by Google ID
userSchema.statics.findByGoogleId = function(googleId) {
  return this.findOne({ googleId });
};

// Method to add refresh token
userSchema.methods.addRefreshToken = function(token, expiresAt) {
  this.refreshTokens.push({ token, expiresAt });
  return this.save({ validateBeforeSave: false });
};

// Method to remove refresh token
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  return this.save({ validateBeforeSave: false });
};

// Method to clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function() {
  const now = new Date();
  this.refreshTokens = this.refreshTokens.filter(rt => rt.expiresAt > now);
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema); 