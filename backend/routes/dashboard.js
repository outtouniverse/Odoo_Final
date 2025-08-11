const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard
// @desc    Get dashboard overview data
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's upcoming trips (next 30 days)
    const upcomingTrips = await Trip.find({
      user: userId,
      startDate: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    })
    .sort({ startDate: 1 })
    .limit(5)
    .populate('user', 'name avatar');
    
    // Get user's recent trips (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTrips = await Trip.find({
      user: userId,
      endDate: { $gte: thirtyDaysAgo },
      status: { $ne: 'cancelled' }
    })
    .sort({ endDate: -1 })
    .limit(5)
    .populate('user', 'name avatar');
    
    // Get user's active trips
    const activeTrips = await Trip.find({
      user: userId,
      status: 'active'
    })
    .populate('user', 'name avatar');
    
    // Get user's trip statistics
    const totalTrips = await Trip.countDocuments({ user: userId });
    const completedTrips = await Trip.countDocuments({ 
      user: userId, 
      status: 'completed' 
    });
    const planningTrips = await Trip.countDocuments({ 
      user: userId, 
      status: 'planning' 
    });
    
    // Get budget overview
    const budgetData = await Trip.aggregate([
      { $match: { user: userId, status: { $ne: 'cancelled' } } },
      { $group: {
        _id: null,
        totalBudget: { $sum: '$budget.amount' },
        averageBudget: { $avg: '$budget.amount' },
        minBudget: { $min: '$budget.amount' },
        maxBudget: { $max: '$budget.amount' }
      }}
    ]);
    
    // Get popular destinations from user's trips
    const popularDestinations = await Trip.aggregate([
      { $match: { user: userId, status: { $ne: 'cancelled' } } },
      { $group: {
        _id: {
          country: '$location.country',
          city: '$location.city'
        },
        visitCount: { $sum: 1 },
        totalBudget: { $sum: '$budget.amount' }
      }},
      { $sort: { visitCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Get monthly trip count for the current year
    const currentYear = new Date().getFullYear();
    const monthlyTrips = await Trip.aggregate([
      { $match: { 
        user: userId, 
        startDate: { 
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear + 1, 0, 1)
        }
      }},
      { $group: {
        _id: { $month: '$startDate' },
        tripCount: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Get quick actions data
    const quickActions = {
      planNewTrip: true,
      viewAllTrips: true,
      manageProfile: true,
      exportData: true,
      savedDestinations: true
    };
    
    // Get user's saved destinations count
    const user = await User.findById(userId).select('savedDestinations');
    const savedDestinationsCount = user ? user.savedDestinations.length : 0;
    
    // Calculate total spent and upcoming expenses
    const totalSpent = await Trip.aggregate([
      { $match: { 
        user: userId, 
        status: 'completed',
        'budget.amount': { $exists: true, $ne: null }
      }},
      { $group: {
        _id: null,
        total: { $sum: '$budget.amount' }
      }}
    ]);
    
    const upcomingExpenses = await Trip.aggregate([
      { $match: { 
        user: userId, 
        startDate: { $gte: new Date() },
        status: { $ne: 'cancelled' },
        'budget.amount': { $exists: true, $ne: null }
      }},
      { $group: {
        _id: null,
        total: { $sum: '$budget.amount' }
      }}
    ]);
    
    const dashboardData = {
      welcome: {
        message: `Welcome back, ${req.user.name}!`,
        date: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      },
      upcomingTrips: {
        count: upcomingTrips.length,
        trips: upcomingTrips
      },
      recentTrips: {
        count: recentTrips.length,
        trips: recentTrips
      },
      activeTrips: {
        count: activeTrips.length,
        trips: activeTrips
      },
      statistics: {
        totalTrips,
        completedTrips,
        planningTrips,
        savedDestinationsCount
      },
      budget: {
        totalSpent: totalSpent[0]?.total || 0,
        upcomingExpenses: upcomingExpenses[0]?.total || 0,
        overview: budgetData[0] || {
          totalBudget: 0,
          averageBudget: 0,
          minBudget: 0,
          maxBudget: 0
        }
      },
      popularDestinations,
      monthlyTrips,
      quickActions,
      recommendations: {
        popularCities: [
          { name: 'Paris', country: 'France', image: 'https://example.com/paris.jpg', popularity: 95 },
          { name: 'Tokyo', country: 'Japan', image: 'https://example.com/tokyo.jpg', popularity: 92 },
          { name: 'New York', country: 'USA', image: 'https://example.com/nyc.jpg', popularity: 90 },
          { name: 'London', country: 'UK', image: 'https://example.com/london.jpg', popularity: 88 },
          { name: 'Rome', country: 'Italy', image: 'https://example.com/rome.jpg', popularity: 85 }
        ],
        trendingDestinations: [
          { name: 'Bali', country: 'Indonesia', trend: 'up', growth: 15 },
          { name: 'Santorini', country: 'Greece', trend: 'up', growth: 12 },
          { name: 'Machu Picchu', country: 'Peru', trend: 'up', growth: 10 }
        ]
      }
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/dashboard/upcoming
// @desc    Get detailed upcoming trips
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    
    const upcomingTrips = await Trip.find({
      user: req.user.id,
      startDate: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    })
    .sort({ startDate: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name avatar');
    
    const total = await Trip.countDocuments({
      user: req.user.id,
      startDate: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    });
    
    res.json({
      success: true,
      data: upcomingTrips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching upcoming trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming trips'
    });
  }
});

// @route   GET /api/dashboard/recent
// @desc    Get detailed recent trips
// @access  Private
router.get('/recent', protect, async (req, res) => {
  try {
    const { limit = 10, page = 1, days = 30 } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    
    const recentTrips = await Trip.find({
      user: req.user.id,
      endDate: { $gte: daysAgo },
      status: { $ne: 'cancelled' }
    })
    .sort({ endDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('user', 'name avatar');
    
    const total = await Trip.countDocuments({
      user: req.user.id,
      endDate: { $gte: daysAgo },
      status: { $ne: 'cancelled' }
    });
    
    res.json({
      success: true,
      data: recentTrips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching recent trips:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent trips'
    });
  }
});

// @route   GET /api/dashboard/statistics
// @desc    Get detailed trip statistics
// @access  Private
router.get('/statistics', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;
    
    // Yearly statistics
    const yearlyStats = await Trip.aggregate([
      { $match: { 
        user: userId,
        startDate: { 
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }},
      { $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalBudget: { $sum: '$budget.amount' },
        averageBudget: { $avg: '$budget.amount' },
        completedTrips: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        activeTrips: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        planningTrips: { $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] } }
      }}
    ]);
    
    // Monthly breakdown
    const monthlyBreakdown = await Trip.aggregate([
      { $match: { 
        user: userId,
        startDate: { 
          $gte: new Date(year, 0, 1),
          $lt: new Date(year + 1, 0, 1)
        }
      }},
      { $group: {
        _id: { $month: '$startDate' },
        tripCount: { $sum: 1 },
        totalBudget: { $sum: '$budget.amount' }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Destination statistics
    const destinationStats = await Trip.aggregate([
      { $match: { user: userId } },
      { $group: {
        _id: {
          country: '$location.country',
          city: '$location.city'
        },
        visitCount: { $sum: 1 },
        totalBudget: { $sum: '$budget.amount' },
        averageBudget: { $avg: '$budget.amount' }
      }},
      { $sort: { visitCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Budget statistics
    const budgetStats = await Trip.aggregate([
      { $match: { 
        user: userId,
        'budget.amount': { $exists: true, $ne: null }
      }},
      { $group: {
        _id: null,
        totalBudget: { $sum: '$budget.amount' },
        averageBudget: { $avg: '$budget.amount' },
        minBudget: { $min: '$budget.amount' },
        maxBudget: { $max: '$budget.amount' },
        budgetTrips: { $sum: 1 }
      }}
    ]);
    
    const statistics = {
      yearly: yearlyStats[0] || {
        totalTrips: 0,
        totalBudget: 0,
        averageBudget: 0,
        completedTrips: 0,
        activeTrips: 0,
        planningTrips: 0
      },
      monthly: monthlyBreakdown,
      destinations: destinationStats,
      budget: budgetStats[0] || {
        totalBudget: 0,
        averageBudget: 0,
        minBudget: 0,
        maxBudget: 0,
        budgetTrips: 0
      },
      year: parseInt(year)
    };
    
    res.json({
      success: true,
      data: statistics
    });
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
});

// @route   GET /api/dashboard/recommendations
// @desc    Get personalized travel recommendations
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's travel preferences based on past trips
    const userPreferences = await Trip.aggregate([
      { $match: { user: userId, status: { $ne: 'cancelled' } } },
      { $group: {
        _id: {
          country: '$location.country',
          tags: '$tags'
        },
        visitCount: { $sum: 1 },
        totalBudget: { $sum: '$budget.amount' }
      }},
      { $sort: { visitCount: -1 } },
      { $limit: 5 }
    ]);
    
    // Get popular destinations from all users
    const popularDestinations = await Trip.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: {
        _id: {
          country: '$location.country',
          city: '$location.city'
        },
        visitCount: { $sum: 1 },
        averageBudget: { $avg: '$budget.amount' }
      }},
      { $sort: { visitCount: -1 } },
      { $limit: 10 }
    ]);
    
    // Get trending destinations (destinations with recent activity)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendingDestinations = await Trip.aggregate([
      { $match: { 
        createdAt: { $gte: thirtyDaysAgo },
        status: { $ne: 'cancelled' }
      }},
      { $group: {
        _id: {
          country: '$location.country',
          city: '$location.city'
        },
        recentVisits: { $sum: 1 },
        averageBudget: { $avg: '$budget.amount' }
      }},
      { $sort: { recentVisits: -1 } },
      { $limit: 8 }
    ]);
    
    // Get seasonal recommendations
    const currentMonth = new Date().getMonth();
    const seasonalDestinations = [
      { name: 'Ski Resorts', destinations: ['Switzerland', 'Canada', 'Japan'], season: 'Winter' },
      { name: 'Beach Destinations', destinations: ['Maldives', 'Caribbean', 'Australia'], season: 'Summer' },
      { name: 'Cultural Cities', destinations: ['Paris', 'Rome', 'Kyoto'], season: 'Spring/Fall' },
      { name: 'Adventure Spots', destinations: ['New Zealand', 'Costa Rica', 'Nepal'], season: 'Year-round' }
    ];
    
    const recommendations = {
      personalized: userPreferences,
      popular: popularDestinations,
      trending: trendingDestinations,
      seasonal: seasonalDestinations,
      budgetFriendly: popularDestinations.filter(dest => dest.averageBudget < 2000).slice(0, 5),
      luxury: popularDestinations.filter(dest => dest.averageBudget > 5000).slice(0, 5)
    };
    
    res.json({
      success: true,
      data: recommendations
    });
    
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations'
    });
  }
});

// @route   GET /api/dashboard/quick-actions
// @desc    Get available quick actions
// @access  Private
router.get('/quick-actions', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's saved destinations count
    const user = await User.findById(userId).select('savedDestinations');
    const savedDestinationsCount = user ? user.savedDestinations.length : 0;
    
    // Get user's active trips count
    const activeTripsCount = await Trip.countDocuments({
      user: userId,
      status: 'active'
    });
    
    // Get user's upcoming trips count
    const upcomingTripsCount = await Trip.countDocuments({
      user: userId,
      startDate: { $gte: new Date() },
      status: { $ne: 'cancelled' }
    });
    
    const quickActions = {
      planNewTrip: {
        available: true,
        action: 'Create a new trip',
        icon: 'plus',
        route: '/trips/create'
      },
      viewAllTrips: {
        available: true,
        action: 'View all trips',
        icon: 'list',
        route: '/trips',
        count: upcomingTripsCount + activeTripsCount
      },
      manageProfile: {
        available: true,
        action: 'Edit profile',
        icon: 'user',
        route: '/profile'
      },
      savedDestinations: {
        available: true,
        action: 'Saved destinations',
        icon: 'bookmark',
        route: '/profile/saved-destinations',
        count: savedDestinationsCount
      },
      exportData: {
        available: true,
        action: 'Export data',
        icon: 'download',
        route: '/profile/export'
      },
      budgetOverview: {
        available: true,
        action: 'Budget overview',
        icon: 'dollar-sign',
        route: '/dashboard/statistics'
      }
    };
    
    res.json({
      success: true,
      data: quickActions
    });
    
  } catch (error) {
    console.error('Error fetching quick actions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quick actions'
    });
  }
});

module.exports = router;
