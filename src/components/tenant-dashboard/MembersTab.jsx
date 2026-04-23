import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Alert, Chip, Tooltip, IconButton, Skeleton,
  Select, MenuItem, FormControl, InputLabel, Paper
} from '@mui/material';
import { People, Add, Refresh, Delete, Send } from '@mui/icons-material';
import cms from '../../services/cms';
import { useAuth } from '../../services/authService';

const COLOR_MAP = { slate: '#64748B', blue: '#2563EB', green: '#10B981', amber: '#D97706', red: '#DC2626', purple: '#8B5CF6', pink: '#EC4899', indigo: '#6366F1' };

const MembersTab = () => {
  const { tenant } = useAuth();
  const [members, setMembers] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'viewer' });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', password: '', fullName: '', role: 'viewer', designationId: '' });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [endpointExists, setEndpointExists] = useState(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Try /api/members endpoint first
      try {
        const { data: memberList } = await cms.raw().get('/api/members');
        const members = memberList || [];
        // Also load pending invitations
        try {
          const { data: invitesData } = await cms.raw().get('/api/invitations');
          const invites = (invitesData || []).filter(i => i.status === 'pending');
          const inviteMembers = invites.map(i => ({
            id: `inv-${i.id}`, userId: null, role: i.role || 'viewer',
            email: i.email, isPending: true,
            user: { email: i.email, fullName: `${i.email} (Pending)` },
            createdAt: i.createdAt,
          }));
          setMembers([...members, ...inviteMembers]);
        } catch {
          setMembers(members);
        }
        setEndpointExists(true);
      } catch (err) {
        if (err.response?.status === 404) {
          // Fallback: try /api/tenant-dashboard/overview
          try {
            const { data: overviewData } = await cms.raw().get('/api/tenant-dashboard/overview');
            setMemberCount(overviewData?.memberCount || 0);
            setEndpointExists(false);
          } catch (overviewErr) {
            setError('Failed to load members data');
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Failed to load members:', err);
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDesignations = useCallback(async () => {
    try {
      const { data } = await cms.raw().get('/api/tenant-designations');
      setDesignations(Array.isArray(data) ? data : []);
    } catch { /* optional */ }
  }, []);

  useEffect(() => {
    loadMembers();
    loadDesignations();
  }, [loadMembers, loadDesignations]);

  const handleDesignationChange = async (userId, designationId) => {
    try {
      await cms.raw().patch(`/api/members/${userId}/designation`, { designationId: designationId || null });
      loadMembers();
    } catch (err) {
      setError(err.message || 'Failed to update designation');
    }
  };

  const handleInvite = async () => {
    if (!inviteForm.email.trim()) {
      setInviteError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) {
      setInviteError('Invalid email format');
      return;
    }

    setInviting(true);
    setInviteError('');
    try {
      // Try POST /api/members/invite first, fallback to /api/invitations
      let sent = false;
      try {
        await cms.raw().post('/api/members/invite', {
          email: inviteForm.email,
          role: inviteForm.role
        });
        sent = true;
      } catch (err) {
        if (err.response?.status === 404) {
          try {
            await cms.raw().post('/api/invitations', {
              email: inviteForm.email,
              role: inviteForm.role
            });
            sent = true;
          } catch (invErr) {
            throw invErr;
          }
        } else {
          throw err;
        }
      }

      if (sent) {
        setInviteOpen(false);
        setInviteForm({ email: '', role: 'viewer' });
        loadMembers();
      }
    } catch (err) {
      console.error('Failed to invite member:', err);
      setInviteError(err.response?.data?.error?.message || err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleAddMember = async () => {
    if (!addForm.email.trim()) { setAddError('Email is required'); return; }
    if (!addForm.password || addForm.password.length < 8) { setAddError('Password must be at least 8 characters'); return; }
    setAdding(true);
    setAddError('');
    try {
      await cms.raw().post('/api/members', {
        email: addForm.email,
        password: addForm.password,
        fullName: addForm.fullName,
        role: addForm.role,
        designationId: addForm.designationId || null,
      });
      setAddOpen(false);
      setAddForm({ email: '', password: '', fullName: '', role: 'viewer', designationId: '' });
      loadMembers();
    } catch (err) {
      setAddError(err.response?.data?.error?.message || err.message || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.user?.email || member.email} from the team?`)) return;
    try {
      if (member.isPending) {
        const invId = member.id.replace('inv-', '');
        await cms.raw().delete(`/api/invitations/${invId}`);
      } else {
        await cms.raw().delete(`/api/members/${member.userId}`);
      }
      loadMembers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to remove member');
    }
  };

  const handleResendInvite = async (member) => {
    try {
      const invId = member.id.replace('inv-', '');
      await cms.raw().post(`/api/invitations/${invId}/resend`, {});
      setError('');
      alert('Invitation resent successfully');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to resend invitation');
    }
  };

  const getRoleColor = (role) => {
    const colors = { admin: '#2563EB', editor: '#10B981', viewer: '#94A3B8' };
    return colors[role] || '#94A3B8';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  // Endpoint doesn't exist - show placeholder
  if (endpointExists === false) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <People sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>
            Members Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Team member management coming soon. Current team size: {memberCount}
          </Typography>
          <Button variant="outlined" startIcon={<Add />} disabled
            sx={{ borderRadius: 2, textTransform: 'none' }}>
            Invite Member (Coming Soon)
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
            Team Members
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Manage your {tenant?.name || 'team'} members
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={loadMembers} sx={{ color: '#64748B' }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#2563EB' }}>
            Add Member
          </Button>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setInviteOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569' }}>
            Invite Member
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Members Table */}
      {members.length === 0 ? (
        <Card sx={{ borderRadius: 3, border: '2px dashed #CBD5E1', boxShadow: 'none', p: 6, textAlign: 'center' }} elevation={0}>
          <People sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748B', mb: 1 }}>
            No team members yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>
            Invite your first team member to get started
          </Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setInviteOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none' }}>
            Invite Member
          </Button>
        </Card>
      ) : (
        <TableContainer component={Card} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1E293B', width: 100 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member, idx) => (
                <TableRow key={member.userId || member.id || `m-${idx}`} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                  <TableCell sx={{ color: '#1E293B', fontWeight: 500 }}>
                    {member.user?.fullName || 'Unknown'}
                  </TableCell>
                  <TableCell sx={{ color: '#64748B', fontFamily: 'monospace', fontSize: 13 }}>
                    {member.user?.email || member.email}
                  </TableCell>
                  <TableCell>
                    <Chip label={member.role} size="small" sx={{
                      borderRadius: 1.5, fontWeight: 600, fontSize: 11,
                      bgcolor: getRoleColor(member.role) + '1A',
                      color: getRoleColor(member.role)
                    }} />
                  </TableCell>
                  <TableCell>
                    {member.isPending ? (
                      <Chip label="Pending" size="small" sx={{ borderRadius: 1.5, fontWeight: 600, fontSize: 11, bgcolor: '#FEF3C7', color: '#D97706' }} />
                    ) : member.role === 'admin' ? (
                      <Chip label={member.designation?.name || 'Owner'} size="small" sx={{
                        borderRadius: 1.5, fontWeight: 600, fontSize: 11,
                        bgcolor: (COLOR_MAP[member.designation?.color] || '#6366F1') + '1A',
                        color: COLOR_MAP[member.designation?.color] || '#6366F1'
                      }} />
                    ) : (
                      <Select
                        size="small"
                        value={member.designation?.id || ''}
                        onChange={(e) => handleDesignationChange(member.userId, e.target.value)}
                        displayEmpty
                        sx={{ minWidth: 140, fontSize: 13, '& .MuiSelect-select': { py: 0.75 } }}
                      >
                        <MenuItem value=""><em>No designation</em></MenuItem>
                        {designations.map((d) => (
                          <MenuItem key={d.id} value={d.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLOR_MAP[d.color] || '#64748B' }} />
                              {d.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {member.isPending && (
                        <Tooltip title="Resend invitation">
                          <IconButton size="small" onClick={() => handleResendInvite(member)} sx={{ color: '#2563EB' }}>
                            <Send sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {member.role !== 'admin' && (
                        <Tooltip title={member.isPending ? 'Cancel invitation' : 'Remove member'}>
                          <IconButton size="small" onClick={() => handleDeleteMember(member)} sx={{ color: '#DC2626', '&:hover': { bgcolor: '#FEF2F2' } }}>
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onClose={() => { setInviteOpen(false); setInviteError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Invite Team Member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2, mt: 1 }}>
            Send an invitation to join your team
          </Typography>
          {inviteError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{inviteError}</Alert>}
          <TextField
            fullWidth label="Email Address" type="email" margin="normal" autoFocus
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            placeholder="member@example.com"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              label="Role"
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => { setInviteOpen(false); setInviteError(''); }} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button onClick={handleInvite} variant="contained" disabled={!inviteForm.email.trim() || inviting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB' }}>
            {inviting ? <CircularProgress size={20} color="inherit" /> : 'Send Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setAddError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Team Member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2, mt: 1 }}>
            Create a new member account directly
          </Typography>
          {addError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{addError}</Alert>}
          <TextField fullWidth label="Full Name" margin="normal"
            value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} />
          <TextField fullWidth label="Email Address" type="email" margin="normal" required
            value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
          <TextField fullWidth label="Password" type="password" margin="normal" required
            value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            helperText="Minimum 8 characters" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="editor">Editor</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
          {designations.length > 0 && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Designation</InputLabel>
              <Select label="Designation" value={addForm.designationId} onChange={(e) => setAddForm({ ...addForm, designationId: e.target.value })}>
                <MenuItem value=""><em>None</em></MenuItem>
                {designations.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLOR_MAP[d.color] || '#64748B' }} />
                      {d.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => { setAddOpen(false); setAddError(''); }} sx={{ textTransform: 'none', color: '#64748B' }}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={adding}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, bgcolor: '#2563EB' }}>
            {adding ? <CircularProgress size={20} color="inherit" /> : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembersTab;
