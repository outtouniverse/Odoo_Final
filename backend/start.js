const http = require('http');

console.log('🚀 Testing Authentication API...\n');

// Test signup
const signupData = JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
});

const signupOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(signupData)
  }
};

console.log('🔐 Testing Signup...');
const signupReq = http.request(signupOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const response = JSON.parse(body);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (response.success && response.data?.accessToken) {
        console.log('✅ Signup successful! Access token received.');
        
        // Test login
        testLogin();
      } else {
        console.log('❌ Signup failed or no access token received.');
      }
    } catch (error) {
      console.log('Raw response:', body);
    }
  });
});

signupReq.on('error', (error) => {
  console.error('❌ Signup request failed:', error.message);
});

signupReq.write(signupData);
signupReq.end();

function testLogin() {
  console.log('\n🔑 Testing Login...');
  
  const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(body);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data?.accessToken) {
          console.log('✅ Login successful!');
          
          // Test protected route
          testProtectedRoute(response.data.accessToken);
        } else {
          console.log('❌ Login failed.');
        }
      } catch (error) {
        console.log('Raw response:', body);
      }
    });
  });

  loginReq.on('error', (error) => {
    console.error('❌ Login request failed:', error.message);
  });

  loginReq.write(loginData);
  loginReq.end();
}

function testProtectedRoute(accessToken) {
  console.log('\n👤 Testing Protected Route...');
  
  const meOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  };

  const meReq = http.request(meOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      try {
        const response = JSON.parse(body);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (response.success) {
          console.log('✅ Protected route access successful!');
        } else {
          console.log('❌ Protected route access failed.');
        }
      } catch (error) {
        console.log('Raw response:', body);
      }
      
      console.log('\n🎉 All tests completed!');
    });
  });

  meReq.on('error', (error) => {
    console.error('❌ Protected route request failed:', error.message);
  });

  meReq.end();
}
