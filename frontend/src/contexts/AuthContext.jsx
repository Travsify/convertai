import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('convertai_token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('convertai_token');
    return t ? decodeJWT(t) : null;
  });

  const login = (newToken) => {
    localStorage.setItem('convertai_token', newToken);
    setToken(newToken);
    setUser(decodeJWT(newToken));
  };

  const logout = () => {
    localStorage.removeItem('convertai_token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
