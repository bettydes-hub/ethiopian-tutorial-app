const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function debugLogin() {
  console.log('🔍 Debugging Login Process...\n');
  
  try {
    // Test 1: Find user
    console.log('1️⃣ Finding user...');
    const user = await User.findOne({ where: { email: 'admin@ethiopiantutorial.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    });
    
    // Test 2: Check password
    console.log('\n2️⃣ Checking password...');
    const passwordMatch = await user.comparePassword('Admin123!');
    console.log('Password match:', passwordMatch);
    
    // Test 3: Check status
    console.log('\n3️⃣ Checking status...');
    console.log('User status:', user.status);
    console.log('Status check:', user.status === 'active');
    
    // Test 4: Manual password check
    console.log('\n4️⃣ Manual password check...');
    const manualCheck = await bcrypt.compare('Admin123!', user.password);
    console.log('Manual password check:', manualCheck);
    
    // Test 5: Test updateLastLogin
    console.log('\n5️⃣ Testing updateLastLogin...');
    try {
      await user.updateLastLogin();
      console.log('✅ updateLastLogin successful');
    } catch (error) {
      console.log('❌ updateLastLogin failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugLogin();
