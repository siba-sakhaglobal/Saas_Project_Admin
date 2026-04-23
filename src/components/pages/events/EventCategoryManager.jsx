import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper, Chip, Tooltip, CircularProgress, Alert, Stack
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon
} from '@mui/icons-material';
import cms from '../../../services/cms';

const EventCategoryManager = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, category: null });
  const [form, setForm] = useState({ name: '', color: '#2563EB', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const colorPresets = [
    '#EF4444', '#F97316', '#FBBF24', '#4ADE80', '#22C55E',
    '#06B6D4', '#0EA5E9', '#2563EB', '#6366F1', '#A855F7',
    '#EC4899', '#F43F5E'
  ];

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await cms.events.listCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      showMsg('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const showMsg = (text, severity = 'success') => {
    setMessage({ text, severity });
    setTimeout(() => setMessage(null), 3000);
  };

  const openCreate = () => {
    setForm({ name: '', color: '#2563EB', sortOrder: categories.length });
    setDialog({ open: true, category: null });
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, color: cat.color || '#2563EB', sortOrder: cat.sortOrder || 0 });
    setDialog({ open: true, category: cat });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      showMsg('Name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (dialog.category) {
        await cms.events.updateCategory(dialog.category.id, form);
        showMsg('Category updated');
      } else {
        await cms.events.createCategory(form);
        showMsg('Category created');
      }
      setDialog({ open: false, category: null });
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Failed to save';
      showMsg(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      await cms.events.deleteCategory(cat.id);
      showMsg('Category deleted');
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to delete';
      showMsg(msg, 'error');
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('..')} sx={{ border: '1px solid #E2E8F0' }}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>
              Event Categories
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {categories.length} categories
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1D4ED8' } }}
        >
          Add Category
        </Button>
      </Box>

      {message && <Alert severity={message.severity} sx={{ mb: 2, borderRadius: 1 }}>{message.text}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, px: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <Typography sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Name</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', width: 80 }}>Color</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', width: 60 }}>Order</Typography>
            <Box sx={{ width: 100 }} />
          </Box>

          {categories.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography sx={{ color: '#64748B', mb: 2 }}>No categories yet</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
                sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600 }}>
                Create First Category
              </Button>
            </Box>
          ) : (
            categories.map(cat => (
              <Box
                key={cat.id}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1, py: 1.5, px: 2,
                  borderBottom: '1px solid #F1F5F9',
                  '&:hover': { bgcolor: '#F8FAFC' }, transition: 'background 0.15s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                  <Box
                    sx={{
                      width: 16, height: 16, borderRadius: '50%',
                      bgcolor: cat.color || '#2563EB', border: '1px solid #CBD5E1'
                    }}
                  />
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>
                    {cat.name}
                  </Typography>
                </Box>

                <Chip
                  label={cat.color || '#2563EB'}
                  size="small"
                  sx={{
                    fontSize: '0.65rem', height: 20, bgcolor: cat.color || '#2563EB',
                    color: '#fff', fontFamily: 'monospace'
                  }}
                  variant="filled"
                />

                <Typography sx={{ fontSize: '0.875rem', color: '#64748B', width: 60, textAlign: 'center' }}>
                  {cat.sortOrder || 0}
                </Typography>

                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => openEdit(cat)}
                    sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(cat)}
                    sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))
          )}
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, category: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          {dialog.category ? 'Edit Category' : 'Add Event Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Name *"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Conference"
            />
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, color: '#1E293B' }}>
                Color
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
                {colorPresets.map(color => (
                  <Tooltip key={color} title={color}>
                    <Box
                      onClick={() => setForm(prev => ({ ...prev, color }))}
                      sx={{
                        width: '100%', aspectRatio: '1',
                        bgcolor: color, borderRadius: 1, cursor: 'pointer',
                        border: form.color === color ? '3px solid #1E293B' : '2px solid #E2E8F0',
                        transition: 'all 0.15s'
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Box>
            <TextField
              size="small"
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
              sx={{ width: 120 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDialog({ open: false, category: null })}
            sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1, '&:hover': { bgcolor: '#1D4ED8' } }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : (dialog.category ? 'Save' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventCategoryManager;
