require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

async function ensureAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@globe.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'; // must be >= 8 chars
  const adminName = process.env.ADMIN_NAME || 'Administrator';

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Please set it in your .env');
    process.exit(1);
  }

  await connectDB();

  try {
    let user = await User.findOne({ email: adminEmail }).select('+password');
    if (!user) {
      user = new User({ name: adminName, email: adminEmail, password: adminPassword, role: 'admin', isActive: true });
      await user.save();
      console.log(`✅ Admin created: ${adminEmail}`);
    } else {
      const updates = {};
      if (user.role !== 'admin') updates.role = 'admin';
      if (user.isActive !== true) updates.isActive = true;
      if (Object.keys(updates).length) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        console.log(`🔐 Admin normalized: ${adminEmail}`);
      } else {
        console.log(`ℹ️  Admin already exists: ${adminEmail}`);
      }
      if (String(process.env.ADMIN_RESET || '').toLowerCase() === 'true') {
        user.password = adminPassword; // pre-save hook will hash
        await user.save();
        console.log('🔁 Admin password reset as requested (ADMIN_RESET=true)');
      }
    }
  } catch (err) {
    console.error('❌ Failed to ensure admin:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

ensureAdmin();


