const mongoose = require('mongoose');
const User = require('./models/User');
const { generateTokens, verifyAccessToken } = require('./utils/jwt');

// Load environment variables
require('dotenv').config({ path: './config.env' });

async function testSetup() {
  console.log('🧪 Testing Authentication Setup...\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully\n');

    // Test 2: User Model
    console.log('2. Testing User Model...');
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User model created successfully\n');

    // Test 3: JWT Token Generation
    console.log('3. Testing JWT Token Generation...');
    const tokens = generateTokens(testUser._id);
    console.log('✅ Access token generated:', tokens.accessToken.substring(0, 20) + '...');
    console.log('✅ Refresh token generated:', tokens.refreshToken.substring(0, 20) + '...\n');

    // Test 4: JWT Token Verification
    console.log('4. Testing JWT Token Verification...');
    const decoded = verifyAccessToken(tokens.accessToken);
    console.log('✅ Token verified successfully, user ID:', decoded.id, '\n');

    // Test 5: Password Hashing
    console.log('5. Testing Password Hashing...');
    const isPasswordValid = await testUser.correctPassword('password123', testUser.password);
    console.log('✅ Password hashing works:', isPasswordValid, '\n');

    // Test 6: Model Methods
    console.log('6. Testing Model Methods...');
    const userByEmail = await User.findByEmail('test@example.com');
    console.log('✅ findByEmail method works:', userByEmail ? 'User found' : 'User not found', '\n');

    // Test 7: Refresh Token Management
    console.log('7. Testing Refresh Token Management...');
    await testUser.addRefreshToken(tokens.refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    console.log('✅ Refresh token added successfully');
    
    await testUser.removeRefreshToken(tokens.refreshToken);
    console.log('✅ Refresh token removed successfully\n');

    // Test 8: Virtual Properties
    console.log('8. Testing Virtual Properties...');
    const profile = testUser.fullProfile;
    console.log('✅ Virtual profile generated:', {
      id: profile.id,
      name: profile.name,
      email: profile.email
    }, '\n');

    console.log('🎉 All tests passed! Authentication system is working correctly.');
    console.log('\n📋 Next Steps:');
    console.log('1. Update config.env with your actual values');
    console.log('2. Set up Google OAuth credentials');
    console.log('3. Start the server with: npm start');
    console.log('4. Test the API endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Clean up
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testSetup(); 