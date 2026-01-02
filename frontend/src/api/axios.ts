import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// 1. 创建 Axios 实例，并指定类型
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 5000,
  withCredentials: true, // 关键：允许跨域携带 Cookie
});

// 2. 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.warn('登录过期或未授权');
      // 这里可以使用 window.location.href = '/login' 或者你的路由跳转方法
    }
    return Promise.reject(error);
  } 
);

export interface LoginParams {
  agent_code: string; // 前端业务逻辑里，我们还是叫它 agent_code 比较清晰
  password: string;
}

export const login = async (data: LoginParams) => {
  // 关键步骤：转换数据格式
  // 后端 OAuth2PasswordRequestForm 需要 application/x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('username', data.agent_code); // 👈 这里完成了关键映射！
  formData.append('password', data.password);

  // 发送 POST 请求
  // 注意：不需要手动设置 Content-Type，Axios 看到 URLSearchParams 会自动处理
  return api.post('/login', formData);
};

export const logout = async () => {
  return api.post('/logout');
};

export const getUserMe = async () => {
  return api.get('/users/me');
};

export default api;