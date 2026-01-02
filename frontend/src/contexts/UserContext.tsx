// src/contexts/UserContext.tsx
import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getUserMe, type LoginParams } from '../api/axios';

// 1. 定义用户数据的形状
export interface User {
  agent_code: string;
  username: string;
}

// 2. 定义 Context 里我们要“暴露”给全局的东西
interface UserContextType {
  user: User | null;           // 👈 状态
  login: (data: LoginParams) => Promise<void>; // 👈 动作 1
  logout: () => Promise<void>; // 👈 动作 2
  isLoading: boolean;          // (可选) 这是一个加分项，用来防止页面闪烁
}

// 创建 Context 对象，初始值为 undefined (为了强制大家在 Provider 内部使用)
export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 初始化检查：页面刷新时，判断 Cookie 是否还在
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await getUserMe();
        setUser(res.data); // 恢复用户状态
      } catch (e) {
        setUser(null); // Cookie 无效或过期
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  // 2. 登录动作
  const login = async (data: LoginParams) => {
    await apiLogin(data);       // 发送请求，浏览器自动存 Cookie
    const res = await getUserMe(); // 再次查询 /users/me 拿到完整的用户信息
    setUser(res.data);          // 更新状态
  };

  // 3. 登出动作
  const logout = async () => {
    await apiLogout(); // 让后端清除 Cookie
    setUser(null);     // 前端清空状态
  };

  return (
    // 关键点：把所有数据和函数通过 value 属性传下去
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a UserProvider');
  }
  return context;
};