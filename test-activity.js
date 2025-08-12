const fetch = require('node-fetch');

async function testSaveActivity() {
  try {
    console.log('🧪 Testing save-activity endpoint...');
    
    const testData = {
      cityName: 'Paris',
      cityCountry: 'France',
      activity: {
        id: 'test-activity-123',
        name: 'Eiffel Tower Visit',
        city: 'Paris',
        category: 'Sightseeing',
        cost: 'High',
        duration: '1–3 hrs',
        rating: 4.8,
        img: 'https://example.com/eiffel.jpg',
        description: 'Visit the iconic Eiffel Tower',
        tags: ['landmark', 'view']
      }
    };
    
    console.log('📤 Sending test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/trips/save-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the validation
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('📥 Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSaveActivity();
