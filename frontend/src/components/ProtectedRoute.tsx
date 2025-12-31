// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // 没登录？踢回登录页
    // replace: 替换当前历史记录，防止用户点“后退”又回到这里
    // state: 记录用户本来想去哪，登录后可以跳回来 (可选优化)
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 已登录？放行，渲染子路由 (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;