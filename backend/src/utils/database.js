const { connectDB: sequelizeConnectDB, disconnectDB: sequelizeDisconnectDB } = require('../config/database');

// Connect to database
const connectDB = async () => {
  try {
    const sequelize = await sequelizeConnectDB();
    console.log('PostgreSQL database connected successfully');
    return sequelize;
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Disconnect from database
const disconnectDB = async () => {
  try {
    await sequelizeDisconnectDB();
    console.log('PostgreSQL database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  try {
    await disconnectDB();
    console.log('PostgreSQL connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Database health check
const healthCheck = async () => {
  try {
    const { sequelize } = require('../config/database');
    await sequelize.authenticate();
    return {
      status: 'connected',
      dialect: 'postgresql',
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Create indexes for better performance
const createIndexes = async () => {
  try {
    // Sequelize automatically creates indexes based on model definitions
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error.message);
  }
};

// Seed initial data
const seedData = async () => {
  try {
    const Category = require('../models/Category');
    const User = require('../models/User');
    
    // Check if data already exists
    const categoryCount = await Category.count();
    const userCount = await User.count();
    
    if (categoryCount > 0 && userCount > 0) {
      console.log('Database already seeded');
      return;
    }
    
    // Seed categories
    const categories = [
      {
        name: 'Language',
        description: 'Learn Ethiopian languages including Amharic, Tigrinya, and more',
        color: '#3B82F6'
      },
      {
        name: 'Culture',
        description: 'Explore Ethiopian culture, traditions, and customs',
        color: '#10B981'
      },
      {
        name: 'History',
        description: 'Discover Ethiopian history and historical events',
        color: '#F59E0B'
      },
      {
        name: 'Cooking',
        description: 'Learn to cook traditional Ethiopian dishes',
        color: '#EF4444'
      },
      {
        name: 'Music',
        description: 'Study Ethiopian music, instruments, and compositions',
        color: '#8B5CF6'
      },
      {
        name: 'Art',
        description: 'Explore Ethiopian art, crafts, and visual traditions',
        color: '#EC4899'
      }
    ];
    
    await Category.bulkCreate(categories);
    console.log('Categories seeded successfully');
    
    // Seed admin user if no users exist
    if (userCount === 0) {
      await User.create({
        name: 'Admin User',
        email: 'admin@ethiopiantutorial.com',
        password: 'Admin123!',
        role: 'admin',
        status: 'active',
        bio: 'System administrator for the Ethiopian Tutorial Platform'
      });
      console.log('Admin user created successfully');
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Clear database (for testing)
const clearDatabase = async () => {
  try {
    const config = require('../../config/config');
    if (config.nodeEnv === 'production') {
      throw new Error('Cannot clear database in production');
    }
    
    const { sequelize } = require('../config/database');
    await sequelize.sync({ force: true });
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error.message);
  }
};

// Get database statistics
const getStats = async () => {
  try {
    const { sequelize } = require('../config/database');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    
    return {
      tables: tables.length,
      dialect: 'postgresql',
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database
    };
  } catch (error) {
    console.error('Error getting database stats:', error.message);
    return null;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  gracefulShutdown,
  healthCheck,
  createIndexes,
  seedData,
  clearDatabase,
  getStats
};