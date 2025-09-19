import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import StudentPage from './pages/StudentPage';
import TeacherPage from './pages/TeacherPage';
import AdminPage from './pages/AdminPage';
import Tutorials from './pages/Tutorials';
import Profile from './pages/Profile';

// Styles
import './styles/global.css';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <AuthProvider>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Navbar />
                      <Layout>
                        <Sidebar />
                        <Layout style={{ padding: '0 24px 24px' }}>
                          <Content
                            style={{
                              padding: 24,
                              margin: 0,
                              minHeight: 280,
                              background: '#fff',
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                          >
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/tutorials" element={<Tutorials />} />
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
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </Content>
                        </Layout>
                      </Layout>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
