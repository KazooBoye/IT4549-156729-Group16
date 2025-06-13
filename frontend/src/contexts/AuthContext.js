import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios'; // If you need to verify token with backend

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // To handle initial loading of persisted state

  useEffect(() => {
    // Try to load token and user from localStorage on initial app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        // Optionally, you might want to verify the token with your backend here
        // For example:
        // axios.get('/api/auth/verify-token', { headers: { Authorization: `Bearer ${storedToken}` }})
        //   .then(response => setUser(response.data.user))
        //   .catch(() => {
        //     localStorage.removeItem('token');
        //     localStorage.removeItem('user');
        //     setUser(null);
        //     setToken(null);
        //   });
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('user'); // Clear corrupted data
      }
    }
    setLoading(false); // Finished loading persisted state
  }, []);

  const login = (userData, authToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', authToken);
    setUser(userData);
    setToken(authToken);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    // Optionally, redirect to login page or home page
    // window.location.href = '/login';
  };
  
  // This function is used by MemberProfilePage to update user details in context and localStorage
  const updateUserContext = (updatedUserData) => {
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUserContext, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
