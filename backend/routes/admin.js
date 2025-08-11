const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { protect, restrictTo } = require('../middleware/auth');
const User = require('../models/User');
const Trip = require('../models/Trip');
const City = require('../models/City');

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
}

// Admin auth (reuse normal login route + role check)
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  handleValidation,
  async (req, res) => {
    return res.status(400).json({ 
      success: false, 
      message: 'Use /api/auth/login then access admin endpoints with admin role.' 
    });
  }
);

router.get('/me', protect, restrictTo('admin'), (req, res) => {
  res.json({ 
    success: true, 
    data: { user: req.user.fullProfile } 
  });
});

router.patch('/role/:userId',
  protect,
  restrictTo('admin'),
  param('userId').isMongoId(),
  body('role').isIn(['user', 'admin']),
  handleValidation,
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.userId, 
      { role: req.body.role }, 
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ success: true, data: user.fullProfile });
  }
);

// Users
router.get('/users',
  protect, 
  restrictTo('admin'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('q').optional().isString(),
  handleValidation,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
      const q = (req.query.q || '').toString().trim();
      const filter = q ? { 
        $or: [
          { name: { $regex: q, $options: 'i' } }, 
          { email: { $regex: q, $options: 'i' } }
        ] 
      } : {};
      
      const users = await User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await User.countDocuments(filter);
      
      res.json({ 
        success: true, 
        data: users.map(u => u.fullProfile), 
        pagination: { 
          page, 
          total, 
          pages: Math.ceil(total/limit) 
        } 
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch users' 
      });
    }
  }
);

router.get('/users/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      res.json({ success: true, data: user.fullProfile });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch user' 
      });
    }
  }
);

router.patch('/users/:id/status', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  body('isActive').isBoolean(), 
  handleValidation, 
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id, 
        { isActive: req.body.isActive }, 
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      res.json({ success: true, data: user.fullProfile });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user status' 
      });
    }
  }
);

router.delete('/users/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  body('confirm').equals('DELETE'), 
  handleValidation, 
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete user' 
      });
    }
  }
);

// Trips
router.get('/trips', 
  protect, 
  restrictTo('admin'), 
  async (req, res) => {
    try {
      const page = Math.max(parseInt(req.query.page || '1', 10), 1);
      const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
      const q = (req.query.q || '').toString().trim();
      const filter = q ? { 
        $or: [
          { name: { $regex: q, $options: 'i' } }, 
          { description: { $regex: q, $options: 'i' } }
        ] 
      } : {};
      
      const trips = await Trip.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      const total = await Trip.countDocuments(filter);
      
      res.json({ 
        success: true, 
        data: trips, 
        pagination: { 
          page, 
          total, 
          pages: Math.ceil(total/limit) 
        } 
      });
    } catch (error) {
      console.error('Error fetching trips:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch trips' 
      });
    }
  }
);

router.get('/trips/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id).populate('user', 'name email');
      if (!trip) {
        return res.status(404).json({ 
          success: false, 
          message: 'Trip not found' 
        });
      }
      res.json({ success: true, data: trip });
    } catch (error) {
      console.error('Error fetching trip:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch trip' 
      });
    }
  }
);

router.patch('/trips/:id/flag', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  body('flagged').isBoolean(), 
  handleValidation, 
  async (req, res) => {
    try {
      const trip = await Trip.findByIdAndUpdate(
        req.params.id, 
        { flagged: !!req.body.flagged }, 
        { new: true }
      );
      if (!trip) {
        return res.status(404).json({ 
          success: false, 
          message: 'Trip not found' 
        });
      }
      res.json({ success: true, data: trip });
    } catch (error) {
      console.error('Error flagging trip:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to flag trip' 
      });
    }
  }
);

router.delete('/trips/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    try {
      const trip = await Trip.findByIdAndDelete(req.params.id);
      if (!trip) {
        return res.status(404).json({ 
          success: false, 
          message: 'Trip not found' 
        });
      }
      res.json({ success: true, message: 'Trip deleted' });
    } catch (error) {
      console.error('Error deleting trip:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete trip' 
      });
    }
  }
);

// Content moderation (stubs, integrate with actual report/content models if present)
router.get('/reports', 
  protect, 
  restrictTo('admin'), 
  async (req, res) => {
    res.json({ success: true, data: [] });
  }
);

router.patch('/reports/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  body('status').isIn(['resolved', 'dismissed']), 
  handleValidation, 
  async (req, res) => {
    res.json({ success: true, message: 'Report updated' });
  }
);

router.delete('/content/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    res.json({ success: true, message: 'Content removed' });
  }
);

// Destinations
router.get('/destinations', 
  protect, 
  restrictTo('admin'), 
  async (req, res) => {
    try {
      const cities = await City.find().sort({ name: 1 });
      res.json({ success: true, data: cities });
    } catch (error) {
      console.error('Error fetching destinations:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch destinations' 
      });
    }
  }
);

router.post('/destinations', 
  protect, 
  restrictTo('admin'), 
  body('name').isString().trim().isLength({ min: 2 }), 
  body('country').isString().trim().isLength({ min: 2 }), 
  handleValidation, 
  async (req, res) => {
    try {
      const { name, country, region, costIndex, popularity, image, description, meta } = req.body;
      const city = new City({ 
        name: name.trim(), 
        country: country.trim(), 
        region, 
        costIndex, 
        popularity, 
        image: (image || '').trim(), 
        description: (description || '').trim(), 
        meta 
      });
      await city.save();
      res.status(201).json({ success: true, data: city });
    } catch (error) {
      console.error('Error creating destination:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create destination' 
      });
    }
  }
);

router.patch('/destinations/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    try {
      const updates = req.body;
      if (updates.name) updates.name = String(updates.name).trim();
      if (updates.country) updates.country = String(updates.country).trim();
      
      const city = await City.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!city) {
        return res.status(404).json({ 
          success: false, 
          message: 'Destination not found' 
        });
      }
      res.json({ success: true, data: city });
    } catch (error) {
      console.error('Error updating destination:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update destination' 
      });
    }
  }
);

router.delete('/destinations/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    try {
      const city = await City.findByIdAndDelete(req.params.id);
      if (!city) {
        return res.status(404).json({ 
          success: false, 
          message: 'Destination not found' 
        });
      }
      res.json({ success: true, message: 'Destination removed' });
    } catch (error) {
      console.error('Error deleting destination:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete destination' 
      });
    }
  }
);

// Activities (placeholder collection)
router.get('/activities', 
  protect, 
  restrictTo('admin'), 
  async (req, res) => {
    res.json({ success: true, data: [] });
  }
);

router.post('/activities', 
  protect, 
  restrictTo('admin'), 
  body('name').isString().trim().isLength({ min: 2 }), 
  handleValidation, 
  async (req, res) => {
    res.status(201).json({ 
      success: true, 
      data: { id: 'pending', name: req.body.name } 
    });
  }
);

router.patch('/activities/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    res.json({ success: true, data: { id: req.params.id } });
  }
);

router.delete('/activities/:id', 
  protect, 
  restrictTo('admin'), 
  param('id').isMongoId(), 
  handleValidation, 
  async (req, res) => {
    res.json({ success: true, message: 'Activity removed' });
  }
);

// Analytics
router.get('/analytics/users', 
  protect, 
  restrictTo('admin'), 
  async (req, res) => {
    try {
      const total = await User.countDocuments();
      res.json({ success: true, data: { totalUsers: total } });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch user analytics' 
      });
    }
  }
);

router.get('/analytics/trips', 
  protect, 
  restrictTo('admin'), 
  async (req, res) => {
    try {
      const total = await Trip.countDocuments();
      res.json({ success: true, data: { totalTrips: total } });
    } catch (error) {
      console.error('Error fetching trip analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch trip analytics' 
      });
    }
  }
);

router.get('/analytics/popular', 
  protect, 
  restrictTo('admin'), 
  async (req, res) => {
    try {
      const topCities = await City.find().sort({ popularity: -1 }).limit(10);
      res.json({ 
        success: true, 
        data: { destinations: topCities, activities: [] } 
      });
    } catch (error) {
      console.error('Error fetching popular analytics:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch popular analytics' 
      });
    }
  }
);

// Settings (in-memory stub; replace with persistent store)
let SETTINGS = { maintenance: false };

router.get('/settings', 
  protect, 
  restrictTo('admin'), 
  (req, res) => {
    res.json({ success: true, data: SETTINGS });
  }
);

router.patch('/settings', 
  protect, 
  restrictTo('admin'), 
  body('maintenance').optional().isBoolean(), 
  handleValidation, 
  (req, res) => {
    SETTINGS = { ...SETTINGS, ...req.body };
    res.json({ success: true, data: SETTINGS });
  }
);

router.patch('/settings/maintenance', 
  protect, 
  restrictTo('admin'), 
  body('enabled').isBoolean(), 
  handleValidation, 
  (req, res) => {
    SETTINGS.maintenance = !!req.body.enabled;
    res.json({ success: true, data: SETTINGS });
  }
);

module.exports = router;
