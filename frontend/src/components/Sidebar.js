import React from 'react';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  SettingOutlined,
  ProfileOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider } = Layout;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Don't render sidebar while loading
  }

  const getMenuItems = () => {
    if (!user) return [];
    const baseItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Dashboard',
      },
      {
        key: '/tutorials',
        icon: <BookOutlined />,
        label: 'Tutorials',
      },
    ];

    if (user?.role === 'student') {
      baseItems.push(
        {
          key: '/student',
          icon: <UserOutlined />,
          label: 'My Learning',
        },
        {
          key: '/progress',
          icon: <TrophyOutlined />,
          label: 'My Progress',
        }
      );
    }

    if (user?.role === 'teacher') {
      baseItems.push({
        key: '/teacher',
        icon: <TeamOutlined />,
        label: 'Teacher Panel',
      });
    }

    if (user?.role === 'admin') {
      baseItems.push({
        key: '/admin',
        icon: <SettingOutlined />,
        label: 'Admin Panel',
      });
    }

    baseItems.push({
      key: '/profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
    });

    return baseItems;
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      width={250}
      className="sidebar"
      style={{
        background: '#fff',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <h3 style={{ margin: 0, color: '#1890ff' }}>Menu</h3>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={getMenuItems()}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
