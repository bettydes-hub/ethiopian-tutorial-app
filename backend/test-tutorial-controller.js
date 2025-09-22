const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5500/api';
let authToken = '';
let testTutorialId = '';
let testCategoryId = '';

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

async function testGetAllTutorials() {
  console.log('\n1️⃣ Testing getAllTutorials...');
  
  const result = await apiRequest('/tutorials');
  
  if (result.success) {
    console.log('✅ getAllTutorials successful');
    console.log(`   Found ${result.data.tutorials?.length || 0} tutorials`);
    return true;
  } else {
    console.log('❌ getAllTutorials failed:', result.data);
    return false;
  }
}

async function testGetTutorialById() {
  console.log('\n2️⃣ Testing getTutorialById...');
  
  // First get a tutorial ID from the list
  const tutorialsResult = await apiRequest('/tutorials');
  if (tutorialsResult.success && tutorialsResult.data.tutorials?.length > 0) {
    const tutorialId = tutorialsResult.data.tutorials[0].id;
    
    const result = await apiRequest(`/tutorials/${tutorialId}`);
    
    if (result.success) {
      console.log('✅ getTutorialById successful');
      console.log(`   Retrieved tutorial: ${result.data.tutorial?.title || 'N/A'}`);
      return true;
    } else {
      console.log('❌ getTutorialById failed:', result.data);
      return false;
    }
  } else {
    console.log('⚠️ Skipping - No tutorials available');
    return false;
  }
}

async function testCreateTutorial() {
  console.log('\n3️⃣ Testing createTutorial...');
  
  // First create a category if it doesn't exist
  const categoryResult = await apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Test Category',
      description: 'A test category for tutorial testing',
      color: '#ff6b6b',
      icon: 'TestIcon'
    })
  });
  
  if (categoryResult.success) {
    testCategoryId = categoryResult.data.category.id;
    console.log('   ✅ Test category created');
  } else {
    // Try to find existing category
    const categoriesResult = await apiRequest('/categories');
    if (categoriesResult.success && categoriesResult.data.categories?.length > 0) {
      testCategoryId = categoriesResult.data.categories[0].id;
      console.log('   ✅ Using existing category');
    } else {
      console.log('   ❌ No categories available');
      return false;
    }
  }
  
  const tutorialData = {
    title: 'Test Tutorial',
    description: 'A test tutorial for testing purposes',
    longDescription: 'This is a detailed description of the test tutorial',
    category: 'Test Category',
    difficulty: 'beginner',
    duration: '30 minutes',
    videoUrl: 'https://example.com/video.mp4',
    pdfUrl: 'https://example.com/pdf.pdf',
    thumbnail: 'https://example.com/thumbnail.jpg',
    tags: ['test', 'tutorial', 'learning'],
    prerequisites: ['Basic knowledge'],
    learningObjectives: ['Learn testing', 'Understand concepts']
  };
  
  const result = await apiRequest('/tutorials', {
    method: 'POST',
    body: JSON.stringify(tutorialData)
  });
  
  if (result.success) {
    testTutorialId = result.data.tutorial.id;
    console.log('✅ createTutorial successful');
    console.log(`   Created tutorial with ID: ${testTutorialId}`);
    return true;
  } else {
    console.log('❌ createTutorial failed:', result.data);
    return false;
  }
}

async function testUpdateTutorial() {
  console.log('\n4️⃣ Testing updateTutorial...');
  
  if (!testTutorialId) {
    console.log('⚠️ Skipping - No test tutorial ID available');
    return false;
  }
  
  const updateData = {
    title: 'Updated Test Tutorial',
    description: 'Updated description for testing',
    difficulty: 'intermediate'
  };
  
  const result = await apiRequest(`/tutorials/${testTutorialId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData)
  });
  
  if (result.success) {
    console.log('✅ updateTutorial successful');
    console.log(`   Updated tutorial: ${result.data.tutorial.title}`);
    return true;
  } else {
    console.log('❌ updateTutorial failed:', result.data);
    return false;
  }
}

async function testGetTutorialsByCategory() {
  console.log('\n5️⃣ Testing getTutorialsByCategory...');
  
  const result = await apiRequest('/tutorials/category/Test Category');
  
  if (result.success) {
    console.log('✅ getTutorialsByCategory successful');
    console.log(`   Found ${result.data.tutorials?.length || 0} tutorials in category`);
    return true;
  } else {
    console.log('❌ getTutorialsByCategory failed:', result.data);
    return false;
  }
}

async function testUpdateProgress() {
  console.log('\n6️⃣ Testing updateProgress...');
  
  if (!testTutorialId) {
    console.log('⚠️ Skipping - No test tutorial ID available');
    return false;
  }
  
  const progressData = {
    progress: 50,
    status: 'in_progress',
    currentSection: 2
  };
  
  const result = await apiRequest(`/tutorials/${testTutorialId}/progress`, {
    method: 'POST',
    body: JSON.stringify(progressData)
  });
  
  if (result.success) {
    console.log('✅ updateProgress successful');
    console.log(`   Progress updated: ${result.data.progress.progress_percentage}%`);
    return true;
  } else {
    console.log('❌ updateProgress failed:', result.data);
    return false;
  }
}

async function testGetUserProgress() {
  console.log('\n7️⃣ Testing getUserProgress...');
  
  if (!testTutorialId) {
    console.log('⚠️ Skipping - No test tutorial ID available');
    return false;
  }
  
  const result = await apiRequest(`/tutorials/${testTutorialId}/progress`);
  
  if (result.success) {
    console.log('✅ getUserProgress successful');
    console.log(`   Progress: ${result.data.progress.progress_percentage || 0}%`);
    return true;
  } else {
    console.log('❌ getUserProgress failed:', result.data);
    return false;
  }
}

async function testGetAllUserProgress() {
  console.log('\n8️⃣ Testing getAllUserProgress...');
  
  const result = await apiRequest('/tutorials/progress');
  
  if (result.success) {
    console.log('✅ getAllUserProgress successful');
    console.log(`   Found ${result.data.progress?.length || 0} progress records`);
    return true;
  } else {
    console.log('❌ getAllUserProgress failed:', result.data);
    return false;
  }
}

async function testTogglePublishStatus() {
  console.log('\n9️⃣ Testing togglePublishStatus...');
  
  if (!testTutorialId) {
    console.log('⚠️ Skipping - No test tutorial ID available');
    return false;
  }
  
  const result = await apiRequest(`/tutorials/${testTutorialId}/toggle-publish`, {
    method: 'PATCH'
  });
  
  if (result.success) {
    console.log('✅ togglePublishStatus successful');
    console.log(`   Tutorial ${result.data.tutorial.is_published ? 'published' : 'unpublished'}`);
    return true;
  } else {
    console.log('❌ togglePublishStatus failed:', result.data);
    return false;
  }
}

async function testAddRating() {
  console.log('\n🔟 Testing addRating...');
  
  if (!testTutorialId) {
    console.log('⚠️ Skipping - No test tutorial ID available');
    return false;
  }
  
  const ratingData = {
    rating: 4
  };
  
  const result = await apiRequest(`/tutorials/${testTutorialId}/rating`, {
    method: 'POST',
    body: JSON.stringify(ratingData)
  });
  
  if (result.success) {
    console.log('✅ addRating successful');
    console.log(`   Rating: ${result.data.tutorial.rating} (${result.data.tutorial.rating_count} votes)`);
    return true;
  } else {
    console.log('❌ addRating failed:', result.data);
    return false;
  }
}

async function testDeleteTutorial() {
  console.log('\n1️⃣1️⃣ Testing deleteTutorial...');
  
  if (!testTutorialId) {
    console.log('⚠️ Skipping - No test tutorial ID available');
    return false;
  }
  
  const result = await apiRequest(`/tutorials/${testTutorialId}`, {
    method: 'DELETE'
  });
  
  if (result.success) {
    console.log('✅ deleteTutorial successful');
    testTutorialId = ''; // Clear the test tutorial ID
    return true;
  } else {
    console.log('❌ deleteTutorial failed:', result.data);
    return false;
  }
}

async function testErrorCases() {
  console.log('\n🚨 Testing Error Cases...');
  
  // Test getting non-existent tutorial
  console.log('   Testing get non-existent tutorial...');
  const result1 = await apiRequest('/tutorials/non-existent-id');
  if (result1.status === 404) {
    console.log('   ✅ Correctly returned 404 for non-existent tutorial');
  } else {
    console.log('   ❌ Expected 404, got:', result1.status);
  }
  
  // Test invalid rating
  console.log('   Testing invalid rating...');
  const result2 = await apiRequest('/tutorials/test-id/rating', {
    method: 'POST',
    body: JSON.stringify({ rating: 10 })
  });
  if (result2.status === 400) {
    console.log('   ✅ Correctly returned 400 for invalid rating');
  } else {
    console.log('   ❌ Expected 400, got:', result2.status);
  }
  
  // Test unauthorized access
  console.log('   Testing unauthorized access...');
  const oldToken = authToken;
  authToken = ''; // Clear token
  const result3 = await apiRequest('/tutorials');
  if (result3.status === 401) {
    console.log('   ✅ Correctly returned 401 for unauthorized access');
  } else {
    console.log('   ❌ Expected 401, got:', result3.status);
  }
  authToken = oldToken; // Restore token
}

// Main test runner
async function runAllTests() {
  console.log('🧪 Testing All TutorialController Functions\n');
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
    results.push(await testGetAllTutorials());
    results.push(await testGetTutorialById());
    results.push(await testCreateTutorial());
    results.push(await testUpdateTutorial());
    results.push(await testGetTutorialsByCategory());
    results.push(await testUpdateProgress());
    results.push(await testGetUserProgress());
    results.push(await testGetAllUserProgress());
    results.push(await testTogglePublishStatus());
    results.push(await testAddRating());
    results.push(await testDeleteTutorial());
    
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
      console.log('\n🎉 All TutorialController functions are working correctly!');
    } else {
      console.log('\n⚠️ Some tests failed. Check the output above for details.');
    }
    
  } catch (error) {
    console.error('\n❌ Test runner error:', error.message);
  }
}

// Run the tests
runAllTests();
