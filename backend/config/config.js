module.exports = {
  // Server Configuration
  port: process.env.PORT || 5500,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/ethiopian-tutorial-app',

  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // File Upload Configuration
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800, // 50MB

  // CORS Configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:5000', 'http://localhost:5001', 'http://localhost:5500'],

  // Cloudinary Configuration (Optional)
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Email Configuration (Optional)
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  },

  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};
