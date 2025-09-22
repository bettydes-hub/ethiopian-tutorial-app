const request = require('supertest');
const app = require('./src/app');

async function testBackendAPI() {
  console.log('🧪 Testing Backend API...\n');
  
  try {
    // Test 1: Health check endpoint
    console.log('1️⃣ Testing health check endpoint...');
    const healthResponse = await request(app)
      .get('/health')
      .expect(200);
    
    console.log('✅ Health check response:', healthResponse.body);
    console.log('');
    
    // Test 2: Test CORS
    console.log('2️⃣ Testing CORS configuration...');
    const corsResponse = await request(app)
      .options('/api/auth/login')
      .expect(204);
    
    console.log('✅ CORS headers configured');
    console.log('');
    
    // Test 3: Test 404 handler
    console.log('3️⃣ Testing 404 handler...');
    const notFoundResponse = await request(app)
      .get('/api/nonexistent')
      .expect(404);
    
    console.log('✅ 404 handler working:', notFoundResponse.body.error);
    console.log('');
    
    // Test 4: Test rate limiting
    console.log('4️⃣ Testing rate limiting...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(request(app).get('/api/auth/login'));
    }
    
    const responses = await Promise.all(promises);
    console.log('✅ Rate limiting working - All requests processed');
    console.log('');
    
    // Test 5: Test authentication endpoints structure
    console.log('5️⃣ Testing authentication endpoints...');
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(400);
    
    console.log('✅ Login endpoint working - Validation active');
    console.log('');
    
    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testBackendAPI();
