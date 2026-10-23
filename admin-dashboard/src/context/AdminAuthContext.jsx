import React, { createContext, useContext, useState, useEffect } from 'react';

const BASE_URL = 'http://localhost:5000/api';

const AdminAuthContext = createContext(null);

const request = async (method, path, data, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (data) opts.body = JSON.stringify(data);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
};

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]   = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (t) {
      setToken(t);
      request('GET', '/auth/me', null, t)
        .then(r => { if (r.user?.role === 'admin') setAdmin(r.user); else logout(); })
        .catch(logout)
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await request('POST', '/auth/login', { email, password });
    if (res.user.role !== 'admin') throw new Error('Admin access only.');
    localStorage.setItem('admin_token', res.token);
    setToken(res.token);
    setAdmin(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null); setAdmin(null);
  };

  const api = {
    get:   (path)       => request('GET',    path, null, token),
    post:  (path, data) => request('POST',   path, data, token),
    patch: (path, data) => request('PATCH',  path, data, token),
    del:   (path)       => request('DELETE', path, null, token),
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout, api }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
