import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App';
import Home from './components/Home';

// /login ve /register ayrı sayfa render etmek yerine /app'e uygun query ile yönlendiriyoruz.
// Böylece App içindeki mevcut Login ekranı (AuthProvider kapsamı) çalışmaya devam eder.
const RedirectToApp: React.FC<{ mode: 'login' | 'register' }> = ({ mode }) => {
  // Navigate kullanırsak history'e eklenir; replace ile daha da temizlenebilir.
  const target = `/app?mode=${mode}`;
  return <Navigate to={target} replace />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<App />} />
        <Route path="/login" element={<RedirectToApp mode="login" />} />
        <Route path="/register" element={<RedirectToApp mode="register" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
