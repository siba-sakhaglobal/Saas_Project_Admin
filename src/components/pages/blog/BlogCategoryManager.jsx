import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, IconButton, CircularProgress, Alert, Paper, Table, TableBody,
  TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, Tooltip
} from '@mui/material';
import { ArrowBack as BackIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import cms from '../../../services/cms';

const COLOR_PRESETS = ['#3b82f6', '#10b981', '#ef4444', '#06b6d4', '#f59e0b', '#8b5cf6',
  '#ec4899', '#f97316', '#64748b', '#0f172a', '#dc2626', '#16a34a'];

const BlogCategoryManager = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: COLOR_PRESETS[0], sortOrder: 0 });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await cms.blog.listCategories();
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

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, color: category.color, sortOrder: category.sortOrder });
    } else {
      setEditingId(null);
      setFormData({ name: '', color: COLOR_PRESETS[0], sortOrder: 0 });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
    setFormData({ name: '', color: COLOR_PRESETS[0], sortOrder: 0 });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showMsg('Category name is required', 'error');
      return;
    }
    try {
      if (editingId) {
        await cms.blog.updateCategory(editingId, formData);
        showMsg('Category updated successfully');
      } else {
        await cms.blog.createCategory(formData);
        showMsg('Category created successfully');
      }
      handleCloseDialog();
      fetchCategories();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleDeleteClick = (category) => {
    setDeleteTarget(category);
    setOpenDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await cms.blog.deleteCategory(deleteTarget.id);
      showMsg('Category deleted successfully');
      setOpenDeleteConfirm(false);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Delete failed', 'error');
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
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>
            Blog Categories
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => handleOpenDialog()}>
          Add Category
        </Button>
      </Box>

      {message && <Alert severity={message.severity} sx={{ mb: 2, borderRadius: 1 }}>{message.text}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#F8FAFC' }}>
          <Typography sx={{ color: '#64748B', mb: 2 }}>No categories yet</Typography>
          <Button variant="outlined" onClick={() => handleOpenDialog()}>Create First Category</Button>
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F1F5F9' }}>
              <TableRow>
                <TableCell>Color</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="center">Posts</TableCell>
                <TableCell align="right">Sort Order</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                  <TableCell>
                    <Box
                      sx={{
                        width: 24, height: 24, borderRadius: '50%', bgcolor: cat.color,
                        border: '1px solid #E2E8F0'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>
                      {cat.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#64748B' }}>
                      {cat.slug}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={`${cat.postCount} ${cat.postCount === 1 ? 'post' : 'posts'}`}>
                      <Chip
                        label={`${cat.postCount} ${cat.postCount === 1 ? 'post' : 'posts'}`}
                        size="small"
                        variant={cat.postCount > 0 ? 'filled' : 'outlined'}
                        sx={{
                          bgcolor: cat.postCount > 0 ? '#DBEAFE' : 'transparent',
                          color: cat.postCount > 0 ? '#1E40AF' : '#64748B'
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">{cat.sortOrder}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(cat)}
                      sx={{ color: '#0EA5E9' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(cat)}
                      sx={{ color: '#EF4444' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edit Category' : 'Create New Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Category Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, mb: 1, color: '#1E293B' }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {COLOR_PRESETS.map((color) => (
              <Box
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                sx={{
                  width: 40, height: 40, borderRadius: '50%', bgcolor: color,
                  border: formData.color === color ? '3px solid #1E293B' : '2px solid #E2E8F0',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              />
            ))}
          </Box>
          <TextField
            label="Sort Order"
            type="number"
            fullWidth
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Delete Category?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#1E293B', mb: 2 }}>
            This category has <strong>{deleteTarget?.postCount || 0} {deleteTarget?.postCount === 1 ? 'post' : 'posts'}</strong>.
          </Typography>
          <Typography sx={{ color: '#64748B' }}>
            Are you sure you want to delete "{deleteTarget?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogCategoryManager;
