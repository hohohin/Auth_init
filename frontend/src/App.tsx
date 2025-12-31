// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // 1. 引入 Provider
import ProtectedRoute from './components/ProtectedRoute'; // 2. 引入守卫
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    // 3. 用 AuthProvider 包裹最外层，让所有页面都能读取登录状态
    <AuthProvider>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* === 受保护路由区域 === */}
          {/* 所有包裹在 ProtectedRoute 里面的路由，都需要登录才能看 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* 未来可以在这里加更多受保护页面，比如 /video/:id */}
          </Route>

          {/* 默认路由：重定向 */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 也可以重定向回 dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;