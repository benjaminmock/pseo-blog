const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('🔐 Testing authentication endpoint...');
    
    const response = await fetch('http://localhost:3000/api/test/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test-teacher@example.com',
        password: 'testpassword123'
      })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('📄 Response body:', data);
    
    if (response.ok) {
      console.log('✅ Authentication successful!');
    } else {
      console.log('❌ Authentication failed');
    }
    
  } catch (error) {
    console.error('💥 Error testing auth:', error);
  }
}

testAuth();