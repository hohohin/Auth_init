// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// 引入你的页面组件
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // 假设你有这个页面
// import Settings from './pages/Settings'; 

const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* UserProvider 必须在 BrowserRouter 里面或者外面包裹住 Routes，只要能覆盖到就行 */}
      <UserProvider>
        <Routes>
          {/* === 公开路由 === */}
          {/* 谁都可以访问登录页 */}
          <Route path="/login" element={<Login />} />

          {/* === 受保护路由 (重点在这里) === */}
          {/* 所有在 ProtectedRoute 下面的子路由，都会先经过那个“守门员”的检查 */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              
              {/* 👇 这些页面现在都会显示在 Layout 的 Outlet 那个坑位里 */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<div>这里是设置页面</div>} />
              
              {/* 根路径重定向 */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
            </Route>
          </Route>

          {/* 404 处理 */}
          <Route path="*" element={<div>页面不存在</div>} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
};

export default App;