import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('omniaudit_token') || '');
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }

  useEffect(() => {
    async function fetchUser() {
      if (!token) {
        // Default demo user profile if no token yet so user can explore right away
        setUser({
          id: 'demo_user_id',
          name: 'Demo Auditor',
          email: 'auditor@omniaudit.ai',
          organization: 'OmniAudit Enterprise',
          gstin: '27BBBBM8888M2Z4'
        });
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.warn("User auth check fallback:", err.message);
        setUser({
          id: 'demo_user_id',
          name: 'Demo Auditor',
          email: 'auditor@omniaudit.ai',
          organization: 'OmniAudit Enterprise',
          gstin: '27BBBBM8888M2Z4'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [token]);

  const login = (tokenData, userData) => {
    localStorage.setItem('omniaudit_token', tokenData);
    setToken(tokenData);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData}`;
  };

  const logout = () => {
    localStorage.removeItem('omniaudit_token');
    setToken('');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
