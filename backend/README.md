# Ethiopian Tutorial App - Backend API

A comprehensive backend API for the Ethiopian Tutorial App, built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User Management**: Student, Teacher, and Admin roles with full CRUD operations
- **Tutorial Management**: Create, read, update, delete tutorials with progress tracking
- **Quiz System**: Interactive quizzes with multiple choice and true/false questions
- **Category Management**: Organize tutorials by categories
- **Progress Tracking**: Track user progress through tutorials and quizzes
- **File Upload**: Support for video, PDF, and image uploads
- **Email Notifications**: Welcome emails, password reset, and progress notifications
- **Rate Limiting**: API rate limiting for security
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling with proper HTTP status codes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /me` - Get current user
- `POST /refresh` - Refresh access token
- `POST /change-password` - Change password
- `PUT /profile` - Update profile
- `POST /request-password-reset` - Request password reset
- `POST /reset-password` - Reset password

### Users (`/api/users`)
- `GET /` - Get all users (Admin only)
- `POST /` - Create user (Admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user (Admin only)
- `DELETE /:id` - Delete user (Admin only)
- `POST /:id/block` - Block user (Admin only)
- `POST /:id/unblock` - Unblock user (Admin only)
- `POST /:id/approve-teacher` - Approve teacher (Admin only)
- `GET /:id/stats` - Get user statistics
- `GET /:id/tutorials` - Get user's tutorials
- `GET /:id/created-tutorials` - Get user's created tutorials

### Tutorials (`/api/tutorials`)
- `GET /` - Get all tutorials
- `GET /:id` - Get tutorial by ID
- `POST /` - Create tutorial (Teacher/Admin)
- `PUT /:id` - Update tutorial
- `DELETE /:id` - Delete tutorial
- `GET /category/:category` - Get tutorials by category
- `POST /:id/progress` - Update tutorial progress
- `GET /:id/progress` - Get user progress for tutorial
- `GET /user/progress` - Get all user progress
- `PATCH /:id/publish` - Toggle publish status
- `POST /:id/rating` - Add tutorial rating

### Quizzes (`/api/quizzes`)
- `GET /` - Get all quizzes
- `GET /:id` - Get quiz by ID
- `POST /` - Create quiz (Teacher/Admin)
- `PUT /:id` - Update quiz
- `DELETE /:id` - Delete quiz
- `POST /:id/start` - Start quiz attempt
- `POST /attempt/:id/submit` - Submit quiz attempt
- `GET /:id/attempts` - Get quiz attempts
- `GET /user/:userId/attempts` - Get user quiz attempts
- `PATCH /:id/publish` - Toggle publish status

### Categories (`/api/categories`)
- `GET /` - Get all categories
- `GET /list` - Get category list (for dropdowns)
- `GET /:id` - Get category by ID
- `POST /` - Create category (Admin only)
- `PUT /:id` - Update category (Admin only)
- `DELETE /:id` - Delete category (Admin only)
- `GET /:id/tutorials` - Get category with tutorials
- `GET /:id/stats` - Get category statistics
- `PATCH /:id/status` - Toggle category status (Admin only)
- `PATCH /:id/update-count` - Update tutorial count (Admin only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ethiopian-tutorial-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=mongodb://localhost:27017/ethiopian-tutorial-app
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   JWT_EXPIRES_IN=24h
   JWT_REFRESH_EXPIRES_IN=7d
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=52428800
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Database Setup

The application will automatically:
- Connect to MongoDB
- Create necessary indexes
- Seed initial data (categories and admin user)

## API Documentation

### Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Authentication

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **Student**: Can view tutorials, take quizzes, track progress
- **Teacher**: Can create/edit tutorials and quizzes, view student progress
- **Admin**: Full system access, user management, category management

## File Upload

The API supports file uploads for:
- Videos (MP4, WebM, MOV) - Max 500MB
- PDFs - Max 50MB
- Images (JPG, PNG, WebP) - Max 10MB

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/ethiopian-tutorial-app` |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret key | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `UPLOAD_PATH` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Maximum file size in bytes | `52428800` (50MB) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API rate limiting
- **Input Validation**: Request validation
- **Password Hashing**: bcrypt with salt
- **JWT Authentication**: Secure token-based auth
- **File Upload Security**: File type and size validation

## Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication errors
- Database errors
- File upload errors
- Rate limiting
- Server errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.