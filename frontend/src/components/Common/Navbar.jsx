import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import NavButtons from '../Common/NavButtons'; // Đường dẫn chính xác theo dự án bạn

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        background: '#333',
        color: '#fff',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Link
        to={user ? '/dashboard' : '/'}
        style={{ color: '#fff', textDecoration: 'none', fontSize: '1.5rem' }}
      >
        GymPro
      </Link>

      <div>
        {!user ? (
          // Thay thế 3 link Home, Login, Register bằng NavButtons
          <NavButtons />
        ) : (
          <>
            <Link
              to="/dashboard"
              style={{ color: '#fff', marginRight: '1rem', textDecoration: 'none' }}
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                marginRight: '1rem',
                fontSize: '1rem',
              }}
            >
              Logout
            </button>
            <span style={{ marginLeft: '1rem' }}>
              Welcome, {user.fullName || user.email}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
