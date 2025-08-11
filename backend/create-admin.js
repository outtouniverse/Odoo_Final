const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/globetrotter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdmin() {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@globe.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@globe.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      language: 'en',
      timezone: 'UTC',
      currency: 'USD',
      theme: 'light',
      notifications: { email: true, push: true, marketing: false },
      privacySettings: { profileVisibility: 'public', tripVisibility: 'friends', locationSharing: false }
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@globe.com');
    console.log('🔑 Password: admin123456');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
