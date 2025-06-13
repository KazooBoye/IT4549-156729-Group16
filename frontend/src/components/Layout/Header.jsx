import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Assuming you are using React Router for navigation
import AuthContext from '../../contexts/AuthContext';
import './Header.css'; // Optional: for styling

const Header = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears user session from AuthContext and localStorage
    navigate('/login'); // Redirect to login page after logout
  };

  // Do not render anything or render a placeholder if auth state is still loading
  if (loading) {
    return (
      <header className="app-header">
        <div className="logo">
          <Link to="/">GymApp</Link>
        </div>
        <nav className="auth-nav">
          Loading...
        </nav>
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="logo">
        <Link to="/">GymApp</Link>
      </div>
      <nav className="main-nav">
        {/* Add other navigation links here if needed, e.g., for packages, classes, etc. */}
        {user && <Link to="/member/profile">My Profile</Link>}
        {user && <Link to="/member/training-history">Training History</Link>}
        {user && <Link to="/member/packages">View Packages</Link>}
        {/* Add more role-specific links as needed */}
      </nav>
      <nav className="auth-nav">
        {user ? (
          <>
            <span className="user-greeting">Welcome, {user.fullName || user.email}!</span>
            {/* This is the logout button */}
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Log In</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
