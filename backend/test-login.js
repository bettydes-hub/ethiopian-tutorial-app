const fetch = require('node-fetch');

async function testLogin() {
  console.log('🔐 Testing Login API...\n');
  
  try {
    const response = await fetch('http://localhost:5500/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ethiopiantutorial.com',
        password: 'Admin123!'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.text();
    console.log('Response:', data);
    
    if (response.ok) {
      const jsonData = JSON.parse(data);
      console.log('✅ Login successful!');
      console.log('Token:', jsonData.token ? 'Present' : 'Missing');
      console.log('User:', jsonData.user ? jsonData.user.name : 'Missing');
    } else {
      console.log('❌ Login failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLogin();
