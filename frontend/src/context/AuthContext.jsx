import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('shopsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('shopsphere_token') || '');
  const [loading, setLoading] = useState(false);

  const saveSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem('shopsphere_token', nextToken);
    localStorage.setItem('shopsphere_user', JSON.stringify(nextUser));
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/users/login', { email, password });
      saveSession(res.data.token, res.data.user);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/users/register', payload);
      saveSession(res.data.token, res.data.user);
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (payload) => {
    const res = await api.put('/users/profile', payload);
    setUser(res.data.user);
    localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
    return res.data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('shopsphere_token');
    localStorage.removeItem('shopsphere_user');
  };

  useEffect(() => {
    if (token && !user) {
      api.get('/users/profile')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('shopsphere_user', JSON.stringify(res.data.user));
        })
        .catch(() => logout());
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token),
        isAdmin: user?.role === 'admin',
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
