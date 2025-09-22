#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Ethiopian Tutorial App - Connection Tests');
console.log('=' .repeat(50));

async function runTest(testName, testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Running ${testName}...`);
    console.log('-'.repeat(30));
    
    const testProcess = spawn('node', [testFile], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testName} completed successfully`);
        resolve(true);
      } else {
        console.log(`❌ ${testName} failed with code ${code}`);
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      console.log(`❌ ${testName} error:`, error.message);
      resolve(false);
    });
  });
}

async function runAllTests() {
  const tests = [
    {
      name: 'Database Connection Test',
      file: './backend/test-database.js',
      required: true
    },
    {
      name: 'Backend API Test',
      file: './backend/test-api.js',
      required: true
    },
    {
      name: 'Integration Test',
      file: './test-integration.js',
      required: false
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await runTest(test.name, test.file);
    results.push({ name: test.name, success, required: test.required });
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('=' .repeat(50));
  
  let allRequiredPassed = true;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const required = result.required ? ' (Required)' : ' (Optional)';
    console.log(`${status} ${result.name}${required}`);
    
    if (result.required && !result.success) {
      allRequiredPassed = false;
    }
  });
  
  console.log('\n' + '=' .repeat(50));
  
  if (allRequiredPassed) {
    console.log('🎉 All required tests passed!');
    console.log('🚀 Your application is ready to run!');
    console.log('\n📋 Next Steps:');
    console.log('1. Start Backend: cd backend && npm run dev');
    console.log('2. Start Frontend: cd frontend && npm start');
    console.log('3. Open: http://localhost:5000');
  } else {
    console.log('❌ Some required tests failed!');
    console.log('🔧 Please fix the issues before running the application.');
  }
}

// Run all tests
runAllTests().catch(console.error);
