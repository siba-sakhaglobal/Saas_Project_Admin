/**
 * CMS SDK instance — two-layer auth:
 * 1. JWT from login (user identity + permissions)
 * 2. API key from .env (project identification via /api/health/resolve-key)
 */

import { SakhaCMS } from '@sakha/cms-sdk-js';

const API_KEY = process.env.REACT_APP_API_KEY;
const API_SECRET = process.env.REACT_APP_API_SECRET;
const hasApiKey = !!(API_KEY && API_SECRET && !API_KEY.includes('REPLACE'));

const cms = new SakhaCMS({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  getToken: () => localStorage.getItem('access_token'),
  onAuthFailure: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('project_id');
    window.location.href = '/login';
  },
});

function syncHeaders() {
  const tenantId = localStorage.getItem('tenant_id');
  const projectId = localStorage.getItem('project_id');
  if (tenantId) cms.setHeader('X-Tenant-Id', tenantId);
  if (projectId) cms.setProjectId(projectId);
}

syncHeaders();

const origSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function (key, value) {
  origSetItem(key, value);
  if (key === 'tenant_id' || key === 'project_id') syncHeaders();
};

async function resolveProjectFromApiKey() {
  if (!hasApiKey) return null;
  try {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    const res = await fetch(`${baseUrl}/api/health/resolve-key?key=${encodeURIComponent(API_KEY)}`);
    if (!res.ok) return null;
    const json = await res.json();
    const info = json.data;
    if (info?.projectId) {
      localStorage.setItem('project_id', info.projectId);
      if (info.tenantId) localStorage.setItem('tenant_id', info.tenantId);
    }
    return info;
  } catch {
    return null;
  }
}

export { cms, hasApiKey, resolveProjectFromApiKey, API_KEY, API_SECRET };
export default cms;
