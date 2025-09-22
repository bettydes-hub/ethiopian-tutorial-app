import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Drawer } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

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
    setMobileMenuVisible(false); // Close mobile menu after navigation
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
    <>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        <div style={{ 
          color: 'white', 
          fontSize: '20px', 
          fontWeight: 'bold',
          flex: 1
        }}>
          Ethiopian Tutorial App
        </div>
        
        {/* Desktop Menu */}
        <div className="desktop-menu" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ 
              background: 'transparent',
              border: 'none',
              minWidth: '300px'
            }}
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
        </div>

        {/* Mobile Menu Button */}
        <Button
          className="mobile-menu-btn"
          type="text"
          icon={<MenuOutlined />}
          style={{ 
            color: 'white',
            display: 'none'
          }}
          onClick={() => setMobileMenuVisible(true)}
        />
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
        className="mobile-drawer"
      >
        <Menu
          mode="vertical"
          onClick={handleMainMenuClick}
          items={[
            { key: 'home', label: 'Home' },
            { key: 'tutorials', label: 'Tutorials' },
            { key: 'about', label: 'About' },
          ]}
        />
        
        <div style={{ marginTop: '24px', padding: '16px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ marginBottom: '16px' }}>
            <strong>Welcome, {user?.name}</strong>
          </div>
          <Menu
            mode="vertical"
            onClick={handleUserMenuClick}
            items={[
              { key: 'profile', label: 'Profile', icon: <UserOutlined /> },
              { key: 'logout', label: 'Logout', icon: <LogoutOutlined /> },
            ]}
          />
        </div>
      </Drawer>
    </>
  );
};

export default Navbar;
