import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Typography } from 'antd';
import { SearchOutlined, BarChartOutlined, SwapOutlined, HomeOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { key: '/', icon: <HomeOutlined />, label: '工具列表' },
    { key: '/trends', icon: <BarChartOutlined />, label: '趋势面板' },
    { key: '/compare', icon: <SwapOutlined />, label: '工具对比' },
  ];

  const selectedKey = navItems.find((i) => i.key === location.pathname)?.key || '/';

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Typography.Title level={4} style={{ color: '#fff', margin: 0, marginRight: 40, whiteSpace: 'nowrap' }}>
          BioinfoHub
        </Typography.Title>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={navItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;
