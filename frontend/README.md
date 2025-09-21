# Ethiopian Tutorial App - Frontend

A React-based frontend application for the Ethiopian Tutorial App, built with Ant Design and modern React practices.

## Features

- **Role-based Authentication**: Student, Teacher, and Admin roles
- **Tutorial Management**: Create, view, and manage educational content
- **Quiz System**: Interactive quizzes with multiple choice and true/false questions
- **Progress Tracking**: Monitor learning progress and completion rates
- **File Upload**: Support for video, PDF, and image uploads
- **User Management**: Admin panel for user and category management
- **Responsive Design**: Mobile-friendly interface using Ant Design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running on http://localhost:5000

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ethiopian-tutorial-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your API configuration:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Development

1. Start the development server:
```bash
npm start
```

2. Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

## API Integration

The frontend is configured to work with the backend API. Make sure the backend is running on port 5000 before starting the frontend.

### API Endpoints Used

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Tutorials**: `/api/tutorials/*`
- **Quizzes**: `/api/quizzes/*`
- **Categories**: `/api/categories/*`
- **File Upload**: `/api/upload/*`

### Environment Variables

- `REACT_APP_API_URL`: Backend API base URL (default: http://localhost:5000/api)
- `REACT_APP_ENV`: Environment (development/production)
- `REACT_APP_MAX_FILE_SIZE`: Maximum file upload size in bytes
- `REACT_APP_ALLOWED_VIDEO_TYPES`: Allowed video file types
- `REACT_APP_ALLOWED_PDF_TYPES`: Allowed PDF file types
- `REACT_APP_ALLOWED_IMAGE_TYPES`: Allowed image file types

## Project Structure

```
src/
├── api/                 # API service files
│   ├── authApi.js      # Authentication API
│   ├── userApi.js      # User management API
│   ├── tutorialApi.js  # Tutorial management API
│   ├── quizApi.js      # Quiz management API
│   ├── categoryApi.js  # Category management API
│   └── uploadApi.js    # File upload API
├── components/          # Reusable components
│   ├── Navbar.js       # Navigation bar
│   ├── Sidebar.js      # Sidebar navigation
│   ├── ProtectedRoute.js # Route protection
│   └── Quiz.js         # Quiz component
├── context/            # React context
│   └── AuthContext.js  # Authentication context
├── pages/              # Page components
│   ├── Dashboard.js    # Main dashboard
│   ├── Login.js        # Login page
│   ├── Register.js     # Registration page
│   ├── StudentPage.js  # Student dashboard
│   ├── TeacherPage.js  # Teacher panel
│   ├── AdminPage.js    # Admin panel
│   ├── Tutorials.js    # Tutorial listing
│   ├── TutorialDetail.js # Tutorial detail view
│   ├── About.js        # About page
│   └── Unauthorized.js # Unauthorized access page
├── utils/              # Utility functions
│   └── pdfGenerator.js # PDF generation utilities
└── App.js              # Main application component
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm run eject`: Ejects from Create React App

## Backend Requirements

The frontend expects the backend to provide the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/change-password` - Change password
- `PUT /api/auth/profile` - Update profile

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin)
- `POST /api/users/:id/block` - Block user (admin)
- `POST /api/users/:id/unblock` - Unblock user (admin)

### Tutorials
- `GET /api/tutorials` - Get all tutorials
- `GET /api/tutorials/:id` - Get tutorial by ID
- `POST /api/tutorials` - Create tutorial (teacher/admin)
- `PUT /api/tutorials/:id` - Update tutorial (teacher/admin)
- `DELETE /api/tutorials/:id` - Delete tutorial (admin)
- `GET /api/tutorials/category/:category` - Get tutorials by category
- `GET /api/tutorials/user/:userId/progress` - Get user progress
- `POST /api/tutorials/:id/progress` - Update progress

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create quiz (teacher)
- `PUT /api/quizzes/:id` - Update quiz (teacher)
- `DELETE /api/quizzes/:id` - Delete quiz (teacher/admin)
- `POST /api/quizzes/:id/attempt` - Submit quiz attempt
- `GET /api/quizzes/user/:userId/attempts` - Get user attempts

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### File Upload
- `POST /api/upload/video` - Upload video file
- `POST /api/upload/pdf` - Upload PDF file
- `POST /api/upload/image` - Upload image file
- `DELETE /api/upload` - Delete uploaded file

## Error Handling

The application includes comprehensive error handling:
- API request failures are caught and displayed to users
- Network errors are handled gracefully
- Authentication errors redirect to login
- Form validation errors are displayed inline

## Testing

The application is ready for testing with the backend. When the backend is not available, API calls will fail gracefully and show appropriate error messages.

## Deployment

1. Build the production version:
```bash
npm run build
```

2. The `build` folder contains the production-ready files.

3. Deploy the `build` folder to your hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.