const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5500/api';
let authToken = '';
let testUserId = '';
let testUserEmail = 'testuser@example.com';

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.text();
  
  try {
    return {
      status: response.status,
      data: JSON.parse(data),
      success: response.ok
    };
  } catch (error) {
    return {
      status: response.status,
      data: data,
      success: response.ok
    };
  }
}

// Test functions
async function testLogin() {
  console.log('🔐 Testing Login...');
  
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@ethiopiantutorial.com',
      password: 'Admin123!'
    })
  });
  
  if (result.success) {
    authToken = result.data.token;
    console.log('✅ Login successful - Token received');
    return true;
  } else {
    console.log('❌ Login failed:', result.data);
    return false;
  }
}

async function testGetAllUsers() {
  console.log('\n1️⃣ Testing getAllUsers...');
  
  const result = await apiRequest('/users');
  
  if (result.success) {
    console.log('✅ getAllUsers successful');
    console.log(`   Found ${result.data.users?.length || 0} users`);
    return true;
  } else {
    console.log('❌ getAllUsers failed:', result.data);
    return false;
  }
}

async function testCreateUser() {
  console.log('\n2️⃣ Testing createUser...');
  
  const userData = {
    name: 'Test User',
    email: testUserEmail,
    password: 'TestPassword123!',
    role: 'student',
    status: 'active'
  };
  
  const result = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  if (result.success) {
    testUserId = result.data.user.id;
    console.log('✅ createUser successful');
    console.log(`   Created user with ID: ${testUserId}`);
    return true;
  } else {
    console.log('❌ createUser failed:', result.data);
    return false;
  }
}

async function testGetUserById() {
  console.log('\n3️⃣ Testing getUserById...');
  
  if (!testUserId) {
    console.log('⚠️ Skipping - No test user ID available');
    return false;
  }
  
  const result = await apiRequest(`/users/${testUserId}`);
  
  if (result.success) {
    console.log('✅ getUserById successful');
    console.log(`   Retrieved user: ${result.data.user.name}`);
    return true;
  } else {
    console.log('❌ getUserById failed:', result.data);
    return false;
  }
}

async function testUpdateUser() {
  console.log('\n4️⃣ Testing updateUser...');
  
  if (!testUserId) {
    console.log('⚠️ Skipping - No test user ID available');
    return false;
  }
  
  const updateData = {
    name: 'Updated Test User',
    bio: 'This is an updated bio for testing'
  };
  
  const result = await apiRequest(`/users/${testUserId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  
  if (result.success) {
    console.log('✅ updateUser successful');
    console.log(`   Updated user: ${result.data.user.name}`);
    return true;
  } else {
    console.log('❌ updateUser failed:', result.data);
    return false;
  }
}

async function testBlockUser() {
  console.log('\n5️⃣ Testing blockUser...');
  
  if (!testUserId) {
    console.log('⚠️ Skipping - No test user ID available');
    return false;
  }
  
  const result = await apiRequest(`/users/${testUserId}/block`, {
    method: 'PATCH'
  });
  
  if (result.success) {
    console.log('✅ blockUser successful');
    return true;
  } else {
    console.log('❌ blockUser failed:', result.data);
    return false;
  }
}

async function testUnblockUser() {
  console.log('\n6️⃣ Testing unblockUser...');
  
  if (!testUserId) {
    console.log('⚠️ Skipping - No test user ID available');
    return false;
  }
  
  const result = await apiRequest(`/users/${testUserId}/unblock`, {
    method: 'PATCH'
  });
  
  if (result.success) {
    console.log('✅ unblockUser successful');
    return true;
  } else {
    console.log('❌ unblockUser failed:', result.data);
    return false;
  }
}

async function testCreateTeacher() {
  console.log('\n7️⃣ Testing createUser (Teacher)...');
  
  const teacherData = {
    name: 'Test Teacher',
    email: 'testteacher@example.com',
    password: 'TeacherPassword123!',
    role: 'teacher',
    status: 'pending'
  };
  
  const result = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(teacherData)
  });
  
  if (result.success) {
    const teacherId = result.data.user.id;
    console.log('✅ createUser (Teacher) successful');
    console.log(`   Created teacher with ID: ${teacherId}`);
    
    // Test approve teacher
    console.log('\n8️⃣ Testing approveTeacher...');
    const approveResult = await apiRequest(`/users/${teacherId}/approve`, {
      method: 'PATCH'
    });
    
    if (approveResult.success) {
      console.log('✅ approveTeacher successful');
    } else {
      console.log('❌ approveTeacher failed:', approveResult.data);
    }
    
    return true;
  } else {
    console.log('❌ createUser (Teacher) failed:', result.data);
    return false;
  }
}

async function testGetUserStats() {
  console.log('\n9️⃣ Testing getUserStats...');
  
  if (!testUserId) {
    console.log('⚠️ Skipping - No test user ID available');
    return false;
  }
  
  const result = await apiRequest(`/users/${testUserId}/stats`);
  
  if (result.success) {
    console.log('✅ getUserStats successful');
    console.log(`   Stats: ${JSON.stringify(result.data.stats, null, 2)}`);
    return true;
  } else {
    console.log('❌ getUserStats failed:', result.data);
    return false;
  }
}

async function testGetUserTutorials() {
  console.log('\n🔟 Testing getUserTutorials...');
  
  if (!testUserId) {
    console.log('⚠️ Skipping - No test user ID available');
    return false;
  }
  
  const result = await apiRequest(`/users/${testUserId}/tutorials`);
  
  if (result.success) {
    console.log('✅ getUserTutorials successful');
    console.log(`   Found ${result.data.tutorials?.length || 0} tutorials`);
    return true;
  } else {
    console.log('❌ getUserTutorials failed:', result.data);
    return false;
  }
}

async function testGetUserCreatedTutorials() {
  console.log('\n1️⃣1️⃣ Testing getUserCreatedTutorials...');
  
  // First get a teacher user
  const usersResult = await apiRequest('/users?role=teacher');
  if (usersResult.success && usersResult.data.users?.length > 0) {
    const teacherId = usersResult.data.users[0].id;
    
    const result = await apiRequest(`/users/${teacherId}/created-tutorials`);
    
    if (result.success) {
      console.log('✅ getUserCreatedTutorials successful');
      console.log(`   Found ${result.data.tutorials?.length || 0} created tutorials`);
      return true;
    } else {
      console.log('❌ getUserCreatedTutorials failed:', result.data);
      return false;
    }
  } else {
    console.log('⚠️ Skipping - No teacher users found');
    return false;
  }
}

async function testDeleteUser() {
  console.log('\n1️⃣2️⃣ Testing deleteUser...');
  
  if (!testUserId) {
    console.log('⚠️ Skipping - No test user ID available');
    return false;
  }
  
  const result = await apiRequest(`/users/${testUserId}`, {
    method: 'DELETE'
  });
  
  if (result.success) {
    console.log('✅ deleteUser successful');
    testUserId = ''; // Clear the test user ID
    return true;
  } else {
    console.log('❌ deleteUser failed:', result.data);
    return false;
  }
}

async function testErrorCases() {
  console.log('\n🚨 Testing Error Cases...');
  
  // Test getting non-existent user
  console.log('   Testing get non-existent user...');
  const result1 = await apiRequest('/users/non-existent-id');
  if (result1.status === 404) {
    console.log('   ✅ Correctly returned 404 for non-existent user');
  } else {
    console.log('   ❌ Expected 404, got:', result1.status);
  }
  
  // Test creating user with existing email
  console.log('   Testing create user with existing email...');
  const result2 = await apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Duplicate User',
      email: 'admin@ethiopiantutorial.com', // This email already exists
      password: 'Password123!',
      role: 'student'
    })
  });
  if (result2.status === 400) {
    console.log('   ✅ Correctly returned 400 for duplicate email');
  } else {
    console.log('   ❌ Expected 400, got:', result2.status);
  }
  
  // Test unauthorized access
  console.log('   Testing unauthorized access...');
  const oldToken = authToken;
  authToken = ''; // Clear token
  const result3 = await apiRequest('/users');
  if (result3.status === 401) {
    console.log('   ✅ Correctly returned 401 for unauthorized access');
  } else {
    console.log('   ❌ Expected 401, got:', result3.status);
  }
  authToken = oldToken; // Restore token
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Testing All UserController Functions\n');
  console.log('=' .repeat(60));
  
  const results = [];
  
  try {
    // Test login first
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      console.log('\n❌ Cannot proceed without authentication');
      return;
    }
    
    // Run all tests
    results.push(await testGetAllUsers());
    results.push(await testCreateUser());
    results.push(await testGetUserById());
    results.push(await testUpdateUser());
    results.push(await testBlockUser());
    results.push(await testUnblockUser());
    results.push(await testCreateTeacher());
    results.push(await testGetUserStats());
    results.push(await testGetUserTutorials());
    results.push(await testGetUserCreatedTutorials());
    results.push(await testDeleteUser());
    
    // Test error cases
    await testErrorCases();
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('=' .repeat(60));
    const passed = results.filter(r => r).length;
    const total = results.length;
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    
    if (passed === total) {
      console.log('\n🎉 All UserController functions are working correctly!');
    } else {
      console.log('\n⚠️ Some tests failed. Check the output above for details.');
    }
    
  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
  }
}

// Run the tests
runAllTests();
