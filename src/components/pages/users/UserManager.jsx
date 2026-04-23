import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Search as SearchIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import cms from '../../../services/cms';
import AvatarUpload from '../../common/AvatarUpload';

// Utility: Format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Utility: Format date
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

// Utility: Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Stat Card Component
const StatCard = ({ label, value, icon, bgColor, iconColor }) => (
  <Card sx={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
    <CardContent>
      <Box display="flex" alignItems="flex-start" gap={1.5}>
        <Box sx={{ width: 40, height: 40, borderRadius: 1, backgroundColor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {React.cloneElement(icon, { sx: { color: iconColor, fontSize: 20 } })}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
            {label}
          </Typography>
          <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, color: '#1E293B' }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Create/Edit Dialog — dynamically loads signup fields from project config
const EndUserDialog = ({ open, user, onClose, onSuccess }) => {
  const [signupFields, setSignupFields] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '', status: 'active', metadata: {}, groupId: '', subgroupId: '' });
  const [loading, setLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    loadSignupFields();
    loadGroups();
    if (user) {
      const meta = user.metadata && typeof user.metadata === 'object' ? { ...user.metadata } : {};
      if (!meta.first_name && user.fullName) {
        const parts = user.fullName.trim().split(/\s+/);
        meta.first_name = parts[0] || '';
        meta.last_name = parts.slice(1).join(' ') || '';
      }
      if (!meta.mobile_number && user.phone) {
        meta.mobile_number = user.phone;
      }
      setFormData({
        email: user.email,
        password: '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        status: user.status || 'active',
        groupId: user.groupId || '',
        subgroupId: user.subgroupId || '',
        metadata: meta,
      });
    } else {
      setFormData({ email: '', password: '', fullName: '', phone: '', status: 'active', groupId: '', subgroupId: '', metadata: {} });
    }
    setError('');
  }, [user, open]);

  const loadSignupFields = async () => {
    setFieldsLoading(true);
    try {
      const { data } = await cms.raw().get('/api/signup-fields');
      const fields = Array.isArray(data) ? data : (data?.data || []);
      setSignupFields(fields.filter(f => f.active !== false).sort((a, b) => a.sortOrder - b.sortOrder));
    } catch { setSignupFields([]); }
    finally { setFieldsLoading(false); }
  };

  const loadGroups = async () => {
    try {
      const { data } = await cms.userGroups.tree();
      setGroups(Array.isArray(data) ? data : []);
    } catch { setGroups([]); }
  };

  const handleChange = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));
  const handleMeta = (key, value) => setFormData(prev => ({ ...prev, metadata: { ...prev.metadata, [key]: value } }));

  const handleSubmit = async () => {
    setError('');
    if (!user && (!formData.email || !formData.password)) {
      setError('Email and password are required');
      return;
    }
    // Check required signup fields
    for (const f of signupFields) {
      if (f.required) {
        const val = formData.metadata[f.key];
        if (!val && val !== 0 && val !== false) {
          setError(`${f.label} is required`);
          return;
        }
      }
    }
    setLoading(true);
    try {
      const fullName = [formData.metadata.first_name, formData.metadata.last_name].filter(Boolean).join(' ') || formData.fullName;
      const phone = formData.metadata.mobile_number || formData.phone;
      if (user) {
        const updateData = { fullName, phone, status: formData.status, metadata: formData.metadata };
        if (formData.password) updateData.password = formData.password;
        if (formData.groupId) updateData.groupId = formData.groupId;
        if (formData.subgroupId) updateData.subgroupId = formData.subgroupId;
        await cms.raw().put(`/api/end-user-admin/${user.id}`, updateData);
      } else {
        const payload = {
          email: formData.email, password: formData.password,
          fullName, phone, status: formData.status, metadata: formData.metadata,
        };
        if (formData.groupId) payload.groupId = formData.groupId;
        if (formData.subgroupId) payload.subgroupId = formData.subgroupId;
        await cms.raw().post('/api/end-user-admin', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to save user');
    } finally { setLoading(false); }
  };

  const isCreate = !user;

  const renderField = (field) => {
    const val = formData.metadata[field.key] ?? '';
    switch (field.type) {
      case 'select':
        return (
          <FormControl key={field.key} fullWidth size="small">
            <InputLabel>{field.label}{field.required ? ' *' : ''}</InputLabel>
            <Select value={val} label={field.label} onChange={(e) => handleMeta(field.key, e.target.value)}>
              {(field.options || []).map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </Select>
            {field.helpText && <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, ml: 1.5 }}>{field.helpText}</Typography>}
          </FormControl>
        );
      case 'date': case 'datetime':
        return (
          <TextField key={field.key} fullWidth size="small" type={field.type === 'datetime' ? 'datetime-local' : 'date'}
            label={field.label + (field.required ? ' *' : '')} value={val}
            onChange={(e) => handleMeta(field.key, e.target.value)}
            InputLabelProps={{ shrink: true }} helperText={field.helpText} />
        );
      case 'checkbox':
        return (
          <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input type="checkbox" checked={!!val} onChange={(e) => handleMeta(field.key, e.target.checked)} />
            <Typography variant="body2" sx={{ color: '#475569' }}>{field.label}{field.required ? ' *' : ''}</Typography>
          </Box>
        );
      case 'file':
        return (
          <TextField key={field.key} fullWidth size="small" type="text"
            label={field.label + (field.required ? ' *' : '')} value={val}
            onChange={(e) => handleMeta(field.key, e.target.value)}
            placeholder="URL or file path" helperText={field.helpText || 'File upload coming soon — enter URL for now'} />
        );
      default:
        return (
          <TextField key={field.key} fullWidth size="small"
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'number' || field.type === 'integer' ? 'number' : 'text'}
            label={field.label + (field.required ? ' *' : '')} value={val}
            onChange={(e) => handleMeta(field.key, e.target.value)}
            placeholder={field.placeholder || ''} helperText={field.helpText}
            multiline={field.type === 'textarea'} rows={field.type === 'textarea' ? 3 : undefined} />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
      <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
        {isCreate ? 'Create End User' : 'Edit End User'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>{error}</Alert>}
        {fieldsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Profile Picture — always at top */}
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
              <AvatarUpload
                value={formData.metadata?.profile_picture || user?.avatarUrl}
                initials={
                  [formData.metadata?.first_name, formData.metadata?.last_name]
                    .filter(Boolean).map(n => n[0]).join('').toUpperCase() || '?'
                }
                size={100}
                onChange={(url) => handleMeta('profile_picture', url)}
                onUpload={async (blob, fileName, contentType) => {
                  try {
                    const endpoint = user
                      ? `/api/end-user-admin/${user.id}/avatar-upload-url`
                      : '/api/end-user-admin/presign-avatar';
                    const { data } = await cms.raw().post(endpoint, { contentType, fileName });
                    const uploadData = data?.data || data;
                    await fetch(uploadData.uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': contentType } });
                    return uploadData.publicUrl;
                  } catch (err) {
                    console.error('Avatar upload failed:', err);
                    throw err;
                  }
                }}
              />
            </Box>

            {isCreate && (
              <>
                <TextField fullWidth size="small" label="Email *" value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)} type="email" />
                <TextField fullWidth size="small" label="Password *" type="password"
                  value={formData.password} onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min 8 characters" helperText="Minimum 8 characters" />
              </>
            )}

            {signupFields.length > 0 && (
              <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 2 }}>
                <Typography variant="caption" fontWeight={600} sx={{ color: '#1E293B', mb: 1.5, display: 'block' }}>
                  Profile Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {signupFields.filter(f => f.key !== 'profile_picture').map(renderField)}
                </Box>
              </Box>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Group</InputLabel>
              <Select value={formData.groupId} label="Group" onChange={(e) => handleChange('groupId', e.target.value)}>
                <MenuItem value="">No Group</MenuItem>
                {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </Select>
            </FormControl>

            {formData.groupId && (
              <FormControl fullWidth size="small">
                <InputLabel>Subgroup</InputLabel>
                <Select value={formData.subgroupId} label="Subgroup" onChange={(e) => handleChange('subgroupId', e.target.value)}>
                  <MenuItem value="">No Subgroup</MenuItem>
                  {(groups.find(g => g.id === formData.groupId)?.subgroups || []).map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            )}

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} label="Status" onChange={(e) => handleChange('status', e.target.value)}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                {!isCreate && <MenuItem value="deleted">Deleted</MenuItem>}
              </Select>
            </FormControl>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}
          sx={{ bgcolor: '#2563EB', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 1, '&:hover': { bgcolor: '#1D4ED8' } }}>
          {loading ? <CircularProgress size={20} color="inherit" /> : (isCreate ? 'Create' : 'Save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// User Detail Dialog Component — loads signup fields for proper labels
const UserDetailDialog = ({ open, user, onClose, onEdit, onDelete }) => {
  const [signupFields, setSignupFields] = useState([]);

  useEffect(() => {
    if (!open) return;
    cms.raw().get('/api/signup-fields')
      .then(({ data }) => {
        const fields = Array.isArray(data) ? data : (data?.data || []);
        setSignupFields(fields.filter(f => f.active !== false).sort((a, b) => a.sortOrder - b.sortOrder));
      })
      .catch(() => setSignupFields([]));
  }, [open]);

  if (!user) return null;

  const metadata = user.metadata && typeof user.metadata === 'object' ? user.metadata : {};
  const profilePicture = metadata.profile_picture || user.avatarUrl;
  const userInitials = [metadata.first_name, metadata.last_name]
    .filter(Boolean).map(n => n[0]).join('').toUpperCase() || user.fullName?.[0]?.toUpperCase() || '?';

  const fieldLabel = (key) => {
    const field = signupFields.find(f => f.key === key);
    if (field) return field.label;
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatFieldValue = (key, val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    const field = signupFields.find(f => f.key === key);
    if (field?.type === 'select' || field?.type === 'radio') {
      const opt = (field.options || []).find(o => o.value === val);
      return opt ? opt.label : String(val);
    }
    if (field?.type === 'date') return formatDate(val);
    if (field?.type === 'datetime') return new Date(val).toLocaleString();
    return String(val);
  };

  const profileFields = Object.entries(metadata).filter(([k]) => k !== 'profile_picture');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
      <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>User Details</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
            <Box sx={{
              width: 100, height: 100, borderRadius: '50%', overflow: 'hidden',
              border: '3px solid #E2E8F0', bgcolor: '#EFF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {profilePicture ? (
                <img src={profilePicture} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Typography sx={{ fontSize: 35, fontWeight: 700, color: '#2563EB' }}>{userInitials}</Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B' }}>
              {user.fullName || user.email}
            </Typography>
            {user.fullName && (
              <Typography sx={{ fontFamily: 'monospace', color: '#64748B', fontSize: '0.8125rem' }}>
                {user.email}
              </Typography>
            )}
          </Box>

          {/* Status & Verification Row */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Chip
              label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              size="small"
              sx={
                user.status === 'active'
                  ? { backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 600 }
                  : user.status === 'suspended'
                  ? { backgroundColor: '#FEF3C7', color: '#D97706', fontWeight: 600 }
                  : { backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 600 }
              }
            />
            <Chip
              icon={user.emailVerifiedAt ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
              label={user.emailVerifiedAt ? 'Email Verified' : 'Not Verified'}
              size="small"
              sx={user.emailVerifiedAt
                ? { backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 600 }
                : { backgroundColor: '#F1F5F9', color: '#94A3B8', fontWeight: 600 }
              }
            />
          </Box>

          {/* Info Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', mb: 0.25 }}>Phone</Typography>
              <Typography sx={{ color: '#1E293B', fontSize: '0.875rem' }}>{user.phone || '—'}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', mb: 0.25 }}>Joined</Typography>
              <Typography sx={{ color: '#1E293B', fontSize: '0.875rem' }}>{formatDate(user.createdAt)}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', mb: 0.25 }}>Last Login</Typography>
              <Typography sx={{ color: '#1E293B', fontSize: '0.875rem' }}>{formatRelativeTime(user.lastLoginAt)}</Typography>
            </Box>
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', mb: 0.25 }}>Verified On</Typography>
              <Typography sx={{ color: '#1E293B', fontSize: '0.875rem' }}>{user.emailVerifiedAt ? formatDate(user.emailVerifiedAt) : '—'}</Typography>
            </Box>
          </Box>

          {/* Profile Details from signup fields */}
          {profileFields.length > 0 && (
            <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 2 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B', textTransform: 'uppercase', mb: 1.5 }}>
                Profile Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {profileFields.map(([key, value]) => (
                  <Box key={key} sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1 }}>
                    <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', mb: 0.25 }}>
                      {fieldLabel(key)}
                    </Typography>
                    <Typography sx={{ color: '#1E293B', fontSize: '0.875rem' }}>
                      {formatFieldValue(key, value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={() => { onClose(); onDelete(user.id); }}
          sx={{ color: '#DC2626', textTransform: 'none', fontWeight: 600 }}
        >
          Delete
        </Button>
        <Button onClick={onClose} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>
          Close
        </Button>
        <Button
          onClick={() => { onClose(); onEdit(user); }}
          sx={{
            backgroundColor: '#2563EB',
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1,
            '&:hover': { backgroundColor: '#1e40af' }
          }}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Component
const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    verifiedEmail: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [groupId, setGroupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch,
        status: status || undefined,
        groupId: groupId || undefined
      };
      const { data } = await cms.raw().get('/api/end-user-admin', { params });
      const users = Array.isArray(data) ? data : (data?.data || []);
      setUsers(users);
      setTotalPages(Math.ceil((users.length >= limit ? (page + 1) * limit : page * limit) / limit));
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, status, groupId]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await cms.raw().get('/api/end-user-admin/stats');
      const statsData = data?.data || data || {};
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const { data } = await cms.userGroups.tree();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handle delete
  const handleDelete = async (userId) => {
    if (!deleteConfirm) return;
    try {
      await cms.raw().delete(`/api/end-user-admin/${userId}`);
      setDeleteConfirm(null);
      setDetailUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  // Handle reset password
  const handleResetPassword = async (userId, newPassword) => {
    try {
      await cms.raw().post(`/api/end-user-admin/${userId}/reset-password`, { newPassword });
      alert('Password reset successfully');
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const params = {
        search: debouncedSearch,
        status: status || undefined
      };
      const { data } = await cms.raw().get('/api/end-user-admin', { params });
      const userList = Array.isArray(data) ? data : (data?.data || []);

      const headers = ['Email', 'Full Name', 'Phone', 'Status', 'Email Verified', 'Last Login', 'Joined'];
      const rows = userList.map(u => [
        u.email,
        u.fullName || '—',
        u.phone || '—',
        u.status,
        u.emailVerifiedAt ? 'Yes' : 'No',
        formatRelativeTime(u.lastLoginAt),
        formatDate(u.createdAt)
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `end-users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export CSV');
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Top Actions */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>
          End Users
        </Typography>
        <Box display="flex" gap={1.5}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{
              borderColor: '#E2E8F0',
              color: '#475569',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' }
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              backgroundColor: '#2563EB',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1e40af' }
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Stats Cards — CSS grid, full width, equal height */}
      {stats && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}>
          <StatCard label="Total Users" value={stats.total || 0} icon={<PeopleIcon />} bgColor="#EFF6FF" iconColor="#2563EB" />
          <StatCard label="Active" value={stats.active || 0} icon={<CheckCircleIcon />} bgColor="#ECFDF5" iconColor="#059669" />
          <StatCard label="Suspended" value={stats.suspended || 0} icon={<LockIcon />} bgColor="#FEF3C7" iconColor="#D97706" />
          <StatCard label="Email Verified" value={stats.verifiedEmail || 0} icon={<CheckCircleIcon />} bgColor="#F5F3FF" iconColor="#7C3AED" />
        </Box>
      )}

      {/* Search & Filters */}
      <Paper sx={{ p: 2, mb: 3, backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 200px 200px' }, gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#94A3B8' }} /> }}
            variant="outlined"
            size="small"
          />
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </Select>
            </FormControl>
          <FormControl fullWidth size="small">
            <InputLabel>Group</InputLabel>
            <Select
              value={groupId}
              label="Group"
              onChange={(e) => {
                setGroupId(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="">All Groups</MenuItem>
              {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Users Table */}
      <Paper sx={{ backgroundColor: '#ffffff', border: '1px solid #E2E8F0', borderRadius: 1.5, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Group</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Email Verified</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Last Login</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.8125rem', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                    No end users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{
                      borderBottom: '1px solid #E2E8F0',
                      '&:hover': { backgroundColor: '#F8FAFC' },
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => setDetailUser(user)}
                  >
                    <TableCell sx={{ color: '#1E293B', fontSize: '0.875rem', fontWeight: 500 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={user.metadata?.profile_picture || user.avatarUrl}
                          sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB' }}
                        >
                          {(user.fullName || user.email)?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        {user.fullName || '—'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.875rem' }}>
                      {user.email}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.875rem' }}>
                      {user.phone || '—'}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem' }}>
                      {user.group ? (
                        <Chip
                          label={user.group.name}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: user.group.color + '20',
                            color: user.group.color,
                            height: 24
                          }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        size="small"
                        sx={
                          user.status === 'active'
                            ? { backgroundColor: '#ECFDF5', color: '#059669', fontWeight: 600 }
                            : user.status === 'suspended'
                            ? { backgroundColor: '#FEF3C7', color: '#D97706', fontWeight: 600 }
                            : { backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 600 }
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.875rem' }}>
                      {user.emailVerifiedAt ? (
                        <CheckCircleIcon sx={{ fontSize: 18, color: '#059669' }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.875rem' }}>
                      {formatRelativeTime(user.lastLoginAt)}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.875rem' }}>
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => setDetailUser(user)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', backgroundColor: '#EFF6FF' } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => setEditingUser(user)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', backgroundColor: '#EFF6FF' } }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => setDeleteConfirm(user.id)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', backgroundColor: '#FEE2E2' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #E2E8F0' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Create Dialog */}
      <EndUserDialog
        open={openCreateDialog || !!editingUser}
        user={editingUser}
        onClose={() => {
          setOpenCreateDialog(false);
          setEditingUser(null);
        }}
        onSuccess={() => {
          fetchUsers();
          fetchStats();
          setOpenCreateDialog(false);
          setEditingUser(null);
        }}
      />

      {/* Detail Dialog */}
      <UserDetailDialog
        open={!!detailUser}
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onEdit={(user) => {
          setDetailUser(null);
          setEditingUser(user);
        }}
        onDelete={(userId) => setDeleteConfirm(userId)}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            Are you sure you want to delete this end user? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm(null)}
            sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDelete(deleteConfirm)}
            sx={{ color: '#DC2626', textTransform: 'none', fontWeight: 600 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManager;
