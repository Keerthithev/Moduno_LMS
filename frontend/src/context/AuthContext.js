import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage with validation
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        // Validate required fields
        if (parsed && parsed._id && parsed.email && parsed.role) {
          return parsed;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const savedToken = localStorage.getItem('token');
    return savedToken || null;
  });

  // Update axios defaults when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [token]);

  // Update localStorage when user changes
  useEffect(() => {
    if (user) {
      // Ensure user data is properly structured before saving
      const userData = {
        _id: user._id,
        name: user.name || '',
        email: user.email,
        role: user.role,
        subscriptionExpiry: user.subscriptionExpiry
      };
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (token, userData) => {
    // Validate and normalize user data
    if (!userData || !userData._id || !userData.email || !userData.role) {
      console.error('Invalid user data provided to login');
      return;
    }

    const normalizedUser = {
      _id: userData._id,
      name: userData.name || '',
      email: userData.email,
      role: userData.role,
      subscriptionExpiry: userData.subscriptionExpiry
    };

    setToken(token);
    setUser(normalizedUser);

    // Update localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Reset state
    setToken(null);
    setUser(null);
    
    // Clear axios headers
    delete axios.defaults.headers.common['Authorization'];
  };

  // Add a method to update user data
  const updateUser = (newData) => {
    if (user && newData) {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      updateUser,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
