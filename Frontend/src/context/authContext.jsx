import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, fetchCurrentUser } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  // Login Action
  const login = async (loginIdentifier, password) => {
    setLoading(true);
    try {
      const data = await loginUser({ loginIdentifier, password });

      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        username: data.username,
        email: data.email
      }));

      setToken(data.token);
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email
      });
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error.response?.data?.message || error.message);
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  // Login with existing token
  const loginWithToken = async (token) => {
    setLoading(true);
    localStorage.setItem('token', token);
    setToken(token);

    try {
        const data = await fetchCurrentUser();

        localStorage.setItem('user', JSON.stringify(data));
        setUser(data); 
        
        setLoading(false);
        return { success: true };
    } catch (error) {
        console.error("Token Login Error:", error);
        logout();
        setLoading(false);
        return { success: false, message: 'Could not fetch user data.' };
    }
};

  // Logout Action
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

return (
  <AuthContext.Provider value={{ user, token, login, logout, loading, loginWithToken }}>
    {!loading && children}
  </AuthContext.Provider>
);
};