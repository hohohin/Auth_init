// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/UserContext'; // 👈 引入 Hook

const Login: React.FC = () => {
  // 从 Context 中拿到 login 方法
  // 注意：不需要 user 状态，因为如果 user 存在，App.tsx 根本不会渲染这个组件
  const { login, user } = useAuth(); 
  const navigate = useNavigate();    // 👈 拿到跳转工具

  // 🛡️ 新增：如果用户已经登录，自动跳转到 dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  const [agentCode, setAgentCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // ✅ 关键点：直接调用 Context 的 login
      // 这里的逻辑是：如果报错，代码会进 catch；如果不报错，说明登录成功。
      // 登录成功后，Context 里的 user 状态会变，App.tsx 会自动重新渲染并切到主页。
      await login({ agent_code: agentCode, password });
      
    } catch (err) {
      console.error('登录出错:', err);
      // 这里可以根据 axios 的 error.response.status 来细分错误
      setError('登录失败，请检查工号和密码');
      setIsSubmitting(false); // 只有失败时才需要恢复按钮，成功了组件就销毁了
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center' }}>系统登录</h2>
      
      {error && (
        <div style={{ background: '#ffe6e6', color: '#d00', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>工号 (Agent Code):</label>
          <input 
            type="text" 
            value={agentCode}
            onChange={(e) => setAgentCode(e.target.value)}
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>密码:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: isSubmitting ? '#ccc' : '#1890ff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isSubmitting ? '登录中...' : '立即登录'}
        </button>
      </form>
    </div>
  );
};

export default Login;