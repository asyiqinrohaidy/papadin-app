// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, children }) {
  if (!user) {
    // User not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  // User logged in, show the component
  return children;
}

export default ProtectedRoute;