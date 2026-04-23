import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Chip, Tooltip, IconButton, Skeleton, Checkbox, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Add, Edit, Delete, Save, Close, People } from '@mui/icons-material';
import cms from '../../services/cms';

const COLOR_MAP = {
  slate: '#64748B',
  blue: '#2563EB',
  green: '#10B981',
  amber: '#D97706',
  red: '#DC2626',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
};

const COLOR_PRESETS = ['slate', 'blue', 'green', 'amber', 'red', 'purple', 'pink', 'indigo'];
const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'publish', 'manage'];

const DesignationCard = ({ des, selected, onSelect, onEdit, onDelete, canDelete, deleteReason }) => (
  <Card onClick={onSelect} sx={{
    borderRadius: 2.5,
    border: selected ? '2px solid #2563EB' : '1px solid #E2E8F0',
    boxShadow: selected ? '0 0 0 3px rgba(37, 99, 235, 0.1)' : '0 1px 2px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    p: 2
  }} elevation={0}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLOR_MAP[des.color] || COLOR_MAP.slate }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B', mb: 0.25 }}>
          {des.name}
          {des.isDefault && <Chip label="Default" size="small" sx={{ ml: 1, height: 20, fontSize: 10, bgcolor: '#EFF6FF', color: '#2563EB' }} />}
        </Typography>
        {des.description && <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>{des.description}</Typography>}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Chip label={`${des._count?.members || 0}`} size="small" icon={<People sx={{ fontSize: 14 }} />}
          sx={{ height: 24, fontSize: 12, bgcolor: '#F1F5F9', color: '#64748B' }} />
        <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(); }}
          sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}><Edit fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={canDelete ? 'Delete' : deleteReason}><span>
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(); }} disabled={!canDelete}
            sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}><Delete fontSize="small" /></IconButton>
        </span></Tooltip>
      </Box>
    </Box>
  </Card>
);

const DesignationFormDialog = ({ open, onClose, title, form, setForm, onSubmit, loading, error }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
    <DialogContent>
      <Typography variant="body2" sx={{ color: '#64748B', mb: 2, mt: 1 }}>
        {title === 'Create Designation' ? 'Create a new custom role for your team' : 'Update designation details'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
      <TextField fullWidth label="Name" margin="normal" autoFocus value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <TextField fullWidth label="Description (Optional)" margin="normal" multiline rows={2} value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <FormControl fullWidth margin="normal">
        <InputLabel>Color</InputLabel>
        <Select label="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}>
          {COLOR_PRESETS.map(color => (
            <MenuItem key={color} value={color}><Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLOR_MAP[color], mr: 1 }} />
              {color.charAt(0).toUpperCase() + color.slice(1)}</MenuItem>
          ))}
        </Select>
      </FormControl>
      {title !== 'Create Designation' && <TextField fullWidth label="Sort Order" margin="normal" type="number"
        value={form.sortOrder || 0} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
      <Button onClick={onSubmit} variant="contained" disabled={!form.name.trim() || loading}
        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB' }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : (title === 'Create Designation' ? 'Create' : 'Save')}
      </Button>
    </DialogActions>
  </Dialog>
);

const DesignationsTab = () => {
  const [designations, setDesignations] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [newForm, setNewForm] = useState({ name: '', description: '', color: 'blue' });
  const [editForm, setEditForm] = useState({ name: '', description: '', color: 'blue', sortOrder: 0 });
  const [permissionChanges, setPermissionChanges] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [designRes, modulesRes] = await Promise.allSettled([
        cms.raw().get('/api/tenant-designations'),
        cms.raw().get('/api/tenant-designations/available-modules')
      ]);

      if (designRes.status === 'fulfilled') {
        const raw = designRes.value?.data ?? designRes.value;
        const data = Array.isArray(raw) ? raw : [];
        setDesignations(data);
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      }
      if (modulesRes.status === 'fulfilled') {
        const raw = modulesRes.value?.data ?? modulesRes.value;
        setModules(Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      console.error('Failed to load designations:', err);
      setError('Failed to load designations');
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load permissions when selection changes
  useEffect(() => {
    const selected = designations.find(d => d.id === selectedId);
    if (selected && selected.permissions) {
      const perms = {};
      PERMISSION_ACTIONS.forEach(action => {
        perms[action] = {};
        modules.forEach(mod => {
          const perm = selected.permissions.find(p => p.moduleName === mod.name && p.action === action);
          perms[action][mod.name] = perm ? perm.allowed : false;
        });
      });
      setOriginalPermissions(perms);
      setPermissionChanges({});
    }
  }, [selectedId, designations, modules]);

  const handleCreateDesignation = async () => {
    if (!newForm.name.trim()) {
      setFormError('Name is required');
      return;
    }

    setCreating(true);
    setFormError('');
    try {
      await cms.raw().post('/api/tenant-designations', {
        name: newForm.name,
        description: newForm.description || undefined,
        color: newForm.color
      });
      setCreateOpen(false);
      setNewForm({ name: '', description: '', color: 'blue' });
      loadData();
    } catch (err) {
      console.error('Failed to create designation:', err);
      setFormError(err.response?.data?.error?.message || err.message || 'Failed to create designation');
    } finally {
      setCreating(false);
    }
  };

  const handleEditDesignation = async () => {
    if (!editForm.name.trim()) {
      setFormError('Name is required');
      return;
    }

    setUpdating(true);
    setFormError('');
    try {
      await cms.raw().patch(`/api/tenant-designations/${selectedId}`, {
        name: editForm.name,
        description: editForm.description || undefined,
        color: editForm.color,
        sortOrder: editForm.sortOrder
      });
      setEditOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to update designation:', err);
      setFormError(err.response?.data?.error?.message || err.message || 'Failed to update designation');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDesignation = async (id) => {
    setDeleting(true);
    try {
      await cms.raw().delete(`/api/tenant-designations/${id}`);
      setDeleteConfirm(null);
      if (selectedId === id) setSelectedId(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete designation:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to delete designation');
    } finally {
      setDeleting(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedId) return;

    setSaving(true);
    try {
      const permissions = [];
      PERMISSION_ACTIONS.forEach(action => {
        modules.forEach(mod => {
          const originalAllow = originalPermissions[action]?.[mod.name] || false;
          const currentAllow = permissionChanges[action]?.[mod.name] !== undefined
            ? permissionChanges[action][mod.name]
            : originalAllow;
          permissions.push({
            moduleName: mod.name,
            action,
            allowed: currentAllow
          });
        });
      });

      await cms.raw().put(`/api/tenant-designations/${selectedId}/permissions`, { permissions });
      setPermissionChanges({});
      loadData();
    } catch (err) {
      console.error('Failed to save permissions:', err);
      setError(err.response?.data?.error?.message || err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (action, moduleName) => {
    const originalAllow = originalPermissions[action]?.[moduleName] || false;
    const currentAllow = permissionChanges[action]?.[moduleName] !== undefined
      ? permissionChanges[action][moduleName]
      : originalAllow;

    setPermissionChanges(prev => ({
      ...prev,
      [action]: {
        ...prev[action],
        [moduleName]: !currentAllow
      }
    }));
  };

  const formatModuleName = (name) => {
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const hasPermissionChanges = Object.keys(permissionChanges).length > 0;
  const selected = designations.find(d => d.id === selectedId);

  const openEditDialog = () => {
    if (selected) {
      setEditForm({
        name: selected.name,
        description: selected.description || '',
        color: selected.color || 'blue',
        sortOrder: selected.sortOrder || 0
      });
      setEditOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
            Designations & Permissions
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Manage custom roles for your team
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setCreateOpen(true); setFormError(''); }}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#2563EB' }}>
          New Designation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Designations List */}
        <Box sx={{ flex: 1, minWidth: 280 }}>
          {designations.length === 0 ? (
            <Card sx={{ borderRadius: 3, border: '2px dashed #CBD5E1', boxShadow: 'none', p: 6, textAlign: 'center' }} elevation={0}>
              <People sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>No designations yet</Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Create your first designation to assign team roles</Typography>
              <Button variant="outlined" startIcon={<Add />} onClick={() => { setCreateOpen(true); setFormError(''); }}
                sx={{ borderRadius: 2, textTransform: 'none' }}>Create Designation</Button>
            </Card>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {designations.map((des) => {
                const canDelete = !des.isDefault && (!des._count?.members || des._count.members === 0);
                const deleteReason = des.isDefault ? 'Default designation cannot be deleted' : 'Unassign members first';
                return (
                  <DesignationCard
                    key={des.id}
                    des={des}
                    selected={selectedId === des.id}
                    onSelect={() => setSelectedId(des.id)}
                    onEdit={openEditDialog}
                    onDelete={() => setDeleteConfirm(des.id)}
                    canDelete={canDelete}
                    deleteReason={deleteReason}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        {/* Permission Matrix */}
        {selected && (
          <Box sx={{ flex: 2, minWidth: 400 }}>
            <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} elevation={0}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1E293B', mb: 2 }}>
                  Permissions for <span style={{ color: COLOR_MAP[selected.color] || COLOR_MAP.slate }}>{selected.name}</span>
                </Typography>

                <TableContainer sx={{ maxHeight: 500, overflow: 'auto', mb: 2 }}>
                  <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                        <TableCell sx={{ fontWeight: 700, color: '#475569', py: 1.5, minWidth: 140 }}>Module</TableCell>
                        {PERMISSION_ACTIONS.map(action => (
                          <TableCell key={action} align="center" sx={{ fontWeight: 600, color: '#475569', py: 1.5, width: 60 }}>
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {modules.map((mod) => (
                        <TableRow key={mod.name} sx={{ borderBottom: '1px solid #E2E8F0', '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ color: '#1E293B', py: 1, fontWeight: 500 }}>
                            {formatModuleName(mod.name)}
                          </TableCell>
                          {PERMISSION_ACTIONS.map(action => {
                            const originalAllow = originalPermissions[action]?.[mod.name] || false;
                            const currentAllow = permissionChanges[action]?.[mod.name] !== undefined
                              ? permissionChanges[action][mod.name]
                              : originalAllow;
                            return (
                              <TableCell key={`${mod.name}-${action}`} align="center" sx={{ py: 1 }}>
                                <Checkbox
                                  checked={currentAllow}
                                  onChange={() => togglePermission(action, mod.name)}
                                  size="small"
                                  sx={{
                                    color: currentAllow ? '#10B981' : '#CBD5E1',
                                    '&.Mui-checked': { color: '#10B981' }
                                  }}
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {hasPermissionChanges && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: 13 }}>
                    You have unsaved permission changes.
                  </Alert>
                )}

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSavePermissions}
                    disabled={!hasPermissionChanges || saving}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#10B981' }}
                  >
                    {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Permissions'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setPermissionChanges({})}
                    disabled={!hasPermissionChanges}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#E2E8F0', color: '#64748B' }}
                  >
                    Discard Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      <DesignationFormDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setFormError(''); }}
        title="Create Designation"
        form={newForm}
        setForm={setNewForm}
        onSubmit={handleCreateDesignation}
        loading={creating}
        error={formError}
      />
      <DesignationFormDialog
        open={editOpen}
        onClose={() => { setEditOpen(false); setFormError(''); }}
        title="Edit Designation"
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleEditDesignation}
        loading={updating}
        error={formError}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>Delete Designation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            This will permanently delete the designation. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button onClick={() => handleDeleteDesignation(deleteConfirm)} variant="contained" disabled={deleting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}>
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DesignationsTab;
