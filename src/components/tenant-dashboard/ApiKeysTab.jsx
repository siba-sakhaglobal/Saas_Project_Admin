import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Chip, Tooltip, IconButton, Skeleton,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Key, Add, ContentCopy, Visibility, VisibilityOff, Delete, Download, CheckCircle, Warning, Refresh } from '@mui/icons-material';
import cms from '../../services/cms';

const ApiKeysTab = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({ name: '', projectId: '', scopes: '*' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [credentialsDialog, setCredentialsDialog] = useState(null);
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [revoking, setRevoking] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [keysRes, projRes] = await Promise.allSettled([
        cms.raw().get('/api/api-keys'),
        cms.raw().get('/api/projects')
      ]);
      if (keysRes.status === 'fulfilled') setApiKeys(keysRes.value.data || []);
      if (projRes.status === 'fulfilled') setProjects(projRes.value.data || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateKey = async () => {
    if (!newKeyForm.name.trim()) {
      setCreateError('Key name is required');
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      const { data: created } = await cms.raw().post('/api/api-keys', {
        name: newKeyForm.name,
        projectId: newKeyForm.projectId || null,
        scopes: newKeyForm.scopes
      });

      // Show credentials dialog
      setCredentialsDialog({
        key: created.key,
        secret: created.secret,
        name: newKeyForm.name,
        projectId: newKeyForm.projectId
      });

      setCreateOpen(false);
      setNewKeyForm({ name: '', projectId: '', scopes: '*' });
      loadData();
    } catch (err) {
      console.error('Failed to create key:', err);
      setCreateError(err.response?.data?.error?.message || err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId) => {
    setRevoking(true);
    try {
      await cms.raw().delete(`/api/api-keys/${keyId}`);
      setRevokeConfirm(null);
      loadData();
    } catch (err) {
      console.error('Failed to revoke key:', err);
      setError(err.message || 'Failed to revoke API key');
    } finally {
      setRevoking(false);
    }
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

  const downloadCSV = (key, secret, projectName) => {
    const csv = `Project,API Key,API Secret\n"${projectName}","${key}","${secret}"`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-key-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProjectName = (projectId) => {
    return projects.find(p => p.id === projectId)?.name || 'N/A';
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
            API Keys
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Manage your API keys and secrets
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadData} sx={{ color: '#64748B' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#2563EB' }}>
            Create API Key
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Keys List */}
      {apiKeys.length === 0 ? (
        <Card sx={{ borderRadius: 3, border: '2px dashed #CBD5E1', boxShadow: 'none', p: 6, textAlign: 'center' }} elevation={0}>
          <Key sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>
            No API keys yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Create your first API key to authenticate requests
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setCreateOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}>
            Create API Key
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {apiKeys.map((key) => (
            <Card
              key={key.id}
              sx={{
                borderRadius: 2.5,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                opacity: key.revokedAt ? 0.5 : 1,
              }}
              elevation={0}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: key.revokedAt ? '#F1F5F9' : '#ECFDF5' }}>
                  <Key sx={{ color: key.revokedAt ? '#94A3B8' : '#10B981', fontSize: 20 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Name and Project */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>
                      {key.name}
                    </Typography>
                    {key.projectId && (
                      <Chip
                        label={getProjectName(key.projectId)}
                        size="small"
                        sx={{ borderRadius: 1, fontSize: 10, height: 20, bgcolor: '#EFF6FF', color: '#2563EB' }}
                      />
                    )}
                  </Box>
                  {/* Key Display */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748B' }}>
                      {revealedKeys[key.id] ? key.key : maskKey(key.key)}
                    </Typography>
                    <Tooltip title={revealedKeys[key.id] ? 'Hide key' : 'Show key'}>
                      <IconButton size="small" onClick={() => toggleKeyReveal(key.id)} sx={{ color: '#94A3B8', p: 0.3 }}>
                        {revealedKeys[key.id] ? <VisibilityOff sx={{ fontSize: 14 }} /> : <Visibility sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy key">
                      <IconButton size="small" onClick={() => copyToClipboard(key.key)} sx={{ color: '#94A3B8', p: 0.3 }}>
                        <ContentCopy sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {/* Status and Actions */}
                <Chip
                  label={key.revokedAt ? 'Revoked' : 'Active'}
                  size="small"
                  sx={{
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: 11,
                    bgcolor: key.revokedAt ? '#FEF2F2' : '#ECFDF5',
                    color: key.revokedAt ? '#DC2626' : '#059669'
                  }}
                />
                {!key.revokedAt && (
                  <Tooltip title="Revoke key">
                    <IconButton
                      size="small"
                      onClick={() => setRevokeConfirm(key.id)}
                      sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Create Key Dialog */}
      <Dialog open={createOpen} onClose={() => { setCreateOpen(false); setCreateError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Create API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2, mt: 1 }}>
            Generate a new API key to authenticate requests
          </Typography>
          {createError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{createError}</Alert>}
          <TextField
            fullWidth label="Key Name" margin="normal" autoFocus
            value={newKeyForm.name}
            onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
            placeholder="e.g., Production Server"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Project (Optional)</InputLabel>
            <Select
              label="Project (Optional)"
              value={newKeyForm.projectId}
              onChange={(e) => setNewKeyForm({ ...newKeyForm, projectId: e.target.value })}
            >
              <MenuItem value="">None</MenuItem>
              {projects.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth label="Scopes" margin="normal"
            value={newKeyForm.scopes}
            onChange={(e) => setNewKeyForm({ ...newKeyForm, scopes: e.target.value })}
            placeholder="* (all scopes)"
            helperText="Space-separated, or * for all"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => { setCreateOpen(false); setCreateError(''); }} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button onClick={handleCreateKey} variant="contained" disabled={!newKeyForm.name.trim() || creating}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB' }}>
            {creating ? <CircularProgress size={20} color="inherit" /> : 'Create Key'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={!!credentialsDialog} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircle sx={{ color: '#10B981' }} />
          API Key Created
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, mt: 2 }} icon={<Warning />}>
            Save the API Secret now — it will NOT be shown again! Download the CSV for your records.
          </Alert>
          {credentialsDialog?.projectId && (
            <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
              Project: <strong>{getProjectName(credentialsDialog.projectId)}</strong>
            </Typography>
          )}

          <Typography variant="caption" fontWeight={600} sx={{ color: '#475569', mb: 0.5, display: 'block' }}>
            API Key (visible anytime)
          </Typography>
          <Box sx={{ bgcolor: '#F1F5F9', borderRadius: 2, p: 1.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#1E293B', flex: 1, wordBreak: 'break-all', fontSize: 13 }}>
              {credentialsDialog?.key}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(credentialsDialog?.key)} sx={{ color: '#94A3B8' }}>
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="caption" fontWeight={600} sx={{ color: '#DC2626', mb: 0.5, display: 'block' }}>
            API Secret (one-time only)
          </Typography>
          <Box sx={{ bgcolor: '#1E293B', borderRadius: 2, p: 1.5, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#F59E0B', flex: 1, wordBreak: 'break-all', fontSize: 13 }}>
              {credentialsDialog?.secret}
            </Typography>
            <IconButton size="small" onClick={() => copyToClipboard(credentialsDialog?.secret)} sx={{ color: copied ? '#10B981' : '#94A3B8' }}>
              {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
            </IconButton>
          </Box>
          {copied && <Typography variant="caption" sx={{ color: '#10B981', mt: 0.5, display: 'block' }}>Copied to clipboard!</Typography>}

          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 2, display: 'block' }}>
            Use both key and secret: <code style={{ color: '#2563EB' }}>Authorization: Bearer key:secret</code>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            startIcon={<Download />}
            onClick={() => downloadCSV(credentialsDialog?.key, credentialsDialog?.secret, credentialsDialog?.name)}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: '#2563EB', color: '#2563EB' }}
          >
            Download CSV
          </Button>
          <Button onClick={() => setCredentialsDialog(null)} variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB' }}>
            I've Saved It
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Confirmation */}
      <Dialog open={!!revokeConfirm} onClose={() => setRevokeConfirm(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#DC2626' }}>Revoke API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            This will immediately revoke the key. Any applications using it will lose access.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRevokeConfirm(null)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button onClick={() => handleRevokeKey(revokeConfirm)} variant="contained" disabled={revoking}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}>
            {revoking ? <CircularProgress size={20} color="inherit" /> : 'Revoke Key'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiKeysTab;
