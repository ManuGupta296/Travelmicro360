import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

// companyName is not in the login response body — decode it from the JWT so gating
// logic and the existing approver lookup can read user.companyName reliably.
function companyFromToken(token) {
  try {
    const part = (token || '').split('.')[1];
    if (!part) return null;
    let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    if (b64.length % 4) b64 += '='.repeat(4 - (b64.length % 4));
    return JSON.parse(atob(b64)).companyName ?? null;
  } catch { return null; }
}

function safeGetUser() {
  try {
    const stored = localStorage.getItem('t360_user');
    if (!stored || stored === 'undefined' || stored === 'null') {
      localStorage.removeItem('t360_user');
      localStorage.removeItem('user');
      return null;
    }
    const parsed = JSON.parse(stored);
    if (parsed && (parsed.companyName === undefined || parsed.companyName === null)) {
      const c = companyFromToken(localStorage.getItem('t360_token'));
      if (c) parsed.companyName = c;
    }
    // Also sync the 'user' key
    localStorage.setItem('user', JSON.stringify(parsed));
    return parsed;
  } catch {
    localStorage.removeItem('t360_user');
    localStorage.removeItem('user');
    return null;
  }
}

const ROLE_HOME = {
  TRAVELER: '/traveler/home',
  TRAVEL_AGENT: '/agent/dashboard',
  CORPORATE_MANAGER: '/corp/dashboard',
  FINANCE_OFFICER: '/finance/dashboard',
  COMPLIANCE_OFFICER: '/compliance/dashboard',
  ADMIN: '/admin/dashboard',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => safeGetUser());
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    if (!email || !password) { toast.error('Email and password required'); return null; }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, ...rest } = res.data;
      // Login response omits companyName; pull it from the JWT onto the user object.
      const userData = { ...rest, companyName: rest.companyName ?? companyFromToken(token) };
      localStorage.setItem('t360_token', token);
      localStorage.setItem('t360_user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      toast.success(`Welcome back, ${userData.name || userData.email}!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed — check credentials or backend';
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Merge profile edits into the current user and persist to localStorage so the
  // change reflects immediately (topbar, profile) and survives reloads.
  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...(prev || {}), ...updates };
      localStorage.setItem('t360_user', JSON.stringify(next));
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('t360_user');
    localStorage.removeItem('t360_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast('Logged out', { icon: '👋' });
  }, []);

  const getHomePath = useCallback(() => {
    if (!user) return '/login';
    return ROLE_HOME[user.role] || '/traveler/home';
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, isAuthenticated: !!user, getHomePath }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export { ROLE_HOME };
export default AuthContext;
