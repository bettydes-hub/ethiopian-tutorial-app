const mongoose = require('mongoose');
const config = require('../../config/config');

// Database connection options
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering
};

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.databaseUrl, dbOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Disconnect from database
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
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
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state] || 'unknown',
      readyState: state,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name
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
    const User = require('../models/User');
    const Tutorial = require('../models/Tutorial');
    const Quiz = require('../models/Quiz');
    const Question = require('../models/Question');
    const Category = require('../models/Category');
    const Progress = require('../models/Progress');
    const QuizAttempt = require('../models/QuizAttempt');
    
    // User indexes
    await User.createIndexes();
    
    // Tutorial indexes
    await Tutorial.createIndexes();
    
    // Quiz indexes
    await Quiz.createIndexes();
    
    // Question indexes
    await Question.createIndexes();
    
    // Category indexes
    await Category.createIndexes();
    
    // Progress indexes
    await Progress.createIndexes();
    
    // QuizAttempt indexes
    await QuizAttempt.createIndexes();
    
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
    const categoryCount = await Category.countDocuments();
    const userCount = await User.countDocuments();
    
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
    
    await Category.insertMany(categories);
    console.log('Categories seeded successfully');
    
    // Seed admin user if no users exist
    if (userCount === 0) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@ethiopiantutorial.com',
        password: 'Admin123!',
        role: 'admin',
        status: 'active',
        bio: 'System administrator for the Ethiopian Tutorial Platform'
      });
      
      await adminUser.save();
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
    if (config.nodeEnv === 'production') {
      throw new Error('Cannot clear database in production');
    }
    
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error.message);
  }
};

// Get database statistics
const getStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      objects: stats.objects
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
