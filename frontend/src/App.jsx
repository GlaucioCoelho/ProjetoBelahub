import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import { MainLayout } from './components';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const App = () => {
  const { estaAutenticado } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={estaAutenticado ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/*"
          element={estaAutenticado ? <MainLayout /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
};

export default process.env.REACT_APP_SENTRY_DSN ? Sentry.withProfiler(App) : App;
