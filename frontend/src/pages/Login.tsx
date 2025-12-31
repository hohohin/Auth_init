// src/pages/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 确保 npm install axios
import { useAuth } from '../context/AuthContext'; // 引入我们写的 Hook
import './Auth.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth(); // 获取 login 方法
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. 准备 OAuth2 表单数据
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      // 2. 调用后端接口 (假设后端在 8000 端口)
      const response = await axios.post('http://127.0.0.1:8000/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      // 3. 拿到 Token
      const { access_token } = response.data;
      
      // 4. 存入 Context 并跳转
      login(access_token);
      navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      setError('登录失败：用户名或密码错误');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">欢迎回来</h2>
        
        {/* 错误提示 */}
        {error && <div style={{ color: 'var(--color-alert-red)', marginBottom: '1rem' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? '登录中...' : '登 录'}
          </button>
        </form>
        <p className="auth-switch">
          还没有账号？ <Link to="/register">立即注册</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;