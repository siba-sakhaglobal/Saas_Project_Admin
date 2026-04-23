import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, IconButton, Tooltip,
  Tabs, Tab, Chip, Alert, Snackbar, Pagination
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, CalendarMonth as AppointmentIcon,
  Edit as EditIcon, Delete as DeleteIcon, Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon, Cancel as CancelIcon
} from '@mui/icons-material';
import StatCard, { StatCardsGrid } from '../../common/StatCard';
import dayjs from 'dayjs';
import cms from '../../../services/cms';

const statusColors = {
  scheduled: '#2563EB',
  confirmed: '#7C3AED',
  in_progress: '#D97706',
  completed: '#16A34A',
  cancelled: '#DC2626',
  no_show: '#94A3B8'
};

const AppointmentsManager = () => {
  const navigate = useNavigate();
  const projectId = localStorage.getItem('project_id');
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, confirmed: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const tabs = ['All', 'Upcoming', 'Today', 'Completed', 'Cancelled'];
  const statuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];

  const fetchAppointments = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 20,
        search: searchTerm,
        from: fromDate?.toISOString(),
        to: toDate?.toISOString()
      };

      if (tabValue === 1) params.status = 'scheduled';
      else if (tabValue === 3) params.status = 'completed';
      else if (tabValue === 4) params.status = 'cancelled';

      const { data, meta } = await cms.appointments.list(params);
      setAppointments(data.appointments || []);
      setTotalPages(Math.ceil((meta?.total || 0) / 20));
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load appointments', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [projectId, currentPage, searchTerm, tabValue, fromDate, toDate]);

  const fetchStats = useCallback(async () => {
    if (!projectId) return;
    try {
      const { data } = await cms.appointments.stats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [fetchAppointments, fetchStats]);


  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await cms.appointments.delete(id);
      setSnackbar({ open: true, message: 'Appointment deleted', severity: 'success' });
      fetchAppointments();
      fetchStats();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete appointment', severity: 'error' });
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Appointments</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>Manage customer appointments</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate('new')}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
          New Appointment
        </Button>
      </Box>

      <StatCardsGrid>
        <StatCard label="Total" value={stats.total} color="#2563EB" icon={AppointmentIcon} />
        <StatCard label="Upcoming" value={stats.scheduled} color="#D97706" icon={ScheduleIcon} />
        <StatCard label="Completed" value={stats.completed} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Cancelled" value={stats.cancelled} color="#DC2626" icon={CancelIcon} />
      </StatCardsGrid>

      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, boxShadow: 'none' }}>
        <Tabs value={tabValue} onChange={(_, v) => { setTabValue(v); setCurrentPage(1); }}
          sx={{ px: 2, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } }}>
          {tabs.map((t) => <Tab key={t} label={t} />)}
        </Tabs>

        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search by name..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
        </Box>

        {appointments.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <AppointmentIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No appointments</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8', mb: 3 }}>Schedule your first appointment to get started</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('new')}
              sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
              Schedule First Appointment
            </Button>
          </Box>
        ) : (
          <>
            <Box>
              {appointments.map((appt) => (
                <Box key={appt.id} sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{appt.customerName}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748B', mb: 0.5 }}>
                      {appt.service?.name || 'N/A'} • {dayjs(appt.scheduledAt).format('MMM DD, YYYY h:mm A')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                      <Chip label={appt.status} size="small" sx={{ bgcolor: statusColors[appt.status], color: 'white', height: 24 }} />
                      {appt.location && <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>📍 {appt.location}</Typography>}
                      {appt.assignedTo && <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>👤 {appt.assignedTo}</Typography>}
                      {appt.durationMins && <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>⏱ {appt.durationMins}m</Typography>}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`edit/${appt.id}`)}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(appt.id)}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination count={totalPages} page={currentPage} onChange={(_, v) => setCurrentPage(v)} />
            </Box>
          </>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AppointmentsManager;
