import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <p>Loading...</p>; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Optional: Redirect to an unauthorized page or back to dashboard
    // For now, redirecting to dashboard if role not allowed.
    console.warn(`User role ${user.role} not in allowed roles: ${allowedRoles}`);
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
