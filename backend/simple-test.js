const { Sequelize } = require('sequelize');

// Simple database connection test
async function testConnection() {
  console.log('🧪 Simple Database Connection Test\n');
  
  const sequelize = new Sequelize('postgresql://postgres:password@localhost:5432/ethiopian-tutorial-app', {
    dialect: 'postgres',
    logging: console.log
  });
  
  try {
    console.log('1️⃣ Attempting to connect to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connection successful!');
    
    console.log('\n2️⃣ Testing database creation...');
    await sequelize.query('CREATE DATABASE "ethiopian-tutorial-app"', { raw: true });
    console.log('✅ Database created or already exists');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Make sure PostgreSQL is running on port 5050');
      console.log('2. Check if PostgreSQL service is started');
      console.log('3. Verify the port number (should be 5050)');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Check if password is correct (should be "password")');
      console.log('2. Verify PostgreSQL user "postgres" exists');
    } else if (error.message.includes('database "ethiopian-tutorial-app" does not exist')) {
      console.log('\n🔧 Troubleshooting:');
      console.log('1. Database does not exist, will be created automatically');
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 Connection closed');
  }
}

testConnection();
