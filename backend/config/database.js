const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Wait for MongoDB to be available
    let retries = 5;
    while (retries > 0) {
      try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
          console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('⚠️ MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
          await mongoose.connection.close();
          console.log('🔄 MongoDB connection closed through app termination');
          process.exit(0);
        });

        return; // Success, exit the function
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw error;
        }
        console.log(`⏳ MongoDB connection failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }
  } catch (error) {
    console.error('❌ Database connection failed after all retries:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Make sure MongoDB is running: net start MongoDB');
    console.log('2. Check if MongoDB is installed');
    console.log('3. Verify MongoDB is listening on port 27017');
    console.log('4. Try: mongod (if MongoDB is installed locally)');
    process.exit(1);
  }
};

module.exports = connectDB; 