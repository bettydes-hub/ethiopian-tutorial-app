import React from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
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
        items={[
          { key: 'home', label: 'Home' },
          { key: 'tutorials', label: 'Tutorials' },
          { key: 'about', label: 'About' },
        ]}
      />

      <div>
        {user ? (
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
