import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Gym Management System</h1>
      <p>Your one-stop solution for managing your gym operations efficiently.</p>
      <div>
        <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default HomePage;
