const express = require('express');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokens, verifyRefreshToken, generatePasswordResetToken, hashToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('name')
    .trim()
    .customSanitizer((v) => String(v || '').replace(/\s+/g, ' ').trim())
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/)
    .withMessage('Name contains invalid characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Helper function to send tokens
const sendTokens = (res, user) => {
  const tokens = generateTokens(user._id);
  
  // Set cookies
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Add refresh token to user's tokens array
  user.addRefreshToken(tokens.refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  res.status(200).json({
    success: true,
    message: 'Authentication successful',
    data: {
      user: user.fullProfile,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn
    }
  });
};

// @route   POST /auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', validateSignup, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Send tokens
    sendTokens(res, user);
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup'
    });
  }
});

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.correctPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Send tokens
    sendTokens(res, user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', validateForgotPassword, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken();
    const hashedToken = hashToken(resetToken);

    // Save hashed token to user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // In a real application, you would send an email here
    // For now, we'll return the token in the response (remove this in production)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email',
      data: {
        resetUrl,
        resetToken, // Remove this in production
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// @route   POST /auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', validateResetPassword, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    // Hash the token
    const hashedToken = hashToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @route   GET /auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// @route   GET /auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      // Send tokens
      sendTokens(res, req.user);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.status(500).json({
        success: false,
        message: 'Error during Google authentication'
      });
    }
  }
);

// @route   POST /auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);
    
    // Remove old refresh token and add new one
    user.removeRefreshToken(refreshToken);
    user.addRefreshToken(tokens.refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @route   POST /auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken) {
      // Remove refresh token from user's tokens
      await req.user.removeRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

// @route   GET /auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user.fullProfile
    }
  });
});

module.exports = router; 