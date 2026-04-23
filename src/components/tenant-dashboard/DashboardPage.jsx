import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, IconButton, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Alert, Snackbar
} from '@mui/material';
import {
  Dashboard, FolderOpen, People, Key, ShoppingCart, Receipt, VerifiedUser, History,
  Logout, Person, Settings, Badge
} from '@mui/icons-material';
import { useAuth } from '../../services/authService';
import cms from '../../services/cms';
import OverviewTab from './OverviewTab';
import ProjectsTab from './ProjectsTab';
import MembersTab from './MembersTab';
import ApiKeysTab from './ApiKeysTab';
import OrdersTab from './OrdersTab';
import TransactionsTab from './TransactionsTab';
import DesignationsTab from './DesignationsTab';
import KycTab from './KycTab';
import ActivityTab from './ActivityTab';

const TAB_CONFIGS = [
  { label: 'Overview', icon: <Dashboard />, key: 'overview' },
  { label: 'Projects', icon: <FolderOpen />, key: 'projects' },
  { label: 'Members', icon: <People />, key: 'members' },
  { label: 'Designations', icon: <Badge />, key: 'designations' },
  { label: 'API Keys', icon: <Key />, key: 'api-keys' },
  { label: 'Orders', icon: <ShoppingCart />, key: 'orders' },
  { label: 'Transactions', icon: <Receipt />, key: 'transactions' },
  { label: 'KYC', icon: <VerifiedUser />, key: 'kyc' },
  { label: 'Activity', icon: <History />, key: 'activity' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { tenant, user, logout } = useAuth();
  const profileRef = useRef(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // Clean localStorage on mount
  useEffect(() => {
    localStorage.removeItem('project_id');
    localStorage.removeItem('active_project_id');
  }, []);

  // Sync URL hash with tab state
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const tabIndex = TAB_CONFIGS.findIndex(t => t.key === hash);
      if (tabIndex >= 0) setActiveTab(tabIndex);
    }
  }, []);

  // Profile menu click-outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    window.location.hash = TAB_CONFIGS[newValue].key;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (user?.fullName || user?.email || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Sticky Header */}
      <Box sx={{
        bgcolor: '#fff',
        borderBottom: '1px solid #E2E8F0',
        px: { xs: 2, sm: 4 },
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src="/images/logo.svg"
            alt="Logo"
            style={{ height: 28 }}
          />
        </Box>
        <Box ref={profileRef} sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
          <Chip
            label={tenant?.plan?.displayName || tenant?.planName || 'Free'}
            size="small"
            sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: 11 }}
          />
          <IconButton
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            size="small"
            sx={{
              ml: 1,
              bgcolor: '#2563EB',
              color: '#fff',
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 700,
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            {initials}
          </IconButton>
          {profileMenuOpen && (
            <Box sx={{
              position: 'absolute',
              top: 44,
              right: 0,
              bgcolor: '#fff',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              border: '1px solid #E2E8F0',
              width: 220,
              zIndex: 100,
              overflow: 'hidden'
            }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>
                  {user?.fullName || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>{user?.email}</Typography>
              </Box>
              <Box sx={{ py: 0.5 }}>
                <Button
                  fullWidth
                  startIcon={<Person sx={{ fontSize: 18 }} />}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setSuccessMsg('Profile settings coming soon');
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    color: '#475569',
                    fontSize: 13
                  }}
                >
                  Profile Settings
                </Button>
                <Button
                  fullWidth
                  startIcon={<Settings sx={{ fontSize: 18 }} />}
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setSuccessMsg('Account settings coming soon');
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    color: '#475569',
                    fontSize: 13
                  }}
                >
                  Account Settings
                </Button>
              </Box>
              <Box sx={{ borderTop: '1px solid #F1F5F9', py: 0.5 }}>
                <Button
                  fullWidth
                  startIcon={<Logout sx={{ fontSize: 18 }} />}
                  onClick={handleLogout}
                  sx={{
                    justifyContent: 'flex-start',
                    px: 2,
                    py: 1,
                    textTransform: 'none',
                    color: '#DC2626',
                    fontSize: 13,
                    '&:hover': { bgcolor: '#FEF2F2' }
                  }}
                >
                  Sign Out
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 56, zIndex: 40 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              minHeight: 56,
              color: '#64748B',
              '&.Mui-selected': { color: '#2563EB' },
              '.MuiSvgIcon-root': { mr: 0.5, fontSize: 20 }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#2563EB', height: 3 }
          }}
        >
          {TAB_CONFIGS.map((tab) => (
            <Tab key={tab.key} label={tab.label} icon={tab.icon} iconPosition="start" />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
        {activeTab === 0 && <OverviewTab onActivityClick={() => setActiveTab(8)} onTabSwitch={(tab) => setActiveTab(tab)} />}
        {activeTab === 1 && <ProjectsTab onSuccess={(msg) => setSuccessMsg(msg)} onError={(msg) => setError(msg)} />}
        {activeTab === 2 && <MembersTab />}
        {activeTab === 3 && <DesignationsTab />}
        {activeTab === 4 && <ApiKeysTab />}
        {activeTab === 5 && <OrdersTab />}
        {activeTab === 6 && <TransactionsTab />}
        {activeTab === 7 && <KycTab />}
        {activeTab === 8 && <ActivityTab />}
      </Box>

      {/* Success Notification */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>

      {/* Error Notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
