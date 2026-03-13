import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (allowedRole && user.role !== allowedRole) {
       // Redirect user to their own dashboard if they try to access the wrong one
       return <Navigate to={`/${user.role}`} replace />;
    }
  } catch (err) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
