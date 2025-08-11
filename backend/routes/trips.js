const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');

// @route   POST /api/trips
// @desc    Create a new trip
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      coverPhoto,
      isPublic,
      tags,
      budget,
      location
    } = req.body;

    // Basic required field validation
    if (!name || !description || !startDate || !endDate || !location || !location.city || !location.country || !budget || typeof budget.amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, description, startDate, endDate, location.city, location.country, budget.amount'
      });
    }

    // Sanitize and normalize inputs
    const nameTrimmed = String(name).trim();
    const descTrimmed = String(description).trim();
    const cityTrimmed = String(location.city).trim();
    const countryTrimmed = String(location.country).trim();
    const tagsNormalized = Array.isArray(tags)
      ? tags.filter((t) => typeof t === 'string').map((t) => t.trim()).filter(Boolean).slice(0, 20)
      : [];
    const currency = budget.currency && typeof budget.currency === 'string'
      ? budget.currency.toUpperCase().slice(0, 3)
      : 'USD';
    const amount = Number(budget.amount);

    if (nameTrimmed.length < 3 || nameTrimmed.length > 120) {
      return res.status(400).json({ success: false, message: 'Trip name must be between 3 and 120 characters' });
    }
    if (descTrimmed.length < 10 || descTrimmed.length > 2000) {
      return res.status(400).json({ success: false, message: 'Description must be between 10 and 2000 characters' });
    }
    if (!cityTrimmed || !countryTrimmed) {
      return res.status(400).json({ success: false, message: 'City and country are required' });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be a positive number' });
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      return res.status(400).json({ success: false, message: 'Budget currency must be a 3-letter code (e.g., USD)' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid startDate or endDate' });
    }

    // Create new trip
    const trip = new Trip({
      name: nameTrimmed,
      description: descTrimmed,
      startDate: start,
      endDate: end,
      coverPhoto: typeof coverPhoto === 'string' ? coverPhoto.trim() : '',
      isPublic: !!isPublic,
      tags: tagsNormalized,
      budget: { amount, currency },
      location: { city: cityTrimmed, country: countryTrimmed },
      user: req.user.id
    });

    // Validate dates
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be in the future'
      });
    }

    const savedTrip = await trip.save();
    
    // Populate user info
    await savedTrip.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      data: savedTrip
    });

  } catch (error) {
    console.error('Error creating trip:', error);
    
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
      message: 'Server error while creating trip'
    });
  }
});

// @route   GET /api/trips
// @desc    Get all trips for authenticated user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    // Normalize and validate query params
    page = parseInt(page, 10);
    limit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const allowedSortBy = ['createdAt', 'startDate', 'endDate', 'name', 'status'];
    if (!allowedSortBy.includes(String(sortBy))) sortBy = 'createdAt';
    sortOrder = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
    
    // Build query
    const query = { user: req.user.id };
    if (status && ['planning', 'active', 'completed', 'cancelled'].includes(String(status))) {
      query.status = status;
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const trips = await Trip.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name avatar');
    
    // Get total count
    const total = await Trip.countDocuments(query);
    
    res.json({
      success: true,
      data: trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trips'
    });
  }
});

// @route   GET /api/trips/public
// @desc    Get all public trips
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const trips = await Trip.find({ isPublic: true })
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name avatar');
    
    // Get total count
    const total = await Trip.countDocuments({ isPublic: true });
    
    res.json({
      success: true,
      data: trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching public trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public trips'
    });
  }
});

// @route   GET /api/trips/upcoming
// @desc    Get upcoming trips for authenticated user
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
  try {
    const trips = await Trip.findUpcoming(req.user.id);
    
    res.json({
      success: true,
      data: trips
    });

  } catch (error) {
    console.error('Error fetching upcoming trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming trips'
    });
  }
});

// @route   GET /api/trips/:id
// @desc    Get trip by ID
// @access  Private (if private trip) or Public (if public trip)
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('user', 'name avatar');
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user can access this trip
    if (!trip.isPublic && (!req.user || trip.user._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This trip is private.'
      });
    }
    
    res.json({
      success: true,
      data: trip
    });

  } catch (error) {
    console.error('Error fetching trip:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip'
    });
  }
});

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user owns this trip
    if (!trip.canEdit(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own trips.'
      });
    }
    
    const {
      name,
      description,
      startDate,
      endDate,
      coverPhoto,
      isPublic,
      tags,
      budget,
      location,
      status
    } = req.body;
    
    // Update fields
    if (name !== undefined) {
      const n = String(name).trim();
      if (n.length < 3 || n.length > 120) return res.status(400).json({ success: false, message: 'Trip name must be between 3 and 120 characters' });
      trip.name = n;
    }
    if (description !== undefined) {
      const d = String(description).trim();
      if (d.length < 10 || d.length > 2000) return res.status(400).json({ success: false, message: 'Description must be between 10 and 2000 characters' });
      trip.description = d;
    }
    if (startDate !== undefined) {
      const s = new Date(startDate);
      if (Number.isNaN(s.getTime())) return res.status(400).json({ success: false, message: 'Invalid startDate' });
      trip.startDate = s;
    }
    if (endDate !== undefined) {
      const e = new Date(endDate);
      if (Number.isNaN(e.getTime())) return res.status(400).json({ success: false, message: 'Invalid endDate' });
      trip.endDate = e;
    }
    if (coverPhoto !== undefined) trip.coverPhoto = String(coverPhoto || '').trim();
    if (isPublic !== undefined) trip.isPublic = !!isPublic;
    if (tags !== undefined) {
      const tn = Array.isArray(tags) ? tags.filter((t) => typeof t === 'string').map((t) => t.trim()).filter(Boolean).slice(0, 20) : [];
      trip.tags = tn;
    }
    if (budget !== undefined) {
      const amount = Number(budget.amount);
      const currency = (budget.currency || 'USD').toString().toUpperCase().slice(0, 3);
      if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Budget amount must be a positive number' });
      if (!/^[A-Z]{3}$/.test(currency)) return res.status(400).json({ success: false, message: 'Budget currency must be a 3-letter code (e.g., USD)' });
      trip.budget = { amount, currency };
    }
    if (location !== undefined) {
      const city = String(location.city || '').trim();
      const country = String(location.country || '').trim();
      if (!city || !country) return res.status(400).json({ success: false, message: 'City and country are required' });
      trip.location = { city, country };
    }
    if (status !== undefined) trip.status = status;
    
    // Validate dates if they were updated
    if (startDate || endDate) {
      if (trip.startDate >= trip.endDate) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }
    
    const updatedTrip = await trip.save();
    await updatedTrip.populate('user', 'name avatar');
    
    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: updatedTrip
    });

  } catch (error) {
    console.error('Error updating trip:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating trip'
    });
  }
});

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user owns this trip
    if (!trip.canEdit(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own trips.'
      });
    }
    
    await Trip.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting trip:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting trip'
    });
  }
});

// @route   PATCH /api/trips/:id/status
// @desc    Update trip status
// @access  Private
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['planning', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: planning, active, completed, cancelled'
      });
    }
    
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user owns this trip
    if (!trip.canEdit(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own trips.'
      });
    }
    
    trip.status = status;
    const updatedTrip = await trip.save();
    await updatedTrip.populate('user', 'name avatar');
    
    res.json({
      success: true,
      message: 'Trip status updated successfully',
      data: updatedTrip
    });

  } catch (error) {
    console.error('Error updating trip status:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating trip status'
    });
  }
});

// @route   GET /api/trips/search
// @desc    Search trips
// @access  Private
router.get('/search', protect, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Build search query
    const searchQuery = {
      user: req.user.id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };
    
    // Execute search
    const trips = await Trip.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name avatar');
    
    // Get total count
    const total = await Trip.countDocuments(searchQuery);
    
    res.json({
      success: true,
      data: trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error searching trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching trips'
    });
  }
});

// @route   POST /api/trips/:id/cities
// @desc    Add a city to a trip
// @access  Private
router.post('/:id/cities', protect, async (req, res) => {
  try {
    const { id, name, country, img } = req.body;
    
    if (!id || !name || !country) {
      return res.status(400).json({
        success: false,
        message: 'City id, name, and country are required'
      });
    }

    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user owns this trip
    if (!trip.canEdit(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only add cities to your own trips.'
      });
    }

    // Check if city is already added
    const cityExists = trip.selectedCities.some(city => city.id === id);
    if (cityExists) {
      return res.status(400).json({
        success: false,
        message: 'City is already added to this trip'
      });
    }

    // Add city to trip
    trip.selectedCities.push({
      id: id.trim(),
      name: name.trim(),
      country: country.trim(),
      img: img || '',
      addedAt: new Date()
    });

    const updatedTrip = await trip.save();
    await updatedTrip.populate('user', 'name avatar');
    
    res.json({
      success: true,
      message: 'City added to trip successfully',
      data: updatedTrip
    });

  } catch (error) {
    console.error('Error adding city to trip:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while adding city to trip'
    });
  }
});

// @route   DELETE /api/trips/:id/cities/:cityId
// @desc    Remove a city from a trip
// @access  Private
router.delete('/:id/cities/:cityId', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user owns this trip
    if (!trip.canEdit(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only remove cities from your own trips.'
      });
    }

    // Remove city from trip
    trip.selectedCities = trip.selectedCities.filter(city => city.id !== req.params.cityId);
    
    const updatedTrip = await trip.save();
    await updatedTrip.populate('user', 'name avatar');
    
    res.json({
      success: true,
      message: 'City removed from trip successfully',
      data: updatedTrip
    });

  } catch (error) {
    console.error('Error removing city from trip:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while removing city from trip'
    });
  }
});

// @route   GET /api/trips/:id/cities
// @desc    Get all cities in a trip
// @access  Private
router.get('/:id/cities', protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('user', 'name avatar');
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    
    // Check if user can access this trip
    if (!trip.isPublic && (!req.user || trip.user._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This trip is private.'
      });
    }
    
    res.json({
      success: true,
      data: trip.selectedCities
    });

  } catch (error) {
    console.error('Error fetching trip cities:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip cities'
    });
  }
});

// @route   POST /api/trips/quick-add
// @desc    Create a quick trip with selected cities
// @access  Private
router.post('/quick-add', protect, async (req, res) => {
  try {
    const { cities } = req.body;
    
    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one city is required'
      });
    }

    // Validate cities data
    for (const city of cities) {
      if (!city.id || !city.name || !city.country) {
        return res.status(400).json({
          success: false,
          message: 'Each city must have id, name, and country'
        });
      }
    }

    // Create trip with selected cities
    const trip = new Trip({
      name: `Trip to ${cities.map(c => c.name).join(', ')}`,
      description: `Exploring ${cities.length} amazing destination${cities.length > 1 ? 's' : ''}: ${cities.map(c => `${c.name}, ${c.country}`).join(' • ')}`,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      coverPhoto: cities[0]?.img || '',
      isPublic: false,
      tags: cities.map(c => `${c.name}, ${c.country}`),
      budget: { amount: 1000, currency: 'USD' },
      location: { 
        city: cities[0]?.name || '', 
        country: cities[0]?.country || '' 
      },
      selectedCities: cities.map(city => ({
        id: city.id,
        name: city.name,
        country: city.country,
        img: city.img || '',
        addedAt: new Date()
      })),
      user: req.user.id
    });

    const savedTrip = await trip.save();
    await savedTrip.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Quick trip created successfully',
      data: savedTrip
    });

  } catch (error) {
    console.error('Error creating quick trip:', error);
    
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
      message: 'Server error while creating quick trip'
    });
  }
});

module.exports = router;
