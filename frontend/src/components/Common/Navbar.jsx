import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ background: '#333', color: '#fff', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
      <Link to={user ? "/dashboard" : "/"} style={{ color: '#fff', textDecoration: 'none', fontSize: '1.5rem' }}>GymPro</Link>
      <div>
        {!user && <Link to="/" style={{ color: '#fff', marginRight: '1rem' }}>Home</Link>}
        {user ? (
          <>
            <Link to="/dashboard" style={{ color: '#fff', marginRight: '1rem' }}>Dashboard</Link>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>Logout</button>
            <span style={{ marginLeft: '1rem'}}>Welcome, {user.fullName || user.email}</span>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', marginRight: '1rem' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
