// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 定义 Context 的类型
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider 组件：包裹整个 App
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 初始化时尝试从 localStorage 读取 token，这样刷新页面不会掉线
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));

  const login = (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
  };

  // 只要 token 存在，就认为已认证 (更严谨的做法是校验 token 有效期，但这步先简化)
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义 Hook，方便组件调用
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};