import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Alert,
  TextField, Skeleton
} from '@mui/material';
import { Add, Delete, Key, ContentCopy, Download, CheckCircle, Warning, Visibility, VisibilityOff } from '@mui/icons-material';
import cms from '../../../services/cms';

const ApiKeysTab = ({ project, onSnackbar }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKeyDisplay, setNewKeyDisplay] = useState(null);
  const [revealedKeys, setRevealedKeys] = useState({});

  useEffect(() => {
    loadApiKeys();
  }, [project]);

  const loadApiKeys = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: allKeys } = await cms.raw().get('/api/api-keys');
      const keys = allKeys || [];
      const projectKeys = keys.filter(k => k.projectId === project.id);
      setApiKeys(projectKeys);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load API keys';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const maskKey = (key) => {
    if (!key || key.length < 12) return key;
    return key.slice(0, 8) + '••••••••' + key.slice(-4);
  };

  const handleCreateKey = async () => {
    if (!keyName.trim()) {
      onSnackbar('API key name is required', 'error');
      return;
    }

    setCreating(true);
    try {
      const { data } = await cms.raw().post('/api/api-keys', {
        name: keyName,
        projectId: project.id
      });
      setNewKeyDisplay(data);
      setCreateOpen(false);
      setKeyName('');
      loadApiKeys();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to create API key';
      onSnackbar(msg, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    if (!window.confirm('Revoke this API key? This cannot be undone.')) return;

    try {
      await cms.raw().delete(`/api/api-keys/${keyId}`);
      onSnackbar('API key revoked successfully', 'success');
      loadApiKeys();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to revoke API key';
      onSnackbar(msg, 'error');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    onSnackbar('Copied to clipboard', 'success');
  };

  const downloadNewKeyCSV = () => {
    const csv = `Key Name,API Key,API Secret\n"${newKeyDisplay?.name}","${newKeyDisplay?.key}","${newKeyDisplay?.secret}"`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.slug || 'project'}-api-key.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>
          API Keys
        </Typography>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
          sx={{ textTransform: 'none', color: '#2563EB', fontWeight: 600 }}
        >
          Create Key
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2].map(i => <Skeleton key={i} height={70} />)}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
          <Button size="small" onClick={loadApiKeys} sx={{ ml: 2, textTransform: 'none' }}>
            Retry
          </Button>
        </Alert>
      ) : apiKeys.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2 }}>
          <Key sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            No API keys for this project
          </Typography>
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>Key</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12, width: 60 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.map(key => (
              <TableRow key={key.id} sx={{ borderBottom: '1px solid #E2E8F0' }}>
                <TableCell sx={{ fontSize: 14, color: '#1E293B', fontWeight: 500 }}>
                  {key.name}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        color: '#1E293B',
                        fontSize: 12
                      }}
                    >
                      {revealedKeys[key.id] ? key.key : maskKey(key.key)}
                    </Typography>
                    <Tooltip title={revealedKeys[key.id] ? 'Hide' : 'Reveal'}>
                      <IconButton
                        size="small"
                        onClick={() => setRevealedKeys(p => ({ ...p, [key.id]: !p[key.id] }))}
                        sx={{ color: '#94A3B8' }}
                      >
                        {revealedKeys[key.id] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(key.key)}
                        sx={{ color: '#94A3B8' }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={key.revoked ? 'Revoked' : 'Active'}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: 12,
                      bgcolor: key.revoked ? '#FEF2F2' : '#ECFDF5',
                      color: key.revoked ? '#DC2626' : '#10B981'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: 14, color: '#64748B' }}>
                  {new Date(key.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Tooltip title="Revoke key">
                    <IconButton
                      size="small"
                      onClick={() => handleRevokeKey(key.id)}
                      sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create API Key Dialog */}
      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Create API Key</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Key Name"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="e.g., Development, Production"
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateKey}
            variant="contained"
            disabled={creating || !keyName.trim()}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Key Display Dialog */}
      <Dialog
        open={!!newKeyDisplay}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: '#10B981' }} />
          API Key Created
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} icon={<Warning />}>
            Save this key now — it will NOT be shown again!
          </Alert>

          <Typography variant="caption" fontWeight={600} sx={{ color: '#475569', mb: 0.5, display: 'block' }}>
            API Key
          </Typography>
          <Box sx={{ bgcolor: '#F1F5F9', borderRadius: 2, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#1E293B', flex: 1, fontSize: 12, wordBreak: 'break-all' }}>
              {newKeyDisplay?.key}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(newKeyDisplay?.key)} sx={{ color: '#94A3B8' }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="caption" fontWeight={600} sx={{ color: '#DC2626', mb: 0.5, display: 'block' }}>
            API Secret (one-time only)
          </Typography>
          <Box sx={{ bgcolor: '#1E293B', borderRadius: 2, p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#F59E0B', flex: 1, fontSize: 12, wordBreak: 'break-all' }}>
              {newKeyDisplay?.secret}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(newKeyDisplay?.secret)} sx={{ color: '#94A3B8' }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            startIcon={<Download />}
            onClick={downloadNewKeyCSV}
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
            onClick={() => setNewKeyDisplay(null)}
            variant="contained"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            I've Saved It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeysTab;
