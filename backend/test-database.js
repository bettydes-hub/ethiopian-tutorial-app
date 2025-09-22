const { connectDB, disconnectDB, healthCheck, seedData } = require('./src/utils/database');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Tutorial = require('./src/models/Tutorial');

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection...\n');
  
  try {
    // Test 1: Connect to database
    console.log('1️⃣ Testing database connection...');
    const sequelize = await connectDB();
    console.log('✅ Database connected successfully\n');
    
    // Test 2: Health check
    console.log('2️⃣ Testing health check...');
    const health = await healthCheck();
    console.log('✅ Health check:', health);
    console.log('');
    
    // Test 3: Test User model
    console.log('3️⃣ Testing User model...');
    const userCount = await User.count();
    console.log(`✅ User model working - Total users: ${userCount}\n`);
    
    // Test 4: Test Category model
    console.log('4️⃣ Testing Category model...');
    const categoryCount = await Category.count();
    console.log(`✅ Category model working - Total categories: ${categoryCount}\n`);
    
    // Test 5: Test Tutorial model
    console.log('5️⃣ Testing Tutorial model...');
    const tutorialCount = await Tutorial.count();
    console.log(`✅ Tutorial model working - Total tutorials: ${tutorialCount}\n`);
    
    // Test 6: Test creating a test user
    console.log('6️⃣ Testing user creation...');
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      role: 'student'
    });
    console.log('✅ Test user created:', testUser.toJSON());
    
    // Clean up test user
    await testUser.destroy();
    console.log('✅ Test user cleaned up\n');
    
    // Test 7: Test seeding data
    console.log('7️⃣ Testing data seeding...');
    await seedData();
    console.log('✅ Data seeding completed\n');
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await disconnectDB();
    console.log('🔌 Database disconnected');
  }
}

// Run the test
testDatabaseConnection();
