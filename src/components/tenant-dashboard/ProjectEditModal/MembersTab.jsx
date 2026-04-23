import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Alert,
  Select, MenuItem, Skeleton
} from '@mui/material';
import { Add, Delete, People } from '@mui/icons-material';
import cms from '../../../services/cms';

const MembersTab = ({ project, onSnackbar }) => {
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedRole, setSelectedRole] = useState('viewer');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadMembers();
  }, [project]);

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: allMembersData } = await cms.raw().get('/api/members');
      const members = allMembersData || [];
      setAllMembers(members);

      const projectMembers = members.filter(m =>
        m.projectGrants?.some(g => g.projectId === project.id)
      );
      setMembers(projectMembers);
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to load members';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedMemberId) {
      onSnackbar('Please select a member', 'error');
      return;
    }

    setAdding(true);
    try {
      await cms.raw().post(`/api/members/${selectedMemberId}/project-grants`, {
        projectId: project.id,
        role: selectedRole
      });
      onSnackbar('Member added successfully', 'success');
      setAddOpen(false);
      setSelectedMemberId('');
      setSelectedRole('viewer');
      loadMembers();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to add member';
      onSnackbar(msg, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;

    try {
      await cms.raw().delete(`/api/members/${userId}/project-grants/${project.id}`);
      onSnackbar('Member removed successfully', 'success');
      loadMembers();
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to remove member';
      onSnackbar(msg, 'error');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1E293B' }}>
          Project Members
        </Typography>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => setAddOpen(true)}
          sx={{ textTransform: 'none', color: '#2563EB', fontWeight: 600 }}
        >
          Add Member
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} height={60} />)}
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
          <Button size="small" onClick={loadMembers} sx={{ ml: 2, textTransform: 'none' }}>
            Retry
          </Button>
        </Alert>
      ) : members.length === 0 ? (
        <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#F8FAFC', borderRadius: 2 }}>
          <People sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
          <Typography variant="body2" sx={{ color: '#94A3B8' }}>
            No members assigned to this project yet
          </Typography>
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: 12, width: 60 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map(member => {
              const grant = member.projectGrants?.find(g => g.projectId === project.id);
              return (
                <TableRow key={member.userId} sx={{ borderBottom: '1px solid #E2E8F0' }}>
                  <TableCell sx={{ fontSize: 14, color: '#1E293B', fontWeight: 500 }}>
                    {member.user?.fullName || 'Unknown'}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: '#64748B' }}>
                    {member.user?.email || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grant?.role || 'viewer'}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 12,
                        bgcolor: grant?.role === 'editor' ? '#EFF6FF' : '#F1F5F9',
                        color: grant?.role === 'editor' ? '#2563EB' : '#64748B'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Remove member">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMember(member.userId)}
                        sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {/* Add Member Dialog */}
      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Member to Project</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Select
            fullWidth
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            displayEmpty
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Select a member...</MenuItem>
            {allMembers
              .filter(m => !members.some(pm => pm.userId === m.userId))
              .map(member => (
                <MenuItem key={member.userId} value={member.userId}>
                  {member.user?.fullName} ({member.user?.email})
                </MenuItem>
              ))}
          </Select>

          <Typography variant="caption" sx={{ color: '#64748B', mb: 1, display: 'block' }}>
            Project Role
          </Typography>
          <Select
            fullWidth
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            size="small"
          >
            <MenuItem value="viewer">Viewer</MenuItem>
            <MenuItem value="editor">Editor</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            onClick={handleAddMember}
            variant="contained"
            disabled={adding || !selectedMemberId}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' }
            }}
          >
            {adding ? 'Adding...' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembersTab;
