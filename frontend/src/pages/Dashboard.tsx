// src/pages/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';


// 临时内联样式，展示 Grid 和颜色搭配
const dashboardStyle: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  height: '100vh',
  backgroundColor: 'var(--color-primary-blue)', // 蓝色背景
  color: 'var(--color-white)',
};

const contentStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '3rem',
  border: '4px dashed var(--color-accent-orange)', // 橙色边框
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)' // 半透明白色
};




const Dashboard = () => {
  const navigate = useNavigate()

  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    console.log('logging out');
  }

  return (
    <div style={dashboardStyle}>
      <div style={contentStyle}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>🛠️</h1>
        <h2 style={{ fontSize: '2.5rem' }}>Dashboard 搭建中...</h2>
        <p>视频列表与 AI 分析结果将在这里呈现。</p>
        <button onClick={handleLogout}>LogOut</button>
      </div>
    </div>
  );
};

export default Dashboard;