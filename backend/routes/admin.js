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
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }
  next();
}

// Admin auth (reuse normal login route + role check)
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  handleValidation,
  async (req, res) => {
    return res.status(400).json({ success: false, message: 'Use /api/auth/login then access admin endpoints with admin role.' });
  }
);

router.get('/me', protect, restrictTo('admin', 'superadmin'), (req, res) => {
  res.json({ success: true, data: { user: req.user.fullProfile } });
});

router.patch('/role/:userId',
  protect,
  restrictTo('superadmin'),
  param('userId').isMongoId(),
  body('role').isIn(['user', 'admin', 'superadmin']),
  handleValidation,
  async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.userId, { role: req.body.role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.fullProfile });
  }
);

// Users
router.get('/users',
  protect, restrictTo('admin', 'superadmin'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('q').optional().isString(),
  handleValidation,
  async (req, res) => {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const q = (req.query.q || '').toString().trim();
    const filter = q ? { $or: [ { name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } } ] } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users.map(u => u.fullProfile), pagination: { page, total, pages: Math.ceil(total/limit) } });
  }
);

router.get('/users/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user.fullProfile });
});

router.patch('/users/:id/status', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), body('isActive').isBoolean(), handleValidation, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user.fullProfile });
});

router.delete('/users/:id', protect, restrictTo('superadmin'), param('id').isMongoId(), body('confirm').equals('DELETE'), handleValidation, async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
});

// Trips
router.get('/trips', protect, restrictTo('admin', 'superadmin'), async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
  const q = (req.query.q || '').toString().trim();
  const filter = q ? { $or: [ { name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } } ] } : {};
  const trips = await Trip.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await Trip.countDocuments(filter);
  res.json({ success: true, data: trips, pagination: { page, total, pages: Math.ceil(total/limit) } });
});

router.get('/trips/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  const trip = await Trip.findById(req.params.id).populate('user', 'name email');
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
  res.json({ success: true, data: trip });
});

router.patch('/trips/:id/flag', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), body('flagged').isBoolean(), handleValidation, async (req, res) => {
  const trip = await Trip.findByIdAndUpdate(req.params.id, { flagged: !!req.body.flagged }, { new: true });
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
  res.json({ success: true, data: trip });
});

router.delete('/trips/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  const trip = await Trip.findByIdAndDelete(req.params.id);
  if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
  res.json({ success: true, message: 'Trip deleted' });
});

// Content moderation (stubs, integrate with actual report/content models if present)
router.get('/reports', protect, restrictTo('admin', 'superadmin'), async (req, res) => {
  res.json({ success: true, data: [] });
});

router.patch('/reports/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), body('status').isIn(['resolved', 'dismissed']), handleValidation, async (req, res) => {
  res.json({ success: true, message: 'Report updated' });
});

router.delete('/content/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  res.json({ success: true, message: 'Content removed' });
});

// Destinations
router.get('/destinations', protect, restrictTo('admin', 'superadmin'), async (req, res) => {
  const cities = await City.find().sort({ name: 1 });
  res.json({ success: true, data: cities });
});

router.post('/destinations', protect, restrictTo('admin', 'superadmin'), body('name').isString().trim().isLength({ min: 2 }), body('country').isString().trim().isLength({ min: 2 }), handleValidation, async (req, res) => {
  const { name, country, region, costIndex, popularity, image, description, meta } = req.body;
  const city = new City({ name: name.trim(), country: country.trim(), region, costIndex, popularity, image: (image || '').trim(), description: (description || '').trim(), meta });
  await city.save();
  res.status(201).json({ success: true, data: city });
});

router.patch('/destinations/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  const updates = req.body;
  if (updates.name) updates.name = String(updates.name).trim();
  if (updates.country) updates.country = String(updates.country).trim();
  const city = await City.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!city) return res.status(404).json({ success: false, message: 'Destination not found' });
  res.json({ success: true, data: city });
});

router.delete('/destinations/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  const city = await City.findByIdAndDelete(req.params.id);
  if (!city) return res.status(404).json({ success: false, message: 'Destination not found' });
  res.json({ success: true, message: 'Destination removed' });
});

// Activities (placeholder collection)
router.get('/activities', protect, restrictTo('admin', 'superadmin'), async (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/activities', protect, restrictTo('admin', 'superadmin'), body('name').isString().trim().isLength({ min: 2 }), handleValidation, async (req, res) => {
  res.status(201).json({ success: true, data: { id: 'pending', name: req.body.name } });
});

router.patch('/activities/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  res.json({ success: true, data: { id: req.params.id } });
});

router.delete('/activities/:id', protect, restrictTo('admin', 'superadmin'), param('id').isMongoId(), handleValidation, async (req, res) => {
  res.json({ success: true, message: 'Activity removed' });
});

// Analytics (stubs)
router.get('/analytics/users', protect, restrictTo('admin', 'superadmin'), async (req, res) => {
  const total = await User.countDocuments();
  res.json({ success: true, data: { totalUsers: total } });
});

router.get('/analytics/trips', protect, restrictTo('admin', 'superadmin'), async (req, res) => {
  const total = await Trip.countDocuments();
  res.json({ success: true, data: { totalTrips: total } });
});

router.get('/analytics/popular', protect, restrictTo('admin', 'superadmin'), async (req, res) => {
  const topCities = await City.find().sort({ popularity: -1 }).limit(10);
  res.json({ success: true, data: { destinations: topCities, activities: [] } });
});

// Settings (in-memory stub; replace with persistent store)
let SETTINGS = { maintenance: false };

router.get('/settings', protect, restrictTo('admin', 'superadmin'), (req, res) => {
  res.json({ success: true, data: SETTINGS });
});

router.patch('/settings', protect, restrictTo('superadmin'), body('maintenance').optional().isBoolean(), handleValidation, (req, res) => {
  SETTINGS = { ...SETTINGS, ...req.body };
  res.json({ success: true, data: SETTINGS });
});

router.patch('/settings/maintenance', protect, restrictTo('superadmin'), body('enabled').isBoolean(), handleValidation, (req, res) => {
  SETTINGS.maintenance = !!req.body.enabled;
  res.json({ success: true, data: SETTINGS });
});

module.exports = router;


