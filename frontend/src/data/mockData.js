// Mock data for testing the Ethiopian Tutorial App

export const mockTutorials = [
  {
    id: 1,
    title: "Amharic Alphabet Basics",
    description: "Learn the fundamentals of the Amharic alphabet, including pronunciation and writing techniques.",
    category: "Language",
    difficulty: "Beginner",
    duration: "45 minutes",
    rating: 4.5,
    students: 156,
    status: "published"
  },
  {
    id: 2,
    title: "Ethiopian Coffee Ceremony",
    description: "Discover the traditional Ethiopian coffee ceremony, its cultural significance and step-by-step process.",
    category: "Culture",
    difficulty: "Beginner",
    duration: "30 minutes",
    rating: 4.8,
    students: 89,
    status: "published"
  },
  {
    id: 3,
    title: "History of Axum Empire",
    description: "Explore the ancient Axum Empire, one of Africa's greatest civilizations and its lasting impact.",
    category: "History",
    difficulty: "Intermediate",
    duration: "60 minutes",
    rating: 4.3,
    students: 67,
    status: "published"
  },
  {
    id: 4,
    title: "Injera Making Masterclass",
    description: "Learn to make authentic Ethiopian injera bread from scratch with traditional techniques.",
    category: "Cooking",
    difficulty: "Intermediate",
    duration: "90 minutes",
    rating: 4.6,
    students: 123,
    status: "published"
  },
  {
    id: 5,
    title: "Traditional Ethiopian Music",
    description: "Introduction to Ethiopian musical instruments, scales, and traditional compositions.",
    category: "Music",
    difficulty: "Beginner",
    duration: "40 minutes",
    rating: 4.4,
    students: 78,
    status: "published"
  },
  {
    id: 6,
    title: "Advanced Amharic Grammar",
    description: "Master complex Amharic grammar rules, verb conjugations, and sentence structures.",
    category: "Language",
    difficulty: "Advanced",
    duration: "75 minutes",
    rating: 4.7,
    students: 45,
    status: "published"
  }
];

export const mockUsers = [
  {
    id: 1,
    name: "Alemayehu Tadesse",
    email: "alemu@example.com",
    role: "student",
    status: "active",
    joinDate: "2024-01-15",
    phone: "+251-911-234-567",
    bio: "Passionate about learning Ethiopian culture and language."
  },
  {
    id: 2,
    name: "Dr. Meseret Bekele",
    email: "meseret@example.com",
    role: "teacher",
    status: "active",
    joinDate: "2024-01-10",
    phone: "+251-911-345-678",
    bio: "Professor of Ethiopian Studies with 15 years of experience."
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    status: "active",
    joinDate: "2024-01-01",
    phone: "+251-911-456-789",
    bio: "System administrator for the Ethiopian Tutorial Platform."
  }
];

export const mockProgress = [
  {
    id: 1,
    userId: 1,
    tutorialId: 1,
    status: "completed",
    progress: 100,
    completedAt: "2024-01-20"
  },
  {
    id: 2,
    userId: 1,
    tutorialId: 2,
    status: "in_progress",
    progress: 65,
    startedAt: "2024-01-22"
  },
  {
    id: 3,
    userId: 1,
    tutorialId: 3,
    status: "not_started",
    progress: 0
  }
];

// Mock API responses
export const mockApiResponses = {
  login: {
    student: {
      user: mockUsers[0], // Alemayehu Tadesse - Student
      token: "mock-jwt-token-student-12345"
    },
    teacher: {
      user: mockUsers[1], // Dr. Meseret Bekele - Teacher
      token: "mock-jwt-token-teacher-12345"
    },
    admin: {
      user: mockUsers[2], // Admin User - Admin
      token: "mock-jwt-token-admin-12345"
    },
    error: {
      message: "Invalid credentials"
    }
  },
  register: {
    success: {
      user: mockUsers[0],
      token: "mock-jwt-token-12345"
    },
    error: {
      message: "Email already exists"
    }
  },
  tutorials: {
    success: mockTutorials
  },
  progress: {
    success: mockProgress
  }
};
