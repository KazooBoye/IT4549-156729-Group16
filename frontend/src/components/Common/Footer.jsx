import React from 'react';

const Footer = () => {
  return (
    <footer style={{ background: '#333', color: '#fff', textAlign: 'center', padding: '1rem', marginTop: '2rem' }}>
      <p>&copy; {new Date().getFullYear()} Gym Management System. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
