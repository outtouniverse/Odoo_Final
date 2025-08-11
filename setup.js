const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up Authentication System...\n');

// Generate secure secrets
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const sessionSecret = crypto.randomBytes(64).toString('hex');

// Read current config
const configPath = path.join(__dirname, 'config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
} else {
  configContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/odoo_final_db

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Session Configuration
SESSION_SECRET=${sessionSecret}

# CORS Configuration
FRONTEND_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;
}

// Update config with generated secrets
configContent = configContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`);
configContent = configContent.replace(/JWT_REFRESH_SECRET=.*/g, `JWT_REFRESH_SECRET=${jwtRefreshSecret}`);
configContent = configContent.replace(/SESSION_SECRET=.*/g, `SESSION_SECRET=${sessionSecret}`);

// Write updated config
fs.writeFileSync(configPath, configContent);

console.log('✅ Configuration updated with secure secrets');
console.log('✅ JWT secrets generated');
console.log('✅ Session secret generated\n');

console.log('📋 Setup Instructions:');
console.log('1. Make sure MongoDB is running on your system');
console.log('2. Update the following in config.env:');
console.log('   - MONGODB_URI (if using cloud MongoDB)');
console.log('   - GOOGLE_CLIENT_ID (from Google Cloud Console)');
console.log('   - GOOGLE_CLIENT_SECRET (from Google Cloud Console)');
console.log('   - FRONTEND_URL (your React app URL)');
console.log('\n3. To set up Google OAuth:');
console.log('   - Go to https://console.cloud.google.com/');
console.log('   - Create a new project or select existing');
console.log('   - Enable Google+ API');
console.log('   - Create OAuth 2.0 credentials');
console.log('   - Add redirect URI: http://localhost:3000/api/auth/google/callback');
console.log('\n4. Start the server:');
console.log('   npm start (production)');
console.log('   npm run dev (development)');
console.log('\n5. Test the setup:');
console.log('   node test-setup.js');
console.log('\n�� Setup complete!'); 