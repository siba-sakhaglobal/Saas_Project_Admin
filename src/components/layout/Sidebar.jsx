import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { hasApiKey } from '../../services/cms';
import cms from '../../services/cms';
import { getMenuItems } from '../../constants/moduleMenuMapping';

const Sidebar = () => {
  const location = useLocation();
  const { project, projectId } = useProject();
  const [menuItems, setMenuItems] = useState(() => getMenuItems([]));

  const basePath = hasApiKey ? '' : `/p/${projectId}`;

  useEffect(() => {
    if (hasApiKey) {
      cms.raw().get('/api/projects')
        .then(({ data }) => {
          const proj = Array.isArray(data) ? data[0] : data;
          if (proj?.id) {
            return cms.raw().get(`/api/projects/${proj.id}/modules`);
          }
        })
        .then(res => {
          if (res) {
            const modules = res.data?.enabled || res.data?.data?.enabled || [];
            setMenuItems(getMenuItems(modules));
          }
        })
        .catch(() => {});
      return;
    }

    if (!projectId) return;
    cms.raw().get(`/api/projects/${projectId}/modules`)
      .then(({ data }) => {
        const modules = data?.enabled || data?.data?.enabled || [];
        setMenuItems(getMenuItems(modules));
      })
      .catch(() => {});
  }, [projectId]);

  const isActive = (route) => {
    const fullPath = basePath ? `${basePath}/${route}` : `/${route}`;
    if (route === 'dashboard') return location.pathname === fullPath || location.pathname === '/';
    return location.pathname.startsWith(fullPath);
  };

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-50">
      <div className="flex flex-col flex-grow bg-white border-r border-slate-200 overflow-y-auto">
        <div className="flex-shrink-0 flex items-center justify-center py-5 border-b border-slate-200">
          <img
            src="/images/logo.svg"
            alt="Logo"
            className="h-8 object-contain"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <Sparkles className="w-6 h-6 text-blue-600 hidden" />
        </div>

        {!hasApiKey && (
          <div className="px-4 py-2">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Projects
            </Link>
          </div>
        )}

        <nav className="flex-1 px-3 py-2 space-y-0">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.route);
            const to = basePath ? `${basePath}/${item.route}` : `/${item.route}`;
            return (
              <Link
                key={item.key}
                to={to}
                className={`
                  flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-colors
                  ${active
                    ? 'bg-blue-50 text-blue-600 border-l-3 border-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-slate-200 px-4 py-3">
          <p className="text-xs text-slate-400">SaaS Project Admin</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
