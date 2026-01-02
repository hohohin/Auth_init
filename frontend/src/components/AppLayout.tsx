// src/components/AppLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext';

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth(); // 👈 这里也可以直接用我们的管家！

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* === 左侧侧边栏 (Sidebar) === */}
      <aside style={{ width: '200px', background: '#001529', color: 'white', padding: '20px' }}>
        <h3>系统菜单</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ margin: '15px 0' }}>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>📊 仪表盘</Link>
          </li>
          <li style={{ margin: '15px 0' }}>
            <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>⚙️ 设置</Link>
          </li>
        </ul>
        
        <div style={{ marginTop: '50px', borderTop: '1px solid #999', paddingTop: '10px' }}>
          <p>工号: {user?.agent_code}</p>
          <button onClick={logout} style={{ cursor: 'pointer' }}>退出登录</button>
        </div>
      </aside>

      {/* === 右侧主内容区 === */}
      <main style={{ flex: 1, background: '#f0f2f5', padding: '20px' }}>
        {/* 👇 关键：这里就是“照片”变换的地方 */}
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;