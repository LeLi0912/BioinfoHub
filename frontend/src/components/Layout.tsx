import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Typography } from 'antd';

const { Header, Content } = AntLayout;

const navItems = [
  { key: '/', label: '工具列表' },
  { key: '/trends', label: '趋势面板' },
  { key: '/compare', label: '工具对比' },
];

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#faf9f6' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          background: '#ffffff',
          borderBottom: '1px solid #e8e4df',
          height: 56,
          lineHeight: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Typography.Title
          level={4}
          style={{
            margin: 0,
            marginRight: 48,
            whiteSpace: 'nowrap',
            fontFamily: "'Noto Serif SC', 'STSong', 'SimSun', serif",
            fontWeight: 700,
            color: '#1a365d',
            cursor: 'pointer',
            fontSize: 18,
          }}
          onClick={() => navigate('/')}
        >
          BioinfoHub
        </Typography.Title>

        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.key;
            return (
              <span
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 54,
                  padding: '0 20px',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#1a365d' : '#6b6b6b',
                  borderBottom: active ? '2px solid #1a365d' : '2px solid transparent',
                  transition: 'all 0.2s',
                  background: active ? 'rgba(26,54,93,0.04)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#2c5282';
                    e.currentTarget.style.background = 'rgba(26,54,93,0.03)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#6b6b6b';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {item.label}
              </span>
            );
          })}
        </nav>
      </Header>

      <Content style={{ padding: '28px 32px', maxWidth: 1240, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;
