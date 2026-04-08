import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const authenticatedHome = userRole === 'admin' ? '/admin' : '/user';

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={authenticatedHome} replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={authenticatedHome} replace /> : <Register />} />
        <Route 
          path="/user" 
          element={
            isAuthenticated && userRole === 'user' ? <UserDashboard /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/admin" 
          element={
            isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />
          } 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? authenticatedHome : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
