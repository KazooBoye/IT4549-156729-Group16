import React, { useState/*, useContext*/ } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext'; // To be created
import axios from 'axios'; // For API calls

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  // const { login } = useContext(AuthContext); // To be created

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Replace with actual API call using a service
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, { email, password });
      console.log('Login successful:', response.data);
      // login(response.data.token, response.data.user); // Call context login function
      localStorage.setItem('token', response.data.token); // Simple token storage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials.');
      console.error('Login error:', err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
      <p>
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
    </div>
  );
};

export default LoginPage;
