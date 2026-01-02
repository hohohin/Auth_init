// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  // 1. 如果还在检查 Token，显示加载动画 (防止页面闪烁)
  if (isLoading) {
    return <div>正在登录...</div>;
  }

  // 2. 如果检查完了发现没登录，强制跳转到登录页
  // replace 属性的意思是：替换当前历史记录，这样用户点击“后退”按钮时不会又回到这个受保护页面
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. 如果登录了，渲染子路由
  return <Outlet />;
};

export default ProtectedRoute;