const mongoose = require('mongoose');
const User = require('./models/User');
const Trip = require('./models/Trip');
const City = require('./models/City');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/globetrotter', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addSampleData() {
  try {
    console.log('Adding sample data...');

    // Create admin user if not exists
    let adminUser = await User.findOne({ email: 'admin@globe.com' });
    if (!adminUser) {
      const adminPassword = await bcrypt.hash('admin123456', 12);
      adminUser = new User({
        name: 'Admin User',
        email: 'admin@globe.com',
        password: adminPassword,
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
      console.log('✅ Admin user created');
    }

    // Create test users if not exist
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    ];

    for (const userData of testUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        user = new User({
          ...userData,
          password: hashedPassword,
          isActive: true,
          language: 'en',
          timezone: 'UTC',
          currency: 'USD',
          theme: 'light',
          notifications: { email: true, push: true, marketing: false },
          privacySettings: { profileVisibility: 'public', tripVisibility: 'friends', locationSharing: false }
        });
        await user.save();
        console.log(`✅ User ${userData.name} created`);
      }
    }

    // Create cities if not exist
    const cities = [
      {
        name: 'Paris',
        country: 'France',
        region: 'Île-de-France',
        costIndex: 75,
        popularity: 95,
        image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52',
        description: 'The City of Light, known for its art, fashion, gastronomy and culture.'
      },
      {
        name: 'Tokyo',
        country: 'Japan',
        region: 'Kanto',
        costIndex: 80,
        popularity: 90,
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        description: 'A bustling metropolis that seamlessly blends the ultramodern with the traditional.'
      },
      {
        name: 'New York',
        country: 'USA',
        region: 'New York',
        costIndex: 85,
        popularity: 88,
        image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
        description: 'The Big Apple, a global center of culture, finance, and entertainment.'
      },
      {
        name: 'Barcelona',
        country: 'Spain',
        region: 'Catalonia',
        costIndex: 70,
        popularity: 85,
        image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
        description: 'A vibrant city known for its art and architecture, Mediterranean climate and beaches.'
      },
      {
        name: 'Bangkok',
        country: 'Thailand',
        region: 'Central Thailand',
        costIndex: 60,
        popularity: 82,
        image: 'https://images.unsplash.com/photo-1508009603885-50cf7c079365',
        description: 'A large city known for ornate shrines and vibrant street life.'
      }
    ];

    for (const cityData of cities) {
      let city = await City.findOne({ name: cityData.name, country: cityData.country });
      if (!city) {
        city = new City(cityData);
        await city.save();
        console.log(`✅ City ${cityData.name} created`);
      }
    }

    // Create trips if not exist
    const users = await User.find({ role: 'user' }).limit(3);
    if (users.length > 0) {
      const trips = [
        {
          name: 'Paris Adventure',
          description: 'Exploring the city of lights and all its cultural treasures',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-07'),
          coverPhoto: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52',
          status: 'planning',
          user: users[0]._id,
          isPublic: true,
          tags: ['culture', 'art', 'food'],
          budget: { amount: 2500, currency: 'USD' },
          location: {
            city: 'Paris',
            country: 'France',
            coordinates: { lat: 48.8566, lng: 2.3522 }
          }
        },
        {
          name: 'Tokyo Exploration',
          description: 'Discovering the blend of traditional and modern Japan',
          startDate: new Date('2024-07-15'),
          endDate: new Date('2024-07-22'),
          coverPhoto: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
          status: 'active',
          user: users[1] ? users[1]._id : users[0]._id,
          isPublic: true,
          tags: ['technology', 'culture', 'food'],
          budget: { amount: 3000, currency: 'USD' },
          location: {
            city: 'Tokyo',
            country: 'Japan',
            coordinates: { lat: 35.6762, lng: 139.6503 }
          }
        },
        {
          name: 'Barcelona Beach Trip',
          description: 'Relaxing on the Mediterranean coast with great food and architecture',
          startDate: new Date('2024-08-10'),
          endDate: new Date('2024-08-17'),
          coverPhoto: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
          status: 'planning',
          user: users[2] ? users[2]._id : users[0]._id,
          isPublic: false,
          tags: ['beach', 'architecture', 'food'],
          budget: { amount: 1800, currency: 'EUR' },
          location: {
            city: 'Barcelona',
            country: 'Spain',
            coordinates: { lat: 41.3851, lng: 2.1734 }
          }
        }
      ];

      for (const tripData of trips) {
        let trip = await Trip.findOne({ name: tripData.name, user: tripData.user });
        if (!trip) {
          trip = new Trip(tripData);
          await trip.save();
          console.log(`✅ Trip ${tripData.name} created`);
        }
      }
    }

    console.log('\n✅ Sample data added successfully!');
    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@globe.com / admin123456');
    console.log('Users: john@example.com / password123');
    console.log('Users: jane@example.com / password123');
    console.log('Users: mike@example.com / password123');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

addSampleData();
