const axios = require('axios');

// Test the save-activity endpoint
async function testSaveActivity() {
  try {
    console.log('🧪 Testing save-activity endpoint...');
    
    // First, let's try to authenticate (you'll need to replace with a valid token)
    const token = process.env.TEST_TOKEN || 'your-test-token-here';
    
    if (token === 'your-test-token-here') {
      console.log('❌ Please set TEST_TOKEN environment variable with a valid JWT token');
      return;
    }
    
    const testData = {
      cityName: 'Test City',
      cityCountry: 'Test Country',
      activity: {
        id: 'test-activity-1',
        name: 'Test Activity',
        city: 'Test City',
        category: 'Sightseeing',
        cost: 'Medium',
        duration: '1–3 hrs',
        rating: 4.5,
        img: 'https://example.com/test.jpg',
        description: 'A test activity',
        tags: ['test', 'activity']
      }
    };
    
    console.log('📤 Sending test data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:3000/api/trips/save-activity', testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error testing save-activity:', error.response?.data || error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testSaveActivity();
