// NavButtons.jsx
import React from 'react';

const NavButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8">
      <a
        href="/"
        className="home-btn"
        style={{
          padding: '12px 32px',
          fontWeight: 700,
          fontSize: '1.1rem',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
          color: '#222',
          boxShadow: '0 4px 16px rgba(67,233,123,0.15)',
          textDecoration: 'none',
          transition: 'transform 0.2s, box-shadow 0.2s',
          marginRight: '8px'
        }}
      >
        Home
      </a>
      <a
        href="/register"
        className="register-btn"
        style={{
          padding: '12px 32px',
          fontWeight: 700,
          fontSize: '1.1rem',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #f7971e 0%, #ffd200 100%)',
          color: '#222',
          boxShadow: '0 4px 16px rgba(255,210,0,0.15)',
          textDecoration: 'none',
          transition: 'transform 0.2s, box-shadow 0.2s',
          marginRight: '8px'
        }}
      >
        Register
      </a>
      <a
        href="/login"
        className="login-btn"
        style={{
          padding: '12px 32px',
          fontWeight: 700,
          fontSize: '1.1rem',
          borderRadius: '999px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          boxShadow: '0 4px 16px rgba(102,126,234,0.15)',
          textDecoration: 'none',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
      >
        Login
      </a>
    </div>
  );
};

export default NavButtons;
