// Frontend Connection Test
// Run this in the browser console or as a Node.js script

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5500/api';

async function testFrontendConnection() {
  console.log('🧪 Testing Frontend to Backend Connection...\n');
  
  try {
    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend availability...');
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend is running:', healthData);
    } else {
      throw new Error(`Backend not responding: ${healthResponse.status}`);
    }
    console.log('');
    
    // Test 2: Test CORS
    console.log('2️⃣ Testing CORS configuration...');
    const corsResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS configured correctly');
    } else {
      console.log('⚠️ CORS might have issues');
    }
    console.log('');
    
    // Test 3: Test API endpoints
    console.log('3️⃣ Testing API endpoints...');
    
    // Test login endpoint
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });
    
    if (loginResponse.status === 400) {
      console.log('✅ Login endpoint working - Validation active');
    } else {
      console.log('⚠️ Login endpoint response:', loginResponse.status);
    }
    
    // Test register endpoint
    const registerResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    if (registerResponse.status === 400 || registerResponse.status === 201) {
      console.log('✅ Register endpoint working');
    } else {
      console.log('⚠️ Register endpoint response:', registerResponse.status);
    }
    
    console.log('');
    
    // Test 4: Test static file serving
    console.log('4️⃣ Testing static file serving...');
    const staticResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/uploads/images/test.jpg`);
    
    if (staticResponse.status === 404) {
      console.log('✅ Static file serving configured (404 expected for non-existent file)');
    } else {
      console.log('⚠️ Static file serving response:', staticResponse.status);
    }
    console.log('');
    
    console.log('🎉 Frontend connection tests completed!');
    
  } catch (error) {
    console.error('❌ Frontend connection test failed:', error.message);
    console.error('Make sure the backend is running on port 5500');
  }
}

// Export for use in browser or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testFrontendConnection;
} else {
  // Run in browser
  testFrontendConnection();
}
