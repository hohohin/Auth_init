// src/pages/Register.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register Attempt:", { username, password });
    // TODO: 这里稍后对接 FastAPI 的 /register 接口
    // 注册成功后通常跳转到登录页
    // navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title" style={{ color: 'var(--color-accent-orange)' }}>
          创建新账号
        </h2>
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
          {/* 注册按钮使用橙色作为区分 */}
          <button type="submit" className="submit-btn" style={{ backgroundColor: 'var(--color-accent-orange)' }}>
            注 册
          </button>
        </form>
        <p className="auth-switch">
          已有账号？ <Link to="/login">直接登录</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;