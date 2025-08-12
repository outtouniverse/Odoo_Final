const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const { protect, optionalAuth } = require('../middleware/auth');

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
router.get('/:id', optionalAuth, async (req, res) => {
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
      console.error('Validation errors:', messages);
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

// @route   POST /api/trips/:id/cities/:cityId/activities
// @desc    Add an activity to a city in a trip
// @access  Private
router.post('/:id/cities/:cityId/activities', protect, async (req, res) => {
  try {
    const { id, cityId } = req.params;
    const activity = req.body;

    // Validate trip ID
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    // Validate city ID
    if (!cityId || typeof cityId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid city ID'
      });
    }

    // Validate activity data
    if (!activity.id || !activity.name || !activity.city || !activity.category || !activity.cost || !activity.duration) {
      return res.status(400).json({
        success: false,
        message: 'Activity must have id, name, city, category, cost, and duration'
      });
    }

    // Validate activity fields
    const validCategories = ['Sightseeing', 'Food', 'Adventure', 'Culture', 'Nightlife'];
    const validCosts = ['Low', 'Medium', 'High'];
    const validDurations = ['1–3 hrs', 'Half-day', 'Full-day'];

    if (!validCategories.includes(activity.category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity category'
      });
    }

    if (!validCosts.includes(activity.cost)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity cost'
      });
    }

    if (!validDurations.includes(activity.duration)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity duration'
      });
    }

    // Find trip and check ownership
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own trips.'
      });
    }

    // Add activity to city
    await trip.addActivityToCity(cityId, {
      id: activity.id,
      name: activity.name,
      city: activity.city,
      category: activity.category,
      cost: activity.cost,
      duration: activity.duration,
      rating: activity.rating || 4.0,
      img: activity.img || '',
      description: activity.description || '',
      tags: Array.isArray(activity.tags) ? activity.tags.slice(0, 10) : [],
      addedAt: new Date()
    });

    await trip.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      data: trip
    });

  } catch (error) {
    console.error('Error adding activity to city:', error);
    
    if (error.message === 'City not found in trip') {
      return res.status(404).json({
        success: false,
        message: 'City not found in this trip'
      });
    }

    if (error.message === 'Activity already exists in this city') {
      return res.status(409).json({
        success: false,
        message: 'Activity already exists in this city'
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
      message: 'Server error while adding activity'
    });
  }
});

// @route   DELETE /api/trips/:id/cities/:cityId/activities/:activityId
// @desc    Remove an activity from a city in a trip
// @access  Private
router.delete('/:id/cities/:cityId/activities/:activityId', protect, async (req, res) => {
  try {
    const { id, cityId, activityId } = req.params;

    // Validate trip ID
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    // Validate city ID and activity ID
    if (!cityId || !activityId) {
      return res.status(400).json({
        success: false,
        message: 'City ID and activity ID are required'
      });
    }

    // Find trip and check ownership
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own trips.'
      });
    }

    // Remove activity from city
    await trip.removeActivityFromCity(cityId, activityId);

    await trip.populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Activity removed successfully',
      data: trip
    });

  } catch (error) {
    console.error('Error removing activity from city:', error);
    
    if (error.message === 'City not found in trip') {
      return res.status(404).json({
        success: false,
        message: 'City not found in this trip'
      });
    }

    if (error.message === 'Activity not found in this city') {
      return res.status(404).json({
        success: false,
        message: 'Activity not found in this city'
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
      message: 'Server error while removing activity'
    });
  }
});

// @route   GET /api/trips/:id/cities/:cityId/activities
// @desc    Get all activities for a city in a trip
// @access  Private/Public (based on trip visibility)
router.get('/:id/cities/:cityId/activities', optionalAuth, async (req, res) => {
  try {
    const { id, cityId } = req.params;

    // Validate trip ID
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    // Validate city ID
    if (!cityId) {
      return res.status(400).json({
        success: false,
        message: 'City ID is required'
      });
    }

    // Find trip
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check access permissions
    if (!trip.isPublic && (!req.user || trip.user.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This trip is private.'
      });
    }

    // Get activities for the city
    const activities = trip.getCityActivities(cityId);

    res.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching city activities:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching activities'
    });
  }
});

// @route   GET /api/trips/:id/activities
// @desc    Get all activities across all cities in a trip
// @access  Private/Public (based on trip visibility)
router.get('/:id/activities', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate trip ID
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    // Find trip
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check access permissions
    if (!trip.isPublic && (!req.user || trip.user.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This trip is private.'
      });
    }

    // Get all activities from all cities
    const allActivities = trip.selectedCities.reduce((acc, city) => {
      if (city.activities && city.activities.length > 0) {
        acc.push(...city.activities.map(activity => ({
          ...activity.toObject(),
          cityId: city.id,
          cityName: city.name
        })));
      }
      return acc;
    }, []);

    res.json({
      success: true,
      data: allActivities
    });

  } catch (error) {
    console.error('Error fetching trip activities:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid trip ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching activities'
    });
  }
});

// @route   GET /api/trips/:id/itinerary
// @desc    Get itinerary (calendar) for a trip
// @access  Private/Public (based on trip visibility)
router.get('/:id/itinerary', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!trip.isPublic && (!req.user || trip.user.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied. This trip is private.' });
    }
    res.json({ success: true, data: trip.itinerary || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching itinerary' });
  }
});

// @route   PUT /api/trips/:id/itinerary
// @desc    Upsert itinerary (calendar) for a trip
// @access  Private
router.put('/:id/itinerary', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { itinerary } = req.body;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    if (!Array.isArray(itinerary)) return res.status(400).json({ success: false, message: 'Invalid itinerary payload' });
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    // Basic sanitize
    const sanitized = itinerary.map((d) => ({
      id: String(d.id || '').trim().slice(0, 24),
      date: String(d.date || '').trim().slice(0, 10),
      items: Array.isArray(d.items) ? d.items.map((it) => ({
        id: String(it.id || '').trim().slice(0, 24),
        activityId: String(it.activityId || '').trim().slice(0, 64),
        time: String(it.time || '09:00').trim().slice(0, 5),
        name: String(it.name || 'Item').trim().slice(0, 120),
      })) : []
    }));
    trip.itinerary = sanitized;
    const saved = await trip.save();
    res.json({ success: true, data: saved.itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while saving itinerary' });
  }
});

// @route   GET /api/trips/:id/budget
// @desc    Get budget summary for a trip
// @access  Private/Public (based on trip visibility)
router.get('/:id/budget', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    }
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (!trip.isPublic && (!req.user || trip.user.toString() !== req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied. This trip is private.' });
    }
    res.json({ success: true, data: trip.budgetSummary || { transport: 0, stay: 0, activities: 0, meals: 0, total: 0, currency: (trip.budget?.currency || 'USD') } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching budget' });
  }
});

// @route   PUT /api/trips/:id/budget
// @desc    Save budget summary for a trip
// @access  Private
router.put('/:id/budget', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { summary } = req.body;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) return res.status(400).json({ success: false, message: 'Invalid trip ID' });
    if (!summary || typeof summary !== 'object') return res.status(400).json({ success: false, message: 'Invalid budget summary' });
    const trip = await Trip.findById(id);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.user.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    const clean = {
      transport: Math.max(0, Number(summary.transport) || 0),
      stay: Math.max(0, Number(summary.stay) || 0),
      activities: Math.max(0, Number(summary.activities) || 0),
      meals: Math.max(0, Number(summary.meals) || 0),
      total: Math.max(0, Number(summary.total) || 0),
      currency: String(summary.currency || trip.budget?.currency || 'USD').slice(0, 3).toUpperCase(),
    };
    trip.budgetSummary = clean;
    const saved = await trip.save();
    res.json({ success: true, data: saved.budgetSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while saving budget' });
  }
});

// @route   POST /api/trips/save-activity
// @desc    Save an activity to user's latest trip or create a new one
// @access  Private
router.post('/save-activity', protect, async (req, res) => {
  try {
    console.log('🔍 Save activity request received:', {
      userId: req.user && req.user.id ? req.user.id : 'unknown',
      body: req.body,
      cityName: req.body.cityName,
      cityCountry: req.body.cityCountry,
      activityFields: req.body.activity ? Object.keys(req.body.activity) : 'No activity object'
    });

    const { cityName, cityCountry, activity } = req.body;
    
    // Log the exact data received
    console.log('🔍 Raw request data:', {
      cityName: req.body.cityName,
      cityCountry: req.body.cityCountry,
      activity: req.body.activity,
      bodyKeys: Object.keys(req.body),
      bodyType: typeof req.body
    });
    
    // Enhanced validation with better error messages
    console.log('🔍 Validating cityName:', { cityName, type: typeof cityName, trimmed: cityName?.trim(), length: cityName?.trim()?.length });
    
    if (!cityName || typeof cityName !== 'string' || cityName.trim().length === 0) {
      console.log('❌ City name validation failed');
      return res.status(400).json({
        success: false,
        message: 'City name is required and must be a non-empty string'
      });
    }

    console.log('🔍 Validating cityCountry:', { cityCountry, type: typeof cityCountry, trimmed: cityCountry?.trim(), length: cityCountry?.trim()?.length });
    
    // Handle cityCountry validation more gracefully
    let effectiveCityCountry = 'Unknown';
    if (cityCountry && typeof cityCountry === 'string') {
      effectiveCityCountry = cityCountry.trim() || 'Unknown';
    }
    
    console.log('🔍 Effective city country:', { original: cityCountry, effective: effectiveCityCountry });

    console.log('🔍 Validating activity object:', { 
      hasActivity: !!activity, 
      type: typeof activity, 
      isObject: activity && typeof activity === 'object',
      keys: activity ? Object.keys(activity) : 'No keys'
    });
    
    if (!activity || typeof activity !== 'object') {
      console.log('❌ Activity object validation failed');
      return res.status(400).json({
        success: false,
        message: 'Activity object is required'
      });
    }

    // Validate activity data with better error handling
    const requiredFields = ['id', 'name', 'category', 'cost', 'duration'];
    const missingFields = requiredFields.filter(field => {
      const value = activity[field];
      return value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0);
    });
    
    console.log('🔍 Validating required activity fields:', {
      requiredFields,
      missingFields,
      activityValues: {
        id: activity.id,
        name: activity.name,
        category: activity.category,
        cost: activity.cost,
        duration: activity.duration
      }
    });
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required activity fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required activity fields: ${missingFields.join(', ')}`
      });
    }

    // Sanitize and validate input data
    const cleanCityName = cityName.trim();
    const cleanCityCountry = effectiveCityCountry.trim();
    const cleanActivityId = String(activity.id).trim();
    const cleanActivityName = String(activity.name).trim();
    const cleanCategory = String(activity.category).trim();
    const cleanCost = String(activity.cost).trim();
    const cleanDuration = String(activity.duration).trim();
    
    console.log('🔍 Sanitized data:', {
      cleanCityName,
      cleanCityCountry,
      cleanActivityId,
      cleanActivityName,
      cleanCategory,
      cleanCost,
      cleanDuration
    });
    
    // Additional validation for sanitized data
    if (!cleanCityName || cleanCityName.length === 0 || cleanCityName.trim().length === 0) {
      console.log('❌ Clean city name is empty or only whitespace after sanitization');
      return res.status(400).json({
        success: false,
        message: 'City name cannot be empty or only whitespace after sanitization'
      });
    }
    
    if (!cleanCityCountry || cleanCityCountry.length === 0 || cleanCityCountry.trim().length === 0) {
      console.log('❌ Clean city country is empty or only whitespace after sanitization');
      return res.status(400).json({
        success: false,
        message: 'City country cannot be empty or only whitespace after sanitization'
      });
    }
    
    // Additional check for city name content - but be more lenient
    if (cleanCityName === 'Unknown' || cleanCityName === 'Unknown City' || cleanCityName === '') {
      console.log('❌ City name is using default/unknown value or empty');
      return res.status(400).json({
        success: false,
        message: 'City name cannot be a default or unknown value'
      });
    }

    // Validate category
    const validCategories = ['Sightseeing', 'Food', 'Adventure', 'Culture', 'Nightlife'];
    console.log('🔍 Validating category:', { cleanCategory, validCategories, isValid: validCategories.includes(cleanCategory) });
    
    if (!validCategories.includes(cleanCategory)) {
      console.log('❌ Invalid category:', cleanCategory);
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate cost
    const validCosts = ['Low', 'Medium', 'High'];
    console.log('🔍 Validating cost:', { cleanCost, validCosts, isValid: validCosts.includes(cleanCost) });
    
    if (!validCosts.includes(cleanCost)) {
      console.log('❌ Invalid cost:', cleanCost);
      return res.status(400).json({
        success: false,
        message: `Invalid cost. Must be one of: ${validCosts.join(', ')}`
      });
    }

    // Validate duration
    const validDurations = ['1–3 hrs', 'Half-day', 'Full-day'];
    console.log('🔍 Validating duration:', { cleanDuration, validDurations, isValid: validDurations.includes(cleanDuration) });
    
    if (!validDurations.includes(cleanDuration)) {
      console.log('❌ Invalid duration:', cleanDuration);
      return res.status(400).json({
        success: false,
        message: `Invalid duration. Must be one of: ${validDurations.join(', ')}`
      });
    }

    // Find user's latest trip or create a new one
    let trip;
    try {
      trip = await Trip.findOne({ user: req.user.id }).sort({ createdAt: -1 });
      
      if (!trip) {
        console.log('🔍 No existing trip found, creating new trip...');
        // Create a new trip for the user
        trip = new Trip({
          name: `Trip to ${cleanCityName}`,
          description: `Exploring ${cleanCityName}, ${cleanCityCountry}`,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          coverPhoto: '',
          isPublic: false,
          tags: [`${cleanCityName}, ${cleanCityCountry}`],
          budget: { amount: 1000, currency: 'USD' },
          location: { 
            city: cleanCityName, 
            country: cleanCityCountry 
          },
          selectedCities: [],
          user: req.user.id
        });
        console.log('🔍 New trip created in memory');
        
        // Validate the new trip object
        try {
          await trip.validate();
          console.log('✅ New trip validation passed');
        } catch (validationError) {
          console.error('❌ New trip validation failed:', validationError);
          return res.status(400).json({
            success: false,
            message: 'Trip validation failed',
            error: process.env.NODE_ENV === 'development' ? validationError.message : undefined
          });
        }
      } else {
        console.log('🔍 Found existing trip:', trip._id);
      }
        } catch (tripError) {
      console.error('❌ Error finding/creating trip:', tripError);
      return res.status(500).json({
        success: false,
        message: 'Error finding or creating trip',
        error: process.env.NODE_ENV === 'development' ? tripError.message : undefined
      });
    }
    
    // Ensure trip object exists
    if (!trip) {
      console.error('❌ Trip object is undefined after creation/finding');
      return res.status(500).json({
        success: false,
        message: 'Failed to create or find trip'
      });
    }
    
    // Create city ID (ensure it's unique and valid)
    const cityId = `${cleanCityName}-${cleanCityCountry}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    console.log('🔍 City ID generation:', {
      original: `${cleanCityName}-${cleanCityCountry}`,
      cityId,
      cityIdLength: cityId?.length
    });
    
    // Ensure cityId is not empty after sanitization
    if (!cityId || cityId.length === 0) {
      console.log('❌ City ID is empty after generation');
      return res.status(400).json({
        success: false,
        message: 'Invalid city name or country - unable to generate valid city ID'
      });
    }
    
    // Check if city already exists in the trip
    let cityIndex = trip.selectedCities.findIndex(city => city.id === cityId);
    
    if (cityIndex === -1) {
      // Add new city to trip
      trip.selectedCities.push({
        id: cityId,
        name: cleanCityName,
        country: cleanCityCountry,
        img: activity.img || '',
        addedAt: new Date(),
        activities: []
      });
      cityIndex = trip.selectedCities.length - 1;
    }

    // Check if activity already exists in the city
    const existingActivityIndex = trip.selectedCities[cityIndex].activities.findIndex(
      act => act.id === cleanActivityId
    );

    if (existingActivityIndex !== -1) {
      return res.status(409).json({
        success: false,
        message: 'Activity already exists in this city'
      });
    }

    // Sanitize fields that can violate schema constraints
    const sanitizedName = cleanActivityName.slice(0, 100);
    const sanitizedDescription = (activity.description || `Activity in ${cleanCityName}`).slice(0, 500);
    
    // Sanitize tags and image
    const sanitizedTags = (Array.isArray(activity.tags) ? activity.tags : ['activity', 'tourism'])
      .slice(0, 10)
      .map(t => String(t).trim().slice(0, 20));

    // Image validation in schema is strict (requires file extension). To avoid ValidationError, drop invalid URLs.
    const rawImg = typeof activity.img === 'string' ? activity.img : '';
    const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
    const sanitizedImg = imageUrlPattern.test(rawImg) ? rawImg : '';

    // Create the new activity object with sanitized data
    const newActivity = {
      id: cleanActivityId,
      name: sanitizedName,
      city: cleanCityName,
      category: cleanCategory,
      cost: cleanCost,
      duration: cleanDuration,
      rating: Math.min(5, Math.max(0, Number(activity.rating) || 4.0)),
      img: sanitizedImg,
      description: sanitizedDescription,
      tags: sanitizedTags,
      addedAt: new Date()
    };
    
    console.log('🔍 New activity object:', newActivity);

    // Final validation of the new activity object
    if (!newActivity.id || !newActivity.name || !newActivity.city || !newActivity.category || !newActivity.cost || !newActivity.duration) {
      console.log('❌ Final validation failed for new activity');
      console.log('❌ Failed values:', {
        id: newActivity.id,
        name: newActivity.name,
        city: newActivity.city,
        category: newActivity.category,
        cost: newActivity.cost,
        duration: newActivity.duration
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid activity data after sanitization'
      });
    }

    // Add the new activity to the city
    trip.selectedCities[cityIndex].activities.push(newActivity);

    // Ensure no duplicate activity IDs remain (defensive cleanup)
    const uniqueActivitiesMap = new Map();
    for (const a of trip.selectedCities[cityIndex].activities) {
      if (!uniqueActivitiesMap.has(a.id)) uniqueActivitiesMap.set(a.id, a);
    }
    trip.selectedCities[cityIndex].activities = Array.from(uniqueActivitiesMap.values());

    console.log('🔍 Saving trip to database...');
    
    // Log the trip object before saving for debugging
    console.log('🔍 Trip object before save:', {
      _id: trip._id,
      name: trip.name,
      user: trip.user,
      selectedCitiesCount: trip.selectedCities?.length || 0,
      selectedCities: trip.selectedCities?.map(city => ({
        id: city.id,
        name: city.name,
        country: city.country,
        activitiesCount: city.activities?.length || 0
      }))
    });
    
    // Defensive cleanup for duplicate cities by id (can happen in older data)
    if (trip.selectedCities && trip.selectedCities.length > 0) {
      const uniqueCityMap = new Map();
      for (const c of trip.selectedCities) {
        if (!uniqueCityMap.has(c.id)) {
          // also dedupe each city's activities
          const uniqActs = new Map();
          for (const a of (c.activities || [])) {
            if (!uniqActs.has(a.id)) uniqActs.set(a.id, a);
          }
          c.activities = Array.from(uniqActs.values());
          uniqueCityMap.set(c.id, c);
        }
      }
      trip.selectedCities = Array.from(uniqueCityMap.values());
    }

    let savedTrip;
    try {
      savedTrip = await trip.save();
      console.log('✅ Trip saved successfully');
      
      try {
        await savedTrip.populate('user', 'name avatar');
        console.log('✅ Trip populated with user data');
      } catch (populateError) {
        console.warn('⚠️ Warning: Could not populate user data:', populateError.message);
        // Continue without populated user data
      }
    } catch (saveError) {
      console.error('❌ Error saving trip to database:', saveError);
      
      if (saveError.name === 'ValidationError') {
        const messages = Object.values(saveError.errors).map(err => err.message);
        console.log('❌ Trip validation errors:', messages);
        return res.status(400).json({
          success: false,
          message: 'Trip validation failed',
          errors: messages
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error saving trip to database',
        error: process.env.NODE_ENV === 'development' ? saveError.message : undefined
      });
    }

    console.log('✅ Activity saved successfully:', {
      tripId: savedTrip._id,
      cityId: cityId,
      activityId: cleanActivityId,
      cityName: cleanCityName,
      country: cleanCityCountry
    });

    res.status(201).json({
      success: true,
      message: 'Activity saved successfully',
      data: savedTrip
    });

  } catch (error) {
    console.error('❌ Error saving activity:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('❌ Validation error details:', messages);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    if (error.name === 'MongoError' || error.code === 11000) {
      console.log('❌ MongoDB duplicate error:', { code: error.code, message: error.message });
      return res.status(409).json({
        success: false,
        message: 'Duplicate activity or city detected'
      });
    }

    // Handle any other unexpected errors
    console.log('❌ Unexpected error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while saving activity',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/trips/save-city
// @desc    Save a city to user's latest trip or create a new one
// @access  Private
router.post('/save-city', protect, async (req, res) => {
  try {
    const { cityName, cityCountry, cityImg } = req.body;
    
    if (!cityName || !cityCountry) {
      return res.status(400).json({
        success: false,
        message: 'City name and country are required'
      });
    }

    // Find user's latest trip or create a new one
    let trip = await Trip.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    
    if (!trip) {
      // Create a new trip for the user
      trip = new Trip({
        name: `Trip to ${cityName}`,
        description: `Exploring ${cityName}, ${cityCountry}`,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        coverPhoto: cityImg || '',
        isPublic: false,
        tags: [`${cityName}, ${cityCountry}`],
        budget: { amount: 1000, currency: 'USD' },
        location: { 
          city: cityName, 
          country: cityCountry 
        },
        selectedCities: [],
        user: req.user.id
      });
    }

    // Create city ID
    const cityId = `${cityName}-${cityCountry}`.toLowerCase().replace(/\s+/g, '-');
    
    // Check if city already exists in the trip
    const cityExists = trip.selectedCities.some(city => city.id === cityId);
    
    if (cityExists) {
      return res.status(409).json({
        success: false,
        message: 'City already exists in this trip'
      });
    }

    // Add new city to trip
    trip.selectedCities.push({
      id: cityId,
      name: cityName,
      country: cityCountry,
      img: cityImg || '',
      addedAt: new Date(),
      activities: []
    });

    const savedTrip = await trip.save();
    await savedTrip.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'City saved successfully',
      data: savedTrip
    });

  } catch (error) {
    console.error('Error saving city:', error);
    
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
      message: 'Server error while saving city'
    });
  }
});

// @route   GET /api/trips/stats
// @desc    Get user's trip statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total trips
    const totalTrips = await Trip.countDocuments({ user: userId });
    
    // Get upcoming cities count
    const upcomingTrips = await Trip.find({ 
      user: userId, 
      startDate: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    });
    
    const upcomingCities = upcomingTrips.reduce((total, trip) => {
      return total + (trip.selectedCities ? trip.selectedCities.length : 0);
    }, 0);
    
    // Get total budget planned
    const tripsWithBudget = await Trip.find({ 
      user: userId,
      'budget.amount': { $exists: true, $gt: 0 }
    });
    
    const totalBudget = tripsWithBudget.reduce((total, trip) => {
      return total + (trip.budget?.amount || 0);
    }, 0);
    
    // Get currency (use most common or default to USD)
    const currency = tripsWithBudget.length > 0 
      ? tripsWithBudget[0].budget?.currency || 'USD'
      : 'USD';
    
    res.json({
      success: true,
      data: {
        totalTrips,
        upcomingCities,
        totalBudget: {
          amount: totalBudget,
          currency
        }
      }
    });

  } catch (error) {
    console.error('Error fetching trip stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trip statistics'
    });
  }
});

module.exports = router;
