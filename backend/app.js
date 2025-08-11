require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

// Import configurations
const connectDB = require('./config/database');
require('./config/passport');
const User = require('./models/User');

// Import routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const tripsRouter = require('./routes/trips');
const profileRouter = require('./routes/profile');
const dashboardRouter = require('./routes/dashboard');
const adminRouter = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB().then(async () => {
  // Optional admin bootstrap from environment
  try {
    const email = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD || '';
    const name = process.env.ADMIN_NAME || 'Administrator';
    const shouldReset = String(process.env.ADMIN_RESET || '').toLowerCase() === 'true';
    if (email && password) {
      let admin = await User.findOne({ email }).select('+password');
      if (!admin) {
        admin = new User({ name, email, password, role: 'admin', isActive: true });
        await admin.save();
        console.log(`✅ Admin created: ${email}`);
      } else {
        let changed = false;
        if (admin.role !== 'admin') { admin.role = 'admin'; changed = true; }
        if (admin.isActive !== true) { admin.isActive = true; changed = true; }
        if (shouldReset) { admin.password = password; changed = true; }
        if (changed) { await admin.save(); console.log(`🔐 Admin updated: ${email}`); }
      }
    }
  } catch (e) {
    console.error('Admin bootstrap failed:', e.message);
  }
});

// Security middleware
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

// Logging middleware
app.use(logger('dev'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(errorHandler);

module.exports = app;
