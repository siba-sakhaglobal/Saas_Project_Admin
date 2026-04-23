import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Collapse,
  CircularProgress,
  Skeleton,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import cms from '../../../services/cms';

const COLOR_PRESETS = [
  '#2563EB', '#1E40AF', '#DC2626', '#EA580C', '#D97706',
  '#CA8A04', '#16A34A', '#059669', '#0891B2', '#7C3AED',
  '#EC4899', '#F97316', '#6366F1', '#06B6D4'
];

const UserGroupsTab = ({ project, onSnackbar }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [createDialog, setCreateDialog] = useState(false);
  const [subgroupDialog, setSubgroupDialog] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingSubgroup, setEditingSubgroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLOR_PRESETS[0], description: '' });
  const [subgroupName, setSubgroupName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadGroups();
  }, [project]);

  const headers = project?.id ? { 'X-Project-Id': project.id } : {};

  const loadGroups = async () => {
    setLoading(true);
    try {
      const { data } = await cms.raw().get('/api/user-groups/', { headers });
      const groups = Array.isArray(data) ? data : (data?.data || data || []);
      setGroups(groups);
    } catch (err) {
      onSnackbar?.('Failed to load groups', 'error');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefault = async () => {
    setSaving(true);
    try {
      await cms.raw().post('/api/user-groups/seed-default', {}, { headers });
      onSnackbar?.('Default group created', 'success');
      loadGroups();
    } catch (err) {
      onSnackbar?.(err.response?.data?.error?.message || 'Failed to seed default group', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      onSnackbar?.('Group name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await cms.raw().post('/api/user-groups', {
        name: formData.name,
        color: formData.color,
        description: formData.description
      }, { headers });
      onSnackbar?.('Group created', 'success');
      setCreateDialog(false);
      setFormData({ name: '', color: COLOR_PRESETS[0], description: '' });
      setEditingGroup(null);
      loadGroups();
    } catch (err) {
      onSnackbar?.(err.response?.data?.error?.message || 'Failed to create group', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditGroup = async () => {
    if (!formData.name.trim()) {
      onSnackbar?.('Group name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await cms.raw().put(`/api/user-groups/${editingGroup.id}`, {
        name: formData.name,
        color: formData.color,
        description: formData.description
      }, { headers });
      onSnackbar?.('Group updated', 'success');
      setCreateDialog(false);
      setFormData({ name: '', color: COLOR_PRESETS[0], description: '' });
      setEditingGroup(null);
      loadGroups();
    } catch (err) {
      onSnackbar?.(err.response?.data?.error?.message || 'Failed to update group', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteConfirm?.groupId) return;
    setSaving(true);
    try {
      await cms.raw().delete(`/api/user-groups/${deleteConfirm.groupId}`, { headers });
      onSnackbar?.('Group deleted', 'success');
      setDeleteConfirm(null);
      loadGroups();
    } catch (err) {
      onSnackbar?.(err.response?.data?.error?.message || 'Failed to delete group', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSubgroup = async () => {
    if (!subgroupName.trim() || !subgroupDialog) {
      onSnackbar?.('Subgroup name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await cms.raw().post(`/api/user-groups/${subgroupDialog}/subgroups`, {
        name: subgroupName
      }, { headers });
      onSnackbar?.('Subgroup created', 'success');
      setSubgroupDialog(null);
      setSubgroupName('');
      setEditingSubgroup(null);
      loadGroups();
    } catch (err) {
      onSnackbar?.(err.response?.data?.error?.message || 'Failed to create subgroup', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubgroup = async () => {
    if (!subgroupName.trim() || !editingSubgroup?.id) {
      onSnackbar?.('Subgroup name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await cms.raw().put(`/api/user-groups/subgroups/${editingSubgroup.id}`, {
        name: subgroupName
      }, { headers });
      onSnackbar?.('Subgroup updated', 'success');
      setSubgroupDialog(null);
      setSubgroupName('');
      setEditingSubgroup(null);
      loadGroups();
    } catch (err) {
      onSnackbar?.(err.response?.data?.error?.message || 'Failed to update subgroup', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubgroup = async (subgroupId) => {
    setSaving(true);
    try {
      await cms.raw().delete(`/api/user-groups/subgroups/${subgroupId}`, { headers });
      onSnackbar?.('Subgroup deleted', 'success');
      loadGroups();
    } catch (err) {
      onSnackbar?.(err.response?.data?.error?.message || 'Failed to delete subgroup', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openCreateDialog = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setFormData({ name: group.name, color: group.color, description: group.description || '' });
    } else {
      setEditingGroup(null);
      setFormData({ name: '', color: COLOR_PRESETS[0], description: '' });
    }
    setCreateDialog(true);
  };

  const openSubgroupDialog = (groupId, subgroup = null) => {
    if (subgroup) {
      setEditingSubgroup(subgroup);
      setSubgroupName(subgroup.name);
    } else {
      setEditingSubgroup(null);
      setSubgroupName('');
    }
    setSubgroupDialog(groupId);
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  if (loading) {
    return (
      <Box>
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} height={100} sx={{ mb: 2, borderRadius: 1.5 }} />
        ))}
      </Box>
    );
  }

  const noGroups = groups.length === 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B', mb: 0.5 }}>
            User Groups
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Organize users into groups and subgroups
          </Typography>
        </Box>
        {noGroups && (
          <Button
            onClick={handleSeedDefault}
            disabled={saving}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#2563EB',
              color: '#fff',
              borderRadius: 1,
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Seed Default Group'}
          </Button>
        )}
      </Box>

      {noGroups ? (
        <Box sx={{ border: '2px dashed #E2E8F0', borderRadius: 1.5, p: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
            No groups yet
          </Typography>
          <Typography variant="caption" sx={{ color: '#CBD5E1', mb: 2, display: 'block' }}>
            Create a group to organize your end users
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => openCreateDialog()}
              sx={{
                borderColor: '#E2E8F0',
                color: '#2563EB',
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { borderColor: '#2563EB', bgcolor: '#EFF6FF' }
              }}
            >
              Create Group
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          {groups.map(group => (
            <Paper key={group.id} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 1.5 }}>
              <Box
                onClick={() => toggleGroup(group.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F8FAFC' },
                  p: 1,
                  borderRadius: 1,
                  transition: 'background-color 0.2s'
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: group.color,
                    flexShrink: 0
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#1E293B' }}>
                    {group.name}
                  </Typography>
                </Box>
                <Chip
                  label={`${group.userCount || 0} users`}
                  size="small"
                  sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB', height: 24 }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateDialog(group);
                  }}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ groupId: group.id, type: 'group' });
                  }}
                  sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2' } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroup(group.id);
                  }}
                  sx={{ color: '#94A3B8' }}
                >
                  {expandedGroups[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedGroups[group.id]} timeout="auto">
                <Box sx={{ pl: 6, pr: 2, pb: 1, mt: 1, borderTop: '1px solid #E2E8F0', pt: 2 }}>
                  {(!group.subgroups || group.subgroups.length === 0) ? (
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 2 }}>
                      No subgroups yet
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                      {group.subgroups.map(subgroup => (
                        <Box
                          key={subgroup.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            p: 1.5,
                            bgcolor: '#F8FAFC',
                            borderRadius: 1,
                            border: '1px solid #E2E8F0'
                          }}
                        >
                          <Typography variant="body2" sx={{ flex: 1, color: '#1E293B' }}>
                            {subgroup.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => openSubgroupDialog(group.id, subgroup)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSubgroup(subgroup.id)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Button
                    size="small"
                    onClick={() => openSubgroupDialog(group.id)}
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#2563EB',
                      bgcolor: '#EFF6FF',
                      '&:hover': { bgcolor: '#BFDBFE' }
                    }}
                  >
                    Add Subgroup
                  </Button>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}

      {groups.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openCreateDialog()}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#2563EB',
              borderRadius: 1,
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            Add Group
          </Button>
        </Box>
      )}

      {/* Create/Edit Group Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          {editingGroup ? 'Edit Group' : 'Create Group'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Group Name *"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Volunteers, Staff"
            />

            <Box>
              <Typography variant="caption" fontWeight={600} sx={{ color: '#1E293B', mb: 1, display: 'block' }}>
                Color
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {COLOR_PRESETS.map(color => (
                  <Box
                    key={color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    sx={{
                      width: '100%',
                      paddingBottom: '100%',
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: 1,
                      border: formData.color === color ? '3px solid #1E293B' : '2px solid #E2E8F0',
                      transition: 'all 0.2s ease',
                      '&:hover': { borderColor: '#94A3B8' }
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: color,
                        borderRadius: 'calc(0.375rem - 2px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {formData.color === color && (
                        <PaletteIcon sx={{ color: '#fff', fontSize: 16 }} />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateDialog(false)} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={editingGroup ? handleEditGroup : handleCreateGroup}
            disabled={saving}
            sx={{
              bgcolor: '#2563EB',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1,
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : (editingGroup ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Subgroup Dialog */}
      <Dialog open={!!subgroupDialog} onClose={() => setSubgroupDialog(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          {editingSubgroup ? 'Edit Subgroup' : 'Add Subgroup'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Subgroup Name *"
            value={subgroupName}
            onChange={(e) => setSubgroupName(e.target.value)}
            placeholder="e.g., Senior Volunteers"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSubgroupDialog(null)} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={editingSubgroup ? handleEditSubgroup : handleCreateSubgroup}
            disabled={saving}
            sx={{
              bgcolor: '#2563EB',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 1,
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : (editingSubgroup ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#475569' }}>
            Are you sure you want to delete this {deleteConfirm?.type === 'group' ? 'group' : 'subgroup'}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteGroup}
            disabled={saving}
            sx={{ color: '#DC2626', textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserGroupsTab;
