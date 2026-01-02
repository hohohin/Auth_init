// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { UserProvider } from './contexts/UserContext' // 👈 引入我们写的 Provider

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* 👇 把 App 包起来 */}
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
)