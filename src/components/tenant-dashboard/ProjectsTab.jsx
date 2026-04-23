import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Tooltip, Snackbar, Skeleton
} from '@mui/material';
import {
  FolderOpen, Add, Edit, Delete, Warning, CheckCircle, ArrowForward, ContentCopy,
  Visibility, VisibilityOff, Download, CheckBox, CheckBoxOutlineBlank, Lock
} from '@mui/icons-material';
import cms from '../../services/cms';
import ProjectEditModal from './ProjectEditModal';

const ProjectsTab = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', slug: '' });
  const [creating, setCreating] = useState(false);
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);

  // Edit modal state
  const [editProject, setEditProject] = useState(null);

  // Delete confirmation
  const [deleteProject, setDeleteProject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // API credentials dialog
  const [newApiKey, setNewApiKey] = useState(null);
  const [copied, setCopied] = useState(false);

  // Reveal keys
  const [revealedKeys, setRevealedKeys] = useState({});

  useEffect(() => {
    loadProjects();
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const { data } = await cms.raw().get('/api/tenant-dashboard/modules');
      const moduleData = data || {};
      const all = [...(moduleData.coreModules || []), ...(moduleData.addonModules || [])];
      const enabled = all.filter(m => m.enabled);
      setAvailableModules(enabled);
      setSelectedModules(enabled.map(m => m.name));
    } catch { /* modules are optional */ }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await cms.raw().get('/api/projects');
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError('Failed to load projects. Please try again.');
      onError?.('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    setCreating(true);
    setError('');
    try {
      const slug = newProject.slug || newProject.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data: created } = await cms.raw().post('/api/projects', {
        name: newProject.name,
        slug
      });

      // Save selected modules to the new project
      if (created?.id && selectedModules.length > 0) {
        try {
          await cms.raw().patch(`/api/projects/${created.id}/modules`, {
            enabled: selectedModules,
          });
        } catch (err) {
          console.error('Failed to set project modules:', err);
        }
      }

      setCreateOpen(false);
      setNewProject({ name: '', slug: '' });

      if (created?.apiKey && created?.apiSecret) {
        setNewApiKey({
          projectName: newProject.name,
          key: created.apiKey,
          secret: created.apiSecret
        });
      }

      onSuccess?.('Project created successfully');
      loadProjects();
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Failed to create project';
      setError(errMsg);
      onError?.(errMsg);
    } finally {
      setCreating(false);
    }
  };


  const handleDeleteProject = async (projectId) => {
    setDeleting(true);
    try {
      await cms.raw().delete(`/api/projects/${projectId}`);
      setDeleteProject(null);
      onSuccess?.('Project deleted successfully');
      loadProjects();
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || err.message || 'Failed to delete project';
      setError(errMsg);
      onError?.(errMsg);
    } finally {
      setDeleting(false);
    }
  };

  const openProject = (projectId) => {
    localStorage.setItem('project_id', projectId);
    localStorage.setItem('active_project_id', projectId);
    navigate(`/p/${projectId}/dashboard`);
  };

  const maskKey = (key) => {
    if (!key || key.length < 12) return key;
    return key.slice(0, 8) + '••••••••' + key.slice(-4);
  };

  const toggleKeyReveal = (keyId) => {
    setRevealedKeys(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text); } else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rounded" width={150} height={40} />
        </Box>
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => { setSelectedModules(availableModules.map(m => m.name)); setCreateOpen(true); }}
          sx={{
            borderRadius: 2.5,
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#2563EB',
            px: 3,
            '&:hover': { bgcolor: '#1D4ED8' }
          }}
        >
          New Project
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Card sx={{
          borderRadius: 3,
          border: '2px dashed #CBD5E1',
          boxShadow: 'none',
          p: 6,
          textAlign: 'center'
        }} elevation={0}>
          <FolderOpen sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>No projects yet</Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Create your first project to start managing your site
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => { setSelectedModules(availableModules.map(m => m.name)); setCreateOpen(true); }}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Create Project
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {projects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <Card sx={{
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  transform: 'translateY(-2px)',
                  borderColor: '#2563EB'
                }
              }} elevation={0} onClick={() => openProject(project.id)}>
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#EFF6FF' }}>
                      <FolderOpen sx={{ color: '#2563EB', fontSize: 24 }} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit project">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditProject(project);
                          }}
                          sx={{
                            color: '#94A3B8',
                            '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete project">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteProject(project);
                          }}
                          sx={{
                            color: '#94A3B8',
                            '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E293B', flex: 1 }}>
                      {project.name}
                    </Typography>
                    <Chip
                      label={project.status}
                      size="small"
                      sx={{
                        borderRadius: 1.5,
                        fontWeight: 600,
                        fontSize: 11,
                        bgcolor: project.status === 'active' ? '#ECFDF5' : '#F1F5F9',
                        color: project.status === 'active' ? '#059669' : '#64748B'
                      }}
                    />
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94A3B8',
                      fontFamily: 'monospace',
                      display: 'block',
                      mb: 1.5
                    }}
                  >
                    /{project.slug}
                  </Typography>

                  <Typography variant="caption" sx={{ color: '#94A3B8', mb: 'auto' }}>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#2563EB',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      Open <ArrowForward sx={{ fontSize: 14 }} />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Project Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Create New Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            An API key will be auto-generated for this project
          </Typography>
          <TextField
            fullWidth
            label="Project Name"
            value={newProject.name}
            margin="normal"
            autoFocus
            onChange={(e) =>
              setNewProject({
                name: e.target.value,
                slug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
              })
            }
          />
          <TextField
            fullWidth
            label="Slug"
            value={
              newProject.slug ||
              newProject.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            }
            margin="normal"
            onChange={(e) => setNewProject({ ...newProject, slug: e.target.value })}
            helperText="URL-friendly identifier"
            InputProps={{ sx: { fontFamily: 'monospace' } }}
          />
          {availableModules.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>Modules</Typography>
                <Button size="small" onClick={() => {
                  const selectable = availableModules.filter(m => !m.system).map(m => m.name);
                  setSelectedModules(prev => prev.length >= selectable.length ? [] : selectable);
                }} sx={{ textTransform: 'none', fontSize: 12, color: '#2563EB' }}>
                  {selectedModules.length >= availableModules.filter(m => !m.system).length ? 'Deselect All' : 'Select All'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {availableModules.map((mod) => {
                  const isSystem = mod.system === true;
                  const selected = selectedModules.includes(mod.name);
                  return (
                    <Chip
                      key={mod.name}
                      label={mod.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      size="small"
                      onClick={isSystem ? undefined : () => setSelectedModules(prev =>
                        selected ? prev.filter(n => n !== mod.name) : [...prev, mod.name]
                      )}
                      icon={isSystem
                        ? <Lock sx={{ fontSize: 14 }} />
                        : selected ? <CheckBox sx={{ fontSize: 16 }} /> : <CheckBoxOutlineBlank sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: 1.5, fontWeight: 500, fontSize: 12,
                        cursor: isSystem ? 'not-allowed' : 'pointer',
                        opacity: isSystem ? 0.5 : 1,
                        bgcolor: isSystem ? '#F8FAFC' : selected ? '#EFF6FF' : '#F1F5F9',
                        color: isSystem ? '#94A3B8' : selected ? '#2563EB' : '#94A3B8',
                        border: isSystem ? '1px solid #E2E8F0' : selected ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                        '& .MuiChip-icon': { color: isSystem ? '#CBD5E1' : selected ? '#2563EB' : '#CBD5E1' },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateProject}
            variant="contained"
            disabled={!newProject.name.trim() || creating}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* API Credentials Dialog */}
      <Dialog open={!!newApiKey} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: '#10B981' }} />
          API Credentials Generated
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
            Save the API Secret now — it will NOT be shown again! Download the CSV for your records.
          </Alert>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
            Project: <strong>{newApiKey?.projectName}</strong>
          </Typography>

          <Typography variant="caption" fontWeight={600} sx={{ color: '#475569', mb: 0.5, display: 'block' }}>
            API Key (visible anytime)
          </Typography>
          <Box sx={{ bgcolor: '#F1F5F9', borderRadius: 2, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                color: '#1E293B',
                flex: 1,
                wordBreak: 'break-all',
                fontSize: 13
              }}
            >
              {newApiKey?.key}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(newApiKey?.key)} sx={{ color: '#94A3B8' }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="caption" fontWeight={600} sx={{ color: '#DC2626', mb: 0.5, display: 'block' }}>
            API Secret (one-time only)
          </Typography>
          <Box sx={{ bgcolor: '#1E293B', borderRadius: 2, p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                color: '#F59E0B',
                flex: 1,
                wordBreak: 'break-all',
                fontSize: 13
              }}
            >
              {newApiKey?.secret}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(newApiKey?.secret)} sx={{ color: copied ? '#10B981' : '#94A3B8' }}>
              {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Box>
          {copied && (
            <Typography variant="caption" sx={{ color: '#10B981', mt: 0.5, display: 'block' }}>
              Copied to clipboard!
            </Typography>
          )}

          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 2, display: 'block' }}>
            Use both key and secret to authenticate API requests: <code style={{ color: '#2563EB' }}>Authorization: Bearer key:secret</code>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            startIcon={<Download />}
            onClick={() => {
              const csv = `Project,API Key,API Secret\n"${newApiKey?.projectName}","${newApiKey?.key}","${newApiKey?.secret}"`;
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${(newApiKey?.projectName || 'project').toLowerCase().replace(/\s+/g, '-')}-api-credentials.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            variant="outlined"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              borderColor: '#2563EB',
              color: '#2563EB'
            }}
          >
            Download CSV
          </Button>
          <Button
            onClick={() => setNewApiKey(null)}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: '#2563EB'
            }}
          >
            I've Saved It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Edit Modal */}
      <ProjectEditModal
        open={!!editProject}
        project={editProject}
        onClose={() => setEditProject(null)}
        onSave={() => {
          setEditProject(null);
          loadProjects();
        }}
      />

      {/* Delete Project Confirmation */}
      <Dialog
        open={!!deleteProject}
        onClose={() => setDeleteProject(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
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
          <Button onClick={() => setDeleteProject(null)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteProject(deleteProject.id)}
            variant="contained"
            disabled={deleting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: '#EF4444',
              '&:hover': { bgcolor: '#DC2626' }
            }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectsTab;
