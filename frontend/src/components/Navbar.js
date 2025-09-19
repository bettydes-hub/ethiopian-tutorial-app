import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return null; // Don't render navbar while loading
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'logout') {
      handleLogout();
    }
  };

  const handleMainMenuClick = ({ key }) => {
    if (key === 'home') {
      navigate('/');
    } else if (key === 'tutorials') {
      navigate('/tutorials');
    } else if (key === 'about') {
      navigate('/about');
    }
  };

  const userMenu = (
    <Menu onClick={handleUserMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
        Ethiopian Tutorial App
      </div>
      
      <Menu
        theme="dark"
        mode="horizontal"
        style={{ flex: 1, justifyContent: 'center' }}
        onClick={handleMainMenuClick}
        items={[
          { key: 'home', label: 'Home' },
          { key: 'tutorials', label: 'Tutorials' },
          { key: 'about', label: 'About' },
        ]}
      />

      <div>
        {user && user.name ? (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Button type="text" style={{ color: 'white' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              {user.name}
            </Button>
          </Dropdown>
        ) : (
          <div>
            <Button type="primary" onClick={() => navigate('/login')} style={{ marginRight: 8 }}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>Register</Button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
