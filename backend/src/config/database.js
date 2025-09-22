const { Sequelize } = require('sequelize');
const config = require('../../config/config');

// Create Sequelize instance
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL database connected successfully');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
    
    return sequelize;
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

// Graceful shutdown
const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log('PostgreSQL database disconnected');
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
};

module.exports = {
  sequelize,
  connectDB,
  disconnectDB
};
