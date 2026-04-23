import { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { hasApiKey, resolveProjectFromApiKey } from './cms';

const authApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001'
});

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Resolve project from API key first (no auth needed)
        if (hasApiKey) await resolveProjectFromApiKey();

        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) { setLoading(false); return; }

        const storedUser = localStorage.getItem('user');
        const storedTenant = localStorage.getItem('tenant');
        if (storedUser && storedTenant) {
          setUser(JSON.parse(storedUser));
          setTenant(JSON.parse(storedTenant));
        }

        try {
          const res = await authApiClient.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const payload = res.data?.data ?? res.data;
          setUser(payload.user);
          setTenant(payload.tenant);
          localStorage.setItem('user', JSON.stringify(payload.user));
          localStorage.setItem('tenant', JSON.stringify(payload.tenant));
          if (payload.tenant?.id) localStorage.setItem('tenant_id', payload.tenant.id);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant');
          setUser(null);
          setTenant(null);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password, tenantSlug) => {
    try {
      const res = await authApiClient.post('/api/auth/login', { email, password, tenantSlug });
      const payload = res.data?.data ?? res.data;
      const { accessToken, refreshToken, user: newUser, tenant: newTenant } = payload;

      localStorage.setItem('access_token', accessToken);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('tenant', JSON.stringify(newTenant));
      localStorage.setItem('tenant_id', newTenant.id);

      setUser(newUser);
      setTenant(newTenant);

      // Re-resolve project so headers sync
      if (hasApiKey) await resolveProjectFromApiKey();

      return { success: true, user: newUser, tenant: newTenant };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        await authApiClient.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenant');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('project_id');
      localStorage.removeItem('active_project_id');
      setUser(null);
      setTenant(null);
    }
  };

  const value = {
    user, tenant, loading, hasApiKey,
    isAuthenticated: !!user && !!localStorage.getItem('access_token'),
    login, logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { authApiClient };
