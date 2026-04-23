import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button,
  Alert, CircularProgress
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import cms from '../../../services/cms';

const DeleteProjectDialog = ({ open, project, onClose, onSuccess, onSnackbar }) => {
  const [confirm, setConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm !== project?.name) {
      onSnackbar('Project name does not match', 'error');
      return;
    }

    setDeleting(true);
    try {
      await cms.raw().delete(`/api/projects/${project.id}`);
      onSnackbar('Project deleted successfully', 'success');
      setConfirm('');
      onSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to delete project';
      onSnackbar(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirm('');
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning sx={{ fontSize: 20 }} />
        Delete Project
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
          Are you sure you want to delete <strong>{project?.name}</strong>? This action cannot be undone.
        </Typography>
        <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }} icon={<Warning />}>
          All content and API keys will be permanently deleted.
        </Alert>
        <Typography variant="caption" sx={{ color: '#64748B', mb: 1, display: 'block' }}>
          Type the project name to confirm:
        </Typography>
        <TextField
          fullWidth
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={project?.name}
          size="small"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ textTransform: 'none', color: '#64748B' }}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          disabled={deleting || confirm !== project?.name}
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
  );
};

export default DeleteProjectDialog;
