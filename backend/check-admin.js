const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

async function checkAndCreateAdmin() {
  console.log('🔍 Checking Admin User...\n');
  
  const sequelize = new Sequelize('postgresql://postgres:password@localhost:5432/ethiopian-tutorial-app', {
    dialect: 'postgres',
    logging: false
  });
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');
    
    // Check if admin user exists
    const [users] = await sequelize.query('SELECT * FROM users WHERE email = ?', {
      replacements: ['admin@ethiopiantutorial.com']
    });
    
    if (users.length > 0) {
      console.log('✅ Admin user exists:', users[0]);
      console.log('   Email:', users[0].email);
      console.log('   Role:', users[0].role);
      console.log('   Status:', users[0].status);
    } else {
      console.log('❌ Admin user not found, creating...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin123!', 12);
      
      const [newUser] = await sequelize.query(`
        INSERT INTO users (id, name, email, password, role, status, bio, created_at, updated_at)
        VALUES (gen_random_uuid(), ?, ?, ?, ?, ?, ?, NOW(), NOW())
        RETURNING *
      `, {
        replacements: [
          'Admin User',
          'admin@ethiopiantutorial.com',
          hashedPassword,
          'admin',
          'active',
          'System administrator for the Ethiopian Tutorial Platform'
        ]
      });
      
      console.log('✅ Admin user created:', newUser[0]);
    }
    
    // Test login
    console.log('\n🔐 Testing Login...');
    const [testUsers] = await sequelize.query('SELECT * FROM users WHERE email = ?', {
      replacements: ['admin@ethiopiantutorial.com']
    });
    
    if (testUsers.length > 0) {
      const user = testUsers[0];
      const passwordMatch = await bcrypt.compare('Admin123!', user.password);
      
      if (passwordMatch) {
        console.log('✅ Password verification successful');
      } else {
        console.log('❌ Password verification failed');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkAndCreateAdmin();
