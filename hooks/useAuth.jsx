import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('lakbay_token');
        if (stored) {
          setToken(stored);
          setTokenState(stored);
          const { user } = await api.auth.me();
          setUser(user);
        }
      } catch { /* token expired or invalid */ }
      finally { setLoading(false); }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    await AsyncStorage.setItem('lakbay_token', res.token);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register({ name, email, password });
    await AsyncStorage.setItem('lakbay_token', res.token);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('lakbay_token');
    setToken(null);
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
