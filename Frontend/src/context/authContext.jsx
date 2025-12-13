import React, { createContext, useState, useContext } from 'react';
import { loginUser, fetchCurrentUser } from '../api/authApi';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Lazy init helpers to avoid setState in effects
const safeParseUser = () => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch (err) {
    console.error('Error parsing user data:', err);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return null;
  }
};

const safeGetToken = () => {
  const storedToken = localStorage.getItem('token');
  return storedToken || null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => safeParseUser());
  const [token, setToken] = useState(() => safeGetToken());
  // loading is used for actions (login)
  const [loading, setLoading] = useState(false);

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

  // Update user profile (e.g., after avatar change)
  const updateUserProfile = (updatedData) => {
    const base = user || {};
    const newUser = { ...base, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

return (
  <AuthContext.Provider value={{ user, token, login, logout, loading, loginWithToken, updateUserProfile }}>
    {!loading && children}
  </AuthContext.Provider>
);
};