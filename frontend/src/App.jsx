import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import { MainLayout } from './components';

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

export default App;
