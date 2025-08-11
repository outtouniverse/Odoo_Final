const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// @route   GET /api/profile
// @desc    Get current user profile
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', protect, async (req, res) => {
  try {
    const { name, email, avatar, language, timezone, notifications } = req.body;
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields with basic sanitization
    if (name !== undefined) {
      const sanitized = String(name).replace(/\s+/g, ' ').trim();
      if (sanitized.length < 2 || sanitized.length > 50) {
        return res.status(400).json({ success: false, message: 'Name must be between 2 and 50 characters' });
      }
      user.name = sanitized;
    }
    if (email !== undefined) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
      user.email = email;
    }
    if (avatar !== undefined) user.avatar = String(avatar).trim();
    if (language !== undefined) user.language = language;
    if (timezone !== undefined) user.timezone = timezone;
    if (notifications !== undefined) user.notifications = notifications;
    
    const updatedUser = await user.save();
    
    // Remove sensitive data from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   PUT /api/profile/password
// @desc    Change user password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isPasswordValid = await user.correctPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @route   PUT /api/profile/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { 
      language, 
      timezone, 
      notifications, 
      theme, 
      currency,
      privacySettings 
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update preferences
    if (language !== undefined) user.language = language;
    if (timezone !== undefined) user.timezone = timezone;
    if (notifications !== undefined) user.notifications = notifications;
    if (theme !== undefined) user.theme = theme;
    if (currency !== undefined) user.currency = currency;
    if (privacySettings !== undefined) user.privacySettings = privacySettings;
    
    const updatedUser = await user.save();
    
    // Remove sensitive data from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences'
    });
  }
});

// @route   POST /api/profile/saved-destinations
// @desc    Add saved destination
// @access  Private
router.post('/saved-destinations', protect, async (req, res) => {
  try {
    const { name, city, country, coordinates, notes } = req.body;
    
    if (!name || !city || !country) {
      return res.status(400).json({
        success: false,
        message: 'Name, city, and country are required'
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if destination already exists
    const existingDestination = user.savedDestinations.find(
      dest => dest.name === name && dest.city === city && dest.country === country
    );
    
    if (existingDestination) {
      return res.status(400).json({
        success: false,
        message: 'Destination already saved'
      });
    }
    
    // Add new destination
    user.savedDestinations.push({
      name,
      city,
      country,
      coordinates: coordinates || {},
      notes: notes || '',
      savedAt: new Date()
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'Destination saved successfully',
      data: user.savedDestinations[user.savedDestinations.length - 1]
    });
  } catch (error) {
    console.error('Error saving destination:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving destination'
    });
  }
});

// @route   GET /api/profile/saved-destinations
// @desc    Get saved destinations
// @access  Private
router.get('/saved-destinations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedDestinations');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user.savedDestinations
    });
  } catch (error) {
    console.error('Error fetching saved destinations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching saved destinations'
    });
  }
});

// @route   DELETE /api/profile/saved-destinations/:id
// @desc    Remove saved destination
// @access  Private
router.delete('/saved-destinations/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const destinationId = req.params.id;
    const destinationIndex = user.savedDestinations.findIndex(
      dest => dest._id.toString() === destinationId
    );
    
    if (destinationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Saved destination not found'
      });
    }
    
    // Remove destination
    user.savedDestinations.splice(destinationIndex, 1);
    await user.save();
    
    res.json({
      success: true,
      message: 'Destination removed successfully'
    });
  } catch (error) {
    console.error('Error removing destination:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing destination'
    });
  }
});

// @route   DELETE /api/profile
// @desc    Delete user account
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }
    
    // Find user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.correctPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // Delete user
    await User.findByIdAndDelete(req.user.id);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
});

// @route   GET /api/profile/export
// @desc    Export user data
// @access  Private
router.get('/export', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('trips', 'name description startDate endDate status')
      .select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const exportData = {
      profile: {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        language: user.language,
        timezone: user.timezone,
        currency: user.currency,
        createdAt: user.createdAt
      },
      preferences: {
        notifications: user.notifications,
        theme: user.theme,
        privacySettings: user.privacySettings
      },
      savedDestinations: user.savedDestinations,
      trips: user.trips,
      exportDate: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting data'
    });
  }
});

module.exports = router;
