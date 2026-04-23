import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Chip, Tooltip, CircularProgress, Alert, Stack, FormControl, InputLabel,
  Select, MenuItem
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon,
  People as PeopleIcon, Badge as BadgeIcon
} from '@mui/icons-material';
import cms from '../../../services/cms';

const LEVEL_COLORS = {
  executive: '#DC2626', senior: '#2563EB', mid: '#16A34A',
  junior: '#D97706', intern: '#94A3B8', volunteer: '#7C3AED',
  entry: '#06B6D4', board: '#0F172A',
};

const TeamDesignationManager = () => {
  const navigate = useNavigate();
  const [designations, setDesignations] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, designation: null });
  const [form, setForm] = useState({ title: '', description: '', level: 'mid', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [deRes, levRes] = await Promise.all([
        cms.raw().get('/api/tenant-designations'),
        cms.raw().get('/api/tenant-designations/levels').catch(() => ({ data: { levels: [] } })),
      ]);
      setDesignations(Array.isArray(deRes.data) ? deRes.data : deRes.data?.designations || deRes.data?.data || []);
      setLevels(Array.isArray(levRes.data) ? levRes.data : levRes.data?.levels || levRes.data?.data || []);
    } catch (err) {
      showMsg('Failed to load designations', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showMsg = (text, severity = 'success') => {
    setMessage({ text, severity });
    setTimeout(() => setMessage(null), 3000);
  };

  const openCreate = () => {
    setForm({ title: '', description: '', level: 'mid', sortOrder: designations.length });
    setDialog({ open: true, designation: null });
  };

  const openEdit = (des) => {
    setForm({ title: des.title || des.name, description: des.description || '', level: des.level || 'mid', sortOrder: des.sort_order || des.sortOrder || 0 });
    setDialog({ open: true, designation: des });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showMsg('Title is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { title: form.title, description: form.description, level: form.level, sort_order: form.sortOrder };
      if (dialog.designation) {
        await cms.raw().put(`/api/tenant-designations/${dialog.designation.id}`, payload);
        showMsg('Designation updated');
      } else {
        await cms.raw().post('/api/tenant-designations', payload);
        showMsg('Designation created');
      }
      setDialog({ open: false, designation: null });
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.error?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (des) => {
    const memberCount = des._count?.members || 0;
    if (!window.confirm(`Delete "${des.title || des.name}"?${memberCount > 0 ? ` This designation has ${memberCount} members.` : ''}`)) return;
    try {
      await cms.raw().delete(`/api/tenant-designations/${des.id}`);
      showMsg('Designation deleted');
      fetchData();
    } catch (err) {
      showMsg(err.response?.data?.error?.message || 'Failed to delete', 'error');
    }
  };

  const sorted = [...designations].sort((a, b) => (a.sort_order || a.sortOrder || 0) - (b.sort_order || b.sortOrder || 0));
  const getLevelLabel = (level) => levels.find(l => l.value === level)?.label || level || 'Mid-Level';

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('..')} sx={{ border: '1px solid #E2E8F0' }}><BackIcon /></IconButton>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Team Designations</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>{designations.length} designations configured</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
          Add Designation
        </Button>
      </Box>

      {message && <Alert severity={message.severity} sx={{ mb: 2, borderRadius: 1.5 }}>{message.text}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
      ) : sorted.length === 0 ? (
        <Box sx={{ py: 12, textAlign: 'center' }}>
          <BadgeIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
          <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No designations yet</Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8', mb: 3 }}>Create designations to assign roles to your team</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
            Create First Designation
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2.5 }}>
          {sorted.map(des => {
            const color = LEVEL_COLORS[des.level] || '#64748B';
            const memberCount = des._count?.members || 0;
            return (
              <Box key={des.id} sx={{
                bgcolor: '#fff', border: '1px solid #E2E8F0', borderRadius: 3,
                overflow: 'hidden', transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', borderColor: color },
              }}>
                {/* Color accent bar */}
                <Box sx={{ height: 4, bgcolor: color }} />

                <Box sx={{ p: 2.5 }}>
                  {/* Title + level */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1E293B', flex: 1, mr: 1 }}>
                      {des.title || des.name}
                    </Typography>
                    <Chip label={getLevelLabel(des.level)} size="small"
                      sx={{ fontSize: '0.625rem', height: 20, fontWeight: 700, bgcolor: `${color}18`, color, borderRadius: 1 }} />
                  </Box>

                  {/* Description */}
                  {des.description && (
                    <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 2, lineHeight: 1.4,
                      overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {des.description}
                    </Typography>
                  )}

                  {/* Member count */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1.5, py: 1, bgcolor: '#F8FAFC', borderRadius: 1.5 }}>
                    <PeopleIcon sx={{ fontSize: 16, color: '#64748B' }} />
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B' }}>{memberCount}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>member{memberCount !== 1 ? 's' : ''}</Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(des)}
                        sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(des)}
                        sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2' } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, designation: null })} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          {dialog.designation ? 'Edit Designation' : 'Add Designation'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth size="small" label="Title *" value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="e.g., Senior Developer" />
            <TextField fullWidth size="small" label="Description" value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} multiline rows={2} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Level</InputLabel>
                <Select value={form.level} label="Level" onChange={(e) => setForm(prev => ({ ...prev, level: e.target.value }))}>
                  {levels.map(l => (
                    <MenuItem key={l.value} value={l.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: LEVEL_COLORS[l.value] || '#64748B' }} />
                        {l.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField size="small" label="Sort Order" type="number" value={form.sortOrder}
                onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))} sx={{ width: 120 }} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialog({ open: false, designation: null })} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (dialog.designation ? 'Save' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamDesignationManager;
