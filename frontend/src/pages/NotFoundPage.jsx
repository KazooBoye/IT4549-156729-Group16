import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const NotFoundPage = () => {
  const { user } = useContext(AuthContext);
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <Link to={user ? "/dashboard" : "/"}>Go to {user ? 'Dashboard' : 'Homepage'}</Link>
    </div>
  );
};

export default NotFoundPage;
