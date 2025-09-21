require('dotenv').config({ path: './config.env' });

const app = require('./src/app');
const { connectDB, createIndexes, seedData } = require('./src/utils/database');
const config = require('./config/config');

// Connect to database
connectDB().then(async () => {
  console.log('Database connected successfully');
  
  // Create indexes for better performance
  await createIndexes();
  
  // Seed initial data
  await seedData();
  
  // Start server
  const server = app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`API URL: http://localhost:${config.port}/api`);
    console.log(`Health check: http://localhost:${config.port}/health`);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.error('Unhandled Promise Rejection:', err.message);
    server.close(() => {
      process.exit(1);
    });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    process.exit(1);
  });
  
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});