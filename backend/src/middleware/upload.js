const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../../config/config');

// Ensure upload directories exist
const ensureUploadDirs = () => {
  const dirs = [
    config.uploadPath,
    path.join(config.uploadPath, 'videos'),
    path.join(config.uploadPath, 'pdfs'),
    path.join(config.uploadPath, 'images')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// File filter function
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureUploadDirs();
    
    let uploadPath = config.uploadPath;
    
    if (file.fieldname === 'video') {
      uploadPath = path.join(config.uploadPath, 'videos');
    } else if (file.fieldname === 'pdf') {
      uploadPath = path.join(config.uploadPath, 'pdfs');
    } else if (file.fieldname === 'image' || file.fieldname === 'thumbnail') {
      uploadPath = path.join(config.uploadPath, 'images');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// Video upload configuration
const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
  fileFilter: fileFilter([
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ])
});

// PDF upload configuration
const pdfUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: fileFilter([
    'application/pdf'
  ])
});

// Image upload configuration
const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ])
});

// Generic file upload configuration
const fileUpload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize,
  }
});

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        details: `Maximum file size is ${config.maxFileSize / (1024 * 1024)}MB`
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files',
        details: 'Maximum number of files exceeded'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'Unexpected field',
        details: 'Unexpected file field in request'
      });
    }
  } else if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      details: error.message
    });
  }

  console.error('Upload error:', error);
  return res.status(500).json({
    success: false,
    error: 'File upload failed',
    details: error.message
  });
};

// Clean up uploaded files on error
const cleanupUploadedFiles = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // If response indicates error, clean up uploaded files
    if (res.statusCode >= 400) {
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      if (req.file) {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Validate file size
const validateFileSize = (maxSize) => (req, res, next) => {
  if (req.file && req.file.size > maxSize) {
    // Clean up the file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(400).json({
      success: false,
      error: 'File too large',
      details: `Maximum file size is ${maxSize / (1024 * 1024)}MB`
    });
  }
  
  next();
};

// Generate file URL
const generateFileUrl = (req, file) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const relativePath = file.path.replace(/\\/g, '/');
  const uploadPath = config.uploadPath.replace(/\\/g, '/');
  const urlPath = relativePath.replace(uploadPath, '/uploads');
  return `${baseUrl}${urlPath}`;
};

module.exports = {
  videoUpload,
  pdfUpload,
  imageUpload,
  fileUpload,
  handleUploadError,
  cleanupUploadedFiles,
  validateFileSize,
  generateFileUrl,
  ensureUploadDirs
};
