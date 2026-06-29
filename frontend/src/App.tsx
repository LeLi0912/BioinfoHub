import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import ToolList from './pages/ToolList';
import ToolDetail from './pages/ToolDetail';
import Compare from './pages/Compare';
import Trends from './pages/Trends';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff' } }}>
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
