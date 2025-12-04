import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  // loading is used for actions (login), initializing gates initial hydration only
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

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
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    }
    setInitializing(false);
  }, []);

  // Login Action
  const login = async (loginIdentifier, password) => {
    setLoading(true);
    try {
      const data = await loginUser({ loginIdentifier, password });

      if (!data || !data.token || data.success === false) {
        setLoading(false);
        return { 
          success: false, 
          message: data?.message || 'Invalid username or password' 
        };
      }

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
        message: error.response?.data?.message || error.message || 'Invalid username or password' 
      };
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
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!initializing && children}
    </AuthContext.Provider>
  );
};