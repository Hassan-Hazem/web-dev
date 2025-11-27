import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser, registerUser } from '../api/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, [token]);

  // --- Register Action ---
  const register = async (username, email, password) => {
    try {
      const data = await registerUser({ username, email, password });
      
      // Save data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      setToken(data.token);
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error("Registration Error:", error.response?.data?.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  // --- Login Action ---
  const login = async (loginIdentifier, password) => {
    try {
      const data = await loginUser({ loginIdentifier, password });

      // Save data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      setToken(data.token);
      setUser(data);
      return { success: true };
    } catch (error) {
      console.error("Login Error:", error.response?.data?.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  // --- Logout Action ---
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};