import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/authService';
import { User, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { hasApiKey } from '../../services/cms';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const basePath = hasApiKey ? '' : `/p/${localStorage.getItem('project_id')}`;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="sticky top-0 z-40 flex-shrink-0 flex h-14 bg-white border-b border-slate-200">
      <div className="flex-1 px-6 flex items-center justify-end">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-slate-900">
                  {user?.fullName || user?.email}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-slate-200 shadow-sm py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {user?.fullName || user?.email}
                      </div>
                      <div className="text-xs text-slate-500">{user?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button onClick={() => { navigate(`${basePath}/settings`); setShowUserMenu(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                    <User className="h-4 w-4 text-slate-400 mr-3" />
                    <div>
                      <div className="font-medium">Profile Settings</div>
                      <div className="text-xs text-slate-400">Manage your account</div>
                    </div>
                  </button>

                  <button onClick={() => { navigate(`${basePath}/settings`); setShowUserMenu(false); }}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors">
                    <SettingsIcon className="h-4 w-4 text-slate-400 mr-3" />
                    <div>
                      <div className="font-medium">System Settings</div>
                      <div className="text-xs text-slate-400">Configure preferences</div>
                    </div>
                  </button>
                </div>

                <div className="border-t border-slate-200 py-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-slate-400 mr-3" />
                    <div>
                      <div className="font-medium">Sign Out</div>
                      <div className="text-xs text-slate-400">End your session</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
