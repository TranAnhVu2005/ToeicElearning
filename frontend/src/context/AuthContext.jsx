import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { shouldClearSession } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      localStorage.removeItem('currentUser');
      return null;
    }
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
          console.warn('Could not synchronize current user profile.', {
            status: err.response?.status ?? null,
          });
          // Keep the session for ordinary 403 role/resource denials.
          if (shouldClearSession(err)) {
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

  const loginWithGoogle = async (idToken) => {
    const res = await authService.loginWithGoogle(idToken);
    if (res.code === 1000 && res.data) {
      const { accessToken, ...userData } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      setToken(accessToken);
      setUser(userData);
      return userData;
    } else {
      throw new Error(res.message || 'Đăng nhập với Google thất bại');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    setToken(null);
    setUser(null);
  };

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const newUserData = { ...prev, ...updatedData };
      localStorage.setItem('currentUser', JSON.stringify(newUserData));
      return newUserData;
    });
  }, []);

  const isAdmin =
    user?.role === 'ROLE_ADMIN' ||
    user?.roleName === 'ROLE_ADMIN' ||
    user?.role?.roleName === 'ROLE_ADMIN';

  const isTeacher =
    user?.role === 'ROLE_TEACHER' ||
    user?.roleName === 'ROLE_TEACHER' ||
    user?.role?.roleName === 'ROLE_TEACHER';

  const canManageTests = Boolean(isAdmin || isTeacher);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
        isAdmin,
        isTeacher,
        canManageTests,
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
