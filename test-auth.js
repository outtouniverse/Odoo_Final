const http = require('http');

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

const testLogin = {
  email: 'test@example.com',
  password: 'password123'
};

// Helper function to make HTTP requests
function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/auth${endpoint}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testSignup() {
  console.log('\n🔐 Testing Signup...');
  try {
    const response = await makeRequest('POST', '/signup', testUser);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.data?.accessToken;
  } catch (error) {
    console.error('Signup error:', error.message);
    return null;
  }
}

async function testLogin() {
  console.log('\n🔑 Testing Login...');
  try {
    const response = await makeRequest('POST', '/login', testLogin);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.data?.accessToken;
  } catch (error) {
    console.error('Login error:', error.message);
    return null;
  }
}

async function testForgotPassword() {
  console.log('\n📧 Testing Forgot Password...');
  try {
    const response = await makeRequest('POST', '/forgot-password', { email: testUser.email });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.data?.resetToken;
  } catch (error) {
    console.error('Forgot password error:', error.message);
    return null;
  }
}

async function testResetPassword(token) {
  console.log('\n🔄 Testing Reset Password...');
  try {
    const response = await makeRequest('POST', '/reset-password', {
      token: token,
      password: 'newpassword123'
    });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Reset password error:', error.message);
  }
}

async function testGetMe(accessToken) {
  console.log('\n👤 Testing Get Current User...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(response, null, 2));
        } catch (error) {
          console.log('Status:', res.statusCode);
          console.log('Response:', body);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Get me error:', error.message);
    });

    req.end();
  } catch (error) {
    console.error('Get me error:', error.message);
  }
}

async function testRefreshToken(refreshToken) {
  console.log('\n🔄 Testing Refresh Token...');
  try {
    const response = await makeRequest('POST', '/refresh', { refreshToken });
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Refresh token error:', error.message);
  }
}

async function testLogout(accessToken, refreshToken) {
  console.log('\n🚪 Testing Logout...');
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(response, null, 2));
        } catch (error) {
          console.log('Status:', res.statusCode);
          console.log('Response:', body);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Logout error:', error.message);
    });

    req.write(JSON.stringify({ refreshToken }));
    req.end();
  } catch (error) {
    console.error('Logout error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Authentication API Tests...\n');
  
  // Test signup
  const accessToken = await testSignup();
  
  // Test login
  const loginToken = await testLogin();
  
  // Test forgot password
  const resetToken = await testForgotPassword();
  
  // Test reset password
  if (resetToken) {
    await testResetPassword(resetToken);
  }
  
  // Test get current user
  if (accessToken) {
    await testGetMe(accessToken);
  }
  
  // Test refresh token (you'll need to get this from login response)
  // await testRefreshToken(refreshToken);
  
  // Test logout
  if (accessToken) {
    await testLogout(accessToken, 'refresh_token_here');
  }
  
  console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  makeRequest,
  testSignup,
  testLogin,
  testForgotPassword,
  testResetPassword,
  testGetMe,
  testRefreshToken,
  testLogout
};
