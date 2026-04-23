import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Alert, Tooltip, Snackbar
} from '@mui/material';
import {
  FolderOpen, Add, Key, ArrowForward, ContentCopy,
  Delete, Warning, CheckCircle, Edit, Logout, Person, Settings, Download,
  Visibility, VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../../services/authService';
import cms from '../../services/cms';

const HomePage = () => {
  const navigate = useNavigate();
  const { tenant, user, logout } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const [projects, setProjects] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '' });
  const [newProject, setNewProject] = useState({ name: '', slug: '' });
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newApiKey, setNewApiKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState({});

  useEffect(() => {
    localStorage.removeItem('project_id');
    localStorage.removeItem('active_project_id');
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projRes, keyRes] = await Promise.allSettled([
        cms.raw().get('/api/projects'),
        cms.raw().get('/api/api-keys'),
      ]);
      if (projRes.status === 'fulfilled') setProjects(projRes.value.data || []);
      if (keyRes.status === 'fulfilled') setApiKeys(keyRes.value.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const slug = newProject.slug || newProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const { data: created } = await cms.raw().post('/api/projects', { name: newProject.name, slug });
      setCreateOpen(false);
      setNewProject({ name: '', slug: '' });
      if (created?.apiKey && created?.apiSecret) {
        setNewApiKey({ projectName: newProject.name, key: created.apiKey, secret: created.apiSecret });
      }
      setSuccessMsg('Project created successfully');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleEditProject = async () => {
    if (!editForm.name.trim() || !editingProject) return;
    setUpdating(true);
    setError('');
    try {
      await cms.raw().put(`/api/projects/${editingProject.id}`, {
        name: editForm.name,
        slug: editForm.slug
      });
      setEditOpen(false);
      setEditingProject(null);
      setEditForm({ name: '', slug: '' });
      setSuccessMsg('Project updated successfully');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setUpdating(false);
    }
  };

  const openEditDialog = (project) => {
    setEditingProject(project);
    setEditForm({ name: project.name, slug: project.slug });
    setEditOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    setDeleting(true);
    try {
      await cms.raw().delete(`/api/projects/${projectId}`);
      setDeleteProject(null);
      setSuccessMsg('Project deleted successfully');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteKey = async (keyId) => {
    setDeleting(true);
    try {
      await cms.raw().delete(`/api/api-keys/${keyId}`);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete key:', err);
    } finally {
      setDeleting(false);
    }
  };

  const maskKey = (key) => {
    if (!key || key.length < 12) return key;
    return key.slice(0, 8) + '••••••••' + key.slice(-4);
  };

  const toggleKeyReveal = (keyId) => {
    setRevealedKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openProject = (projectId) => {
    localStorage.setItem('project_id', projectId);
    localStorage.setItem('active_project_id', projectId);
    navigate(`/p/${projectId}/dashboard`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (user?.fullName || user?.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Top Header Bar */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E2E8F0', px: { xs: 2, sm: 4 }, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <img src="/images/logo.svg" alt="Logo" style={{ height: 28 }} />
        </Box>
        <Box ref={profileRef} sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
          <Chip label={tenant?.plan?.displayName || tenant?.planName || 'Free'} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 600, fontSize: 11 }} />
          <IconButton onClick={() => setProfileMenuOpen(!profileMenuOpen)} size="small"
            sx={{ ml: 1, bgcolor: '#2563EB', color: '#fff', width: 36, height: 36, fontSize: 14, fontWeight: 700, '&:hover': { bgcolor: '#1D4ED8' } }}>
            {initials}
          </IconButton>
          {profileMenuOpen && (
            <Box sx={{ position: 'absolute', top: 44, right: 0, bgcolor: '#fff', borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #E2E8F0', width: 220, zIndex: 100, overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>{user?.fullName || 'User'}</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>{user?.email}</Typography>
              </Box>
              <Box sx={{ py: 0.5 }}>
                <Button fullWidth startIcon={<Person sx={{ fontSize: 18 }} />}
                  onClick={() => { setProfileMenuOpen(false); setSuccessMsg('Profile settings coming soon'); }}
                  sx={{ justifyContent: 'flex-start', px: 2, py: 1, textTransform: 'none', color: '#475569', fontSize: 13 }}>
                  Profile Settings
                </Button>
                <Button fullWidth startIcon={<Settings sx={{ fontSize: 18 }} />}
                  onClick={() => { setProfileMenuOpen(false); setSuccessMsg('Account settings coming soon'); }}
                  sx={{ justifyContent: 'flex-start', px: 2, py: 1, textTransform: 'none', color: '#475569', fontSize: 13 }}>
                  Account Settings
                </Button>
              </Box>
              <Box sx={{ borderTop: '1px solid #F1F5F9', py: 0.5 }}>
                <Button fullWidth startIcon={<Logout sx={{ fontSize: 18 }} />} onClick={handleLogout}
                  sx={{ justifyContent: 'flex-start', px: 2, py: 1, textTransform: 'none', color: '#DC2626', fontSize: 13, '&:hover': { bgcolor: '#FEF2F2' } }}>
                  Sign Out
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
      {/* Welcome */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#1E293B', letterSpacing: '-0.02em' }}>
          Welcome back, {user?.fullName || user?.email?.split('@')[0]}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', mt: 0.5 }}>
          Manage your projects and API keys
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { label: 'Projects', value: projects.length, icon: <FolderOpen />, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'API Keys', value: apiKeys.filter(k => !k.revokedAt).length, icon: <Key />, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Plan', value: tenant?.plan?.displayName || tenant?.planName || '—', icon: <CheckCircle />, color: '#8B5CF6', bg: '#F5F3FF', isText: true },
        ].map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', height: '100%' }} elevation={0}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3, height: '100%' }}>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: s.bg, color: s.color, display: 'flex' }}>{s.icon}</Box>
                <Box>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#1E293B' }}>{s.value}</Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>{s.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Projects */}
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>Projects</Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, bgcolor: '#2563EB', px: 3, '&:hover': { bgcolor: '#1D4ED8' } }}>
            New Project
          </Button>
        </Box>

        {projects.length === 0 ? (
          <Card sx={{ borderRadius: 3, border: '2px dashed #CBD5E1', boxShadow: 'none', p: 6, textAlign: 'center' }} elevation={0}>
            <FolderOpen sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>No projects yet</Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Create your first project to start building your site</Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={() => setCreateOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none' }}>Create Project</Button>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card sx={{
                  borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-2px)', borderColor: '#2563EB' }
                }} elevation={0} onClick={() => openProject(project.id)}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#EFF6FF' }}>
                        <FolderOpen sx={{ color: '#2563EB', fontSize: 24 }} />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Edit project">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEditDialog(project); }}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete project">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteProject(project); }}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E293B', flex: 1 }}>{project.name}</Typography>
                      <Chip label={project.status} size="small" sx={{
                        borderRadius: 1.5, fontWeight: 600, fontSize: 11,
                        bgcolor: project.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                        color: project.status === 'active' ? '#059669' : '#64748B'
                      }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace', display: 'block', mb: 1.5 }}>/{project.slug}</Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>Created {new Date(project.createdAt).toLocaleDateString()}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Open <ArrowForward sx={{ fontSize: 14 }} />
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* API Keys */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>API Keys</Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>Keys are auto-generated when you create a project</Typography>
        </Box>

        {apiKeys.length === 0 ? (
          <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: 'none', p: 4, textAlign: 'center' }} elevation={0}>
            <Typography variant="body2" sx={{ color: '#94A3B8' }}>No API keys yet — create a project to generate one</Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {apiKeys.map((key) => {
              const project = projects.find(p => p.id === key.projectId);
              return (
                <Card key={key.id} sx={{
                  borderRadius: 2.5, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  opacity: key.revokedAt ? 0.5 : 1,
                }} elevation={0}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: key.revokedAt ? '#F1F5F9' : '#ECFDF5' }}>
                      <Key sx={{ color: key.revokedAt ? '#94A3B8' : '#10B981', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>{key.name}</Typography>
                        {project && <Chip label={project.name} size="small" sx={{ borderRadius: 1, fontSize: 10, height: 20, bgcolor: '#EFF6FF', color: '#2563EB' }} />}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B' }}>
                          {revealedKeys[key.id] ? key.key : maskKey(key.key)}
                        </Typography>
                        <Tooltip title={revealedKeys[key.id] ? 'Hide key' : 'Show key'}>
                          <IconButton size="small" onClick={() => toggleKeyReveal(key.id)} sx={{ color: '#94A3B8', p: 0.3 }}>
                            {revealedKeys[key.id] ? <VisibilityOff sx={{ fontSize: 14 }} /> : <Visibility sx={{ fontSize: 14 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Copy key">
                          <IconButton size="small" onClick={() => copyToClipboard(key.key)} sx={{ color: '#94A3B8', p: 0.3 }}>
                            <ContentCopy sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Chip label={key.revokedAt ? 'Revoked' : 'Active'} size="small" sx={{
                      borderRadius: 1.5, fontWeight: 600, fontSize: 11,
                      bgcolor: key.revokedAt ? '#FEF2F2' : '#ECFDF5',
                      color: key.revokedAt ? '#DC2626' : '#059669'
                    }} />
                    {!key.revokedAt && (
                      <Tooltip title="Revoke key">
                        <IconButton size="small" onClick={() => setDeleteConfirm(key.id)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Create Project Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Create New Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>An API key will be auto-generated for this project</Typography>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Project Name" value={newProject.name} margin="normal" autoFocus
            onChange={(e) => setNewProject({ name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })} />
          <TextField fullWidth label="Slug" value={newProject.slug || newProject.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}
            margin="normal" onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
            helperText="URL-friendly identifier" InputProps={{ sx: { fontFamily: 'monospace' } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleCreateProject} variant="contained" disabled={!newProject.name.trim() || creating}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* API Credentials Dialog — secret shown once */}
      <Dialog open={!!newApiKey} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: '#10B981' }} />
          API Credentials Generated
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
            Save the API Secret now — it will NOT be shown again! Download the CSV for your records.
          </Alert>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>Project: <strong>{newApiKey?.projectName}</strong></Typography>

          <Typography variant="caption" fontWeight={600} sx={{ color: '#475569', mb: 0.5, display: 'block' }}>API Key (visible anytime)</Typography>
          <Box sx={{ bgcolor: '#F1F5F9', borderRadius: 2, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#1E293B', flex: 1, wordBreak: 'break-all', fontSize: 13 }}>
              {newApiKey?.key}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(newApiKey?.key)} sx={{ color: '#94A3B8' }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="caption" fontWeight={600} sx={{ color: '#DC2626', mb: 0.5, display: 'block' }}>API Secret (one-time only)</Typography>
          <Box sx={{ bgcolor: '#1E293B', borderRadius: 2, p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#F59E0B', flex: 1, wordBreak: 'break-all', fontSize: 13 }}>
              {newApiKey?.secret}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(newApiKey?.secret)} sx={{ color: copied ? '#10B981' : '#94A3B8' }}>
              {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Box>
          {copied && <Typography variant="caption" sx={{ color: '#10B981', mt: 0.5, display: 'block' }}>Copied to clipboard!</Typography>}

          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 2, display: 'block' }}>
            Use both key and secret to authenticate API requests: <code style={{ color: '#2563EB' }}>Authorization: Bearer key:secret</code>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button startIcon={<Download />} onClick={() => {
            const csv = `Project,API Key,API Secret\n"${newApiKey?.projectName}","${newApiKey?.key}","${newApiKey?.secret}"`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(newApiKey?.projectName || 'project').toLowerCase().replace(/\s+/g, '-')}-api-credentials.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }} variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#2563EB', color: '#2563EB' }}>
            Download CSV
          </Button>
          <Button onClick={() => setNewApiKey(null)} variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB' }}>
            I've Saved It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Edit Project</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
          <TextField fullWidth label="Project Name" value={editForm.name} margin="normal" autoFocus
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <TextField fullWidth label="Slug" value={editForm.slug}
            margin="normal" onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
            helperText="URL-friendly identifier" InputProps={{ sx: { fontFamily: 'monospace' } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleEditProject} variant="contained" disabled={!editForm.name.trim() || updating}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}>
            {updating ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Key Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>Revoke API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>This will immediately revoke the key. Any applications using it will lose access.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={() => handleDeleteKey(deleteConfirm)} variant="contained" disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Revoke Key'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Project Confirmation */}
      <Dialog open={!!deleteProject} onClose={() => setDeleteProject(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning sx={{ fontSize: 20 }} />
          Delete Project
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 1.5 }}>
            Are you sure you want to delete <strong>{deleteProject?.name}</strong>? This action cannot be undone.
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }} icon={<Warning />}>
            All content and API keys for this project will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteProject(null)} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={() => handleDeleteProject(deleteProject.id)} variant="contained" disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSuccessMsg('')} severity="success" sx={{ borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
    </Box>
  );
};

export default HomePage;
