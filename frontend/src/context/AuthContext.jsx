import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || null);
  const [loading, setLoading] = useState(true);

  // Synchronize profile on initial load if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await userService.getProfile();
          if (res.code === 1000 && res.data) {
            setUser(res.data);
            localStorage.setItem('currentUser', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
          // If token expired, invalid, or user was locked (401/403)
          if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('currentUser');
            setToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res.code === 1000 && res.data) {
      const { accessToken, ...userData } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return userData;
    } else {
      throw new Error(res.message || 'Đăng nhập thất bại');
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.code === 1000 && res.data) {
      const { accessToken, ...userRes } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('currentUser', JSON.stringify(userRes));
      setToken(accessToken);
      setUser(userRes);
      return userRes;
    } else {
      throw new Error(res.message || 'Đăng ký thất bại');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newUserData = { ...prev, ...updatedData };
      localStorage.setItem('currentUser', JSON.stringify(newUserData));
      return newUserData;
    });
  };

  const isAdmin = user?.role === 'ROLE_ADMIN' || user?.role?.roleName === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
