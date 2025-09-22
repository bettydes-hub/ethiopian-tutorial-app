import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider, App } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentPage from './pages/StudentPage';
import TeacherPage from './pages/TeacherPage';
import AdminPage from './pages/AdminPage';
import Tutorials from './pages/Tutorials';
import TutorialDetail from './pages/TutorialDetail';
import Profile from './pages/Profile';
import About from './pages/About';
import Unauthorized from './pages/Unauthorized';

// Styles
import './styles/global.css';

const { Content } = Layout;

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout style={{ flexDirection: 'row' }}>
        <Sidebar />
        <Layout style={{ flex: 1, marginLeft: 0 }}>
          <Content
            style={{
              padding: '24px',
              margin: 0,
              minHeight: 'calc(100vh - 64px)',
              background: '#f5f5f5',
              width: '100%',
            }}
            className="main-content"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tutorials" element={<Tutorials />} />
              <Route path="/tutorial/:id" element={<TutorialDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/student" element={<StudentPage />} />
              <Route 
                path="/teacher" 
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <TeacherPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

const MainApp = () => (
  <ConfigProvider
    theme={{
      token: {
        colorPrimary: '#1890ff',
        borderRadius: 6,
      },
    }}
  >
    <App>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </App>
  </ConfigProvider>
);

export default MainApp;