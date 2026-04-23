import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, Paper, Chip, Tooltip, CircularProgress, Alert, FormControl, InputLabel,
  Select, MenuItem, Switch, FormControlLabel, Stack
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as BackIcon,
  ExpandMore, ChevronRight, Folder as FolderIcon, FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import cms from '../../../services/cms';

const CategoryManager = () => {
  const navigate = useNavigate();
  const [tree, setTree] = useState([]);
  const [flatList, setFlatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [dialog, setDialog] = useState({ open: false, category: null, parentId: null });
  const [form, setForm] = useState({ name: '', slug: '', description: '', parentId: null, active: true, sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const [treeRes, flatRes] = await Promise.all([
        cms.products.getCategoryTree(),
        cms.products.listCategories(),
      ]);
      setTree(treeRes.data?.data || treeRes.data || []);
      setFlatList(flatRes.data?.data || flatRes.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const showMsg = (text, severity = 'success') => {
    setMessage({ text, severity });
    setTimeout(() => setMessage(null), 3000);
  };

  const generateSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const allExpanded = flatList.filter(c => flatList.some(ch => ch.parentId === c.id)).every(c => expanded[c.id]);

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpanded({});
    } else {
      const all = {};
      flatList.forEach(c => { if (flatList.some(ch => ch.parentId === c.id)) all[c.id] = true; });
      setExpanded(all);
    }
  };

  const openCreate = (parentId = null) => {
    const parent = parentId ? flatList.find(c => c.id === parentId) : null;
    setForm({ name: '', slug: '', description: '', parentId, active: true, sortOrder: 0 });
    setDialog({ open: true, category: null, parentId, parentName: parent?.name || null });
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', parentId: cat.parentId, active: cat.active !== false, sortOrder: cat.sortOrder || 0 });
    setDialog({ open: true, category: cat, parentId: cat.parentId, parentName: null });
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showMsg('Name is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || generateSlug(form.name) };
      if (dialog.category) {
        await cms.products.updateCategory(dialog.category.id, payload);
        showMsg('Category updated');
      } else {
        await cms.products.createCategory(payload);
        showMsg('Category created');
      }
      setDialog({ open: false, category: null, parentId: null });
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
      await cms.products.deleteCategory(cat.id);
      showMsg('Category deleted');
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to delete';
      showMsg(msg, 'error');
    }
  };

  const getDepthLabel = (cat) => {
    if (!cat.parentId) return 'Root';
    const parent = flatList.find(c => c.id === cat.parentId);
    if (!parent?.parentId) return 'Sub-category';
    return 'Child';
  };

  const countChildren = (id) => flatList.filter(c => c.parentId === id).length;

  const renderCategoryRow = (cat, depth = 0) => {
    const childCount = countChildren(cat.id);
    const isExpanded = expanded[cat.id];
    const children = flatList.filter(c => c.parentId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <React.Fragment key={cat.id}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 2,
          pl: 2 + depth * 3, borderBottom: '1px solid #F1F5F9',
          '&:hover': { bgcolor: '#F8FAFC' }, transition: 'background 0.15s',
        }}>
          {childCount > 0 ? (
            <IconButton size="small" onClick={() => toggleExpand(cat.id)} sx={{ width: 28, height: 28 }}>
              {isExpanded ? <ExpandMore sx={{ fontSize: 18 }} /> : <ChevronRight sx={{ fontSize: 18 }} />}
            </IconButton>
          ) : (
            <Box sx={{ width: 28 }} />
          )}

          {isExpanded ? <FolderOpenIcon sx={{ fontSize: 18, color: '#F59E0B' }} /> : <FolderIcon sx={{ fontSize: 18, color: '#94A3B8' }} />}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{cat.name}</Typography>
            {cat.description && <Typography sx={{ fontSize: '0.6875rem', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</Typography>}
          </Box>

          <Chip label={getDepthLabel(cat)} size="small" sx={{ fontSize: '0.625rem', height: 20, bgcolor: depth === 0 ? '#EFF6FF' : depth === 1 ? '#ECFDF5' : '#FEF3C7', color: depth === 0 ? '#2563EB' : depth === 1 ? '#059669' : '#D97706' }} />

          {childCount > 0 && (
            <Chip label={`${childCount}`} size="small" sx={{ fontSize: '0.625rem', height: 20, bgcolor: '#F1F5F9', color: '#64748B', minWidth: 24 }} />
          )}

          <Chip label={cat.active !== false ? 'Active' : 'Inactive'} size="small"
            sx={{ fontSize: '0.625rem', height: 20, bgcolor: cat.active !== false ? '#DCFCE7' : '#FEE2E2', color: cat.active !== false ? '#166534' : '#991B1B' }} />

          <Tooltip title="Add sub-category">
            <IconButton size="small" onClick={() => openCreate(cat.id)} sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEdit(cat)} sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => handleDelete(cat)} sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2' } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {isExpanded && children.map(child => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const rootCategories = flatList.filter(c => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const parentOptions = flatList.filter(c => !c.parentId || !flatList.find(p => p.id === c.parentId)?.parentId);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('..')} sx={{ border: '1px solid #E2E8F0' }}><BackIcon /></IconButton>
          <Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Product Categories</Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>{flatList.length} categories in {rootCategories.length} groups</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" size="small" onClick={toggleExpandAll}
            sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569' }}>
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate()}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1D4ED8' } }}>
            Add Root Category
          </Button>
        </Box>
      </Box>

      {message && <Alert severity={message.severity} sx={{ mb: 2, borderRadius: 1 }}>{message.text}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, overflow: 'hidden' }}>
          {/* Table header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.5, px: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <Box sx={{ width: 28 }} />
            <Box sx={{ width: 18 }} />
            <Typography sx={{ flex: 1, fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>Name</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', width: 80, textAlign: 'center' }}>Level</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', width: 30, textAlign: 'center' }}>Sub</Typography>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', width: 60, textAlign: 'center' }}>Status</Typography>
            <Box sx={{ width: 100 }} />
          </Box>

          {rootCategories.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <FolderIcon sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
              <Typography sx={{ color: '#64748B', mb: 2 }}>No categories yet</Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => openCreate()}
                sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600 }}>
                Create First Category
              </Button>
            </Box>
          ) : (
            rootCategories.map(cat => renderCategoryRow(cat, 0))
          )}
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, category: null, parentId: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 1.5 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1E293B' }}>
          {dialog.category ? 'Edit Category' : dialog.parentId ? `Add Sub-category under "${dialog.parentName || flatList.find(c => c.id === dialog.parentId)?.name}"` : 'Add Root Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth size="small" label="Name *" value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value, slug: generateSlug(e.target.value) }))} />
            <TextField fullWidth size="small" label="Slug" value={form.slug}
              onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
              helperText="Auto-generated from name" />
            <TextField fullWidth size="small" label="Description" value={form.description} multiline rows={2}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} />
            <FormControl fullWidth size="small">
              <InputLabel>Parent Category</InputLabel>
              <Select value={form.parentId || ''} label="Parent Category"
                onChange={(e) => setForm(prev => ({ ...prev, parentId: e.target.value || null }))}
                sx={{ color: '#1E293B' }}>
                <MenuItem value="">None (Root Category)</MenuItem>
                {parentOptions.map(c => (
                  <MenuItem key={c.id} value={c.id} disabled={dialog.category?.id === c.id}>
                    {c.parentId ? `  └ ${c.name}` : c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField size="small" label="Sort Order" type="number" value={form.sortOrder}
                onChange={(e) => setForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                sx={{ width: 120 }} />
              <FormControlLabel
                control={<Switch checked={form.active} onChange={(e) => setForm(prev => ({ ...prev, active: e.target.checked }))}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2563EB' } }} />}
                label="Active" />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog({ open: false, category: null, parentId: null })} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1, '&:hover': { bgcolor: '#1D4ED8' } }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : (dialog.category ? 'Save' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManager;
