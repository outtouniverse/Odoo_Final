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

    // Create new trip
    const trip = new Trip({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      coverPhoto: coverPhoto || '',
      isPublic: isPublic || false,
      tags: tags || [],
      budget: budget || {},
      location: location || {},
      user: req.user.id
    });

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (new Date(startDate) < new Date()) {
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
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    if (status) query.status = status;
    
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
    if (name !== undefined) trip.name = name;
    if (description !== undefined) trip.description = description;
    if (startDate !== undefined) trip.startDate = new Date(startDate);
    if (endDate !== undefined) trip.endDate = new Date(endDate);
    if (coverPhoto !== undefined) trip.coverPhoto = coverPhoto;
    if (isPublic !== undefined) trip.isPublic = isPublic;
    if (tags !== undefined) trip.tags = tags;
    if (budget !== undefined) trip.budget = budget;
    if (location !== undefined) trip.location = location;
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

module.exports = router;
