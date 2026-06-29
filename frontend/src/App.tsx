import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import ToolList from './pages/ToolList';
import ToolDetail from './pages/ToolDetail';
import Compare from './pages/Compare';
import Trends from './pages/Trends';

const theme = {
  token: {
    colorPrimary: '#1a365d',
    colorSuccess: '#2d6a4f',
    colorWarning: '#b8860b',
    colorError: '#8b3a3a',
    colorInfo: '#2c5282',
    colorBgBase: '#faf9f6',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#faf9f6',
    colorBorder: '#e8e4df',
    colorBorderSecondary: '#f0ede8',
    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 3,
    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif",
    fontSize: 15,
    colorText: '#2c2c2c',
    colorTextSecondary: '#6b6b6b',
    colorTextTertiary: '#9a9a9a',
    colorBgElevated: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    boxShadowSecondary: '0 4px 12px rgba(0,0,0,0.06)',
    lineHeight: 1.6,
    controlHeight: 36,
    colorFillAlter: '#f5f3f0',
    colorBgTextHover: '#f0ede8',
    colorPrimaryBg: '#edf2f7',
    colorPrimaryBgHover: '#dce4ec',
    colorPrimaryBorder: '#2c5282',
    colorPrimaryBorderHover: '#1a365d',
    colorPrimaryHover: '#2c5282',
    colorPrimaryActive: '#0f2440',
    colorLink: '#1a365d',
    colorLinkHover: '#2c5282',
  },
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={theme} locale={zhCN}>
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<ToolList />} />
              <Route path="/tool/:slug" element={<ToolDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/trends" element={<Trends />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

export default App;
