import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip, CircularProgress } from '@mui/material';
import { Delete } from '@mui/icons-material';
import cms from '../../../services/cms';

const GeneralTab = ({ project, onDelete, onSnackbar, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', slug: '', domain: '', status: 'active' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name || '',
        slug: project.slug || '',
        domain: project.domain || '',
        status: project.status || 'active'
      });
    }
  }, [project]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      onSnackbar('Project name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      await cms.raw().patch(`/api/projects/${project.id}`, {
        name: form.name,
        slug: form.slug,
        domain: form.domain,
        status: form.status
      });
      onSnackbar('Project updated successfully', 'success');
      onSave?.();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to update project';
      onSnackbar(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="Project Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Slug"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        margin="normal"
        InputProps={{ sx: { fontFamily: 'monospace' } }}
        helperText="URL-friendly identifier"
      />
      <TextField
        fullWidth
        label="Domain (Optional)"
        value={form.domain}
        onChange={(e) => setForm({ ...form, domain: e.target.value })}
        margin="normal"
        placeholder="example.com"
      />

      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B', mb: 1 }}>
          Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['active', 'archived'].map(status => (
            <Chip
              key={status}
              label={status.charAt(0).toUpperCase() + status.slice(1)}
              onClick={() => setForm({ ...form, status })}
              variant={form.status === status ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 600,
                bgcolor: form.status === status
                  ? (status === 'active' ? '#ECFDF5' : '#F1F5F9')
                  : 'transparent',
                color: form.status === status
                  ? (status === 'active' ? '#059669' : '#64748B')
                  : '#94A3B8',
                borderColor: form.status === status ? 'transparent' : '#E2E8F0'
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, pt: 3, borderTop: '1px solid #E2E8F0' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={onDelete}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#EF4444',
            color: '#EF4444'
          }}
        >
          Delete Project
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: '#2563EB',
            '&:hover': { bgcolor: '#1D4ED8' }
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default GeneralTab;
