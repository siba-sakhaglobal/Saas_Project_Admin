import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, CircularProgress, Card, CardContent,
} from '@mui/material';
import {
  Save as SaveIcon, ArrowBack as BackIcon,
  Schedule as ScheduleIcon, People as PeopleIcon, LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import cms from '../../../services/cms';

const cardStyle = { border: '1px solid #E2E8F0', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', background: '#fff' };
const labelStyle = { fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 };

const statusColors = {
  scheduled: '#2563EB',
  confirmed: '#7C3AED',
  in_progress: '#D97706',
  completed: '#16A34A',
  cancelled: '#DC2626',
  no_show: '#94A3B8',
};

const AppointmentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const projectId = localStorage.getItem('project_id');
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    serviceId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    scheduledAt: null,
    endAt: null,
    durationMins: 30,
    status: 'scheduled',
    notes: '',
    location: '',
    assignedTo: '',
    metaJson: '',
  });

  const [services, setServices] = useState([]);

  const { data: appointment, isLoading: appointmentLoading } = useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const { data } = await cms.appointments.get(id);
      return data;
    },
    enabled: !!id && isEditing,
  });

  const { isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const { data } = await cms.services.list({ limit: 100 });
        const svcList = Array.isArray(data) ? data : data.services || [];
        setServices(svcList);
        return svcList;
      } catch (err) {
        console.error('Failed to fetch services:', err);
        return [];
      }
    },
  });

  useEffect(() => {
    if (appointment && isEditing) {
      setFormData({
        serviceId: appointment.serviceId || '',
        customerName: appointment.customerName || '',
        customerEmail: appointment.customerEmail || '',
        customerPhone: appointment.customerPhone || '',
        scheduledAt: appointment.scheduledAt ? dayjs(appointment.scheduledAt) : null,
        endAt: appointment.endAt ? dayjs(appointment.endAt) : null,
        durationMins: appointment.durationMins || 30,
        status: appointment.status || 'scheduled',
        notes: appointment.notes || '',
        location: appointment.location || '',
        assignedTo: appointment.assignedTo || '',
        metaJson: appointment.metaJson ? JSON.stringify(appointment.metaJson) : '',
      });
    }
  }, [appointment, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data) =>
      cms.appointments.create({
        ...data,
        projectId,
        scheduledAt: data.scheduledAt?.toISOString(),
        endAt: data.endAt?.toISOString(),
        metaJson: data.metaJson ? JSON.parse(data.metaJson) : null,
      }),
    onSuccess: () => {
      toast.success('Appointment created!');
      queryClient.invalidateQueries(['appointments']);
      navigate('..');
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || 'Failed to create appointment'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      cms.appointments.update(id, {
        ...data,
        projectId,
        scheduledAt: data.scheduledAt?.toISOString(),
        endAt: data.endAt?.toISOString(),
        metaJson: data.metaJson ? JSON.parse(data.metaJson) : null,
      }),
    onSuccess: () => {
      toast.success('Appointment updated!');
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['appointment', id]);
      navigate('..');
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || 'Failed to update appointment'),
  });

  const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const calculateEndAt = (startTime, duration) => {
    if (!startTime) return null;
    return startTime.add(duration, 'minutes');
  };

  const handleScheduledAtChange = (newTime) => {
    set('scheduledAt', newTime);
    const newEndAt = calculateEndAt(newTime, formData.durationMins);
    set('endAt', newEndAt);
  };

  const handleDurationChange = (duration) => {
    set('durationMins', duration);
    const newEndAt = calculateEndAt(formData.scheduledAt, duration);
    set('endAt', newEndAt);
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.scheduledAt) {
      toast.error('Customer name and scheduled date/time are required');
      return;
    }
    isEditing ? updateMutation.mutate(formData) : createMutation.mutate(formData);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (appointmentLoading || servicesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#fff',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
            {isEditing ? 'Edit Appointment' : 'Create New Appointment'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {isEditing ? 'Update appointment details' : 'Fill in the appointment details below'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('..')}
            sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !formData.customerName || !formData.scheduledAt}
            sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontSize: 13 }}
          >
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </Stack>
      </Box>

      {/* Form Body */}
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Customer Information */}
            <div style={cardStyle}>
              <div style={labelStyle}><PeopleIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Customer Information</div>
              <Stack spacing={2}>
                <TextField fullWidth label="Customer Name" value={formData.customerName}
                  onChange={(e) => set('customerName', e.target.value)} required size="small" placeholder="Enter customer name..." />
                <TextField fullWidth label="Email" type="email" value={formData.customerEmail}
                  onChange={(e) => set('customerEmail', e.target.value)} size="small" placeholder="customer@example.com" />
                <TextField fullWidth label="Phone" value={formData.customerPhone}
                  onChange={(e) => set('customerPhone', e.target.value)} size="small" placeholder="(555) 123-4567" />
              </Stack>
            </div>

            {/* Scheduling */}
            <div style={cardStyle}>
              <div style={labelStyle}><ScheduleIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Scheduling</div>
              <Stack spacing={2}>
                <TextField fullWidth label="Scheduled Date & Time" type="datetime-local" required size="small"
                  value={formData.scheduledAt ? formData.scheduledAt.format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => handleScheduledAtChange(e.target.value ? dayjs(e.target.value) : null)}
                  InputLabelProps={{ shrink: true }} />
                <TextField fullWidth label="Duration (minutes)" type="number" size="small"
                  value={formData.durationMins}
                  onChange={(e) => handleDurationChange(parseInt(e.target.value) || 30)} />
                <TextField fullWidth label="End Date & Time" type="datetime-local" disabled size="small"
                  value={formData.endAt ? formData.endAt.format('YYYY-MM-DDTHH:mm') : ''}
                  InputLabelProps={{ shrink: true }} />
              </Stack>
            </div>

            {/* Location & Assignment */}
            <div style={cardStyle}>
              <div style={labelStyle}><LocationIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Location & Assignment</div>
              <Stack spacing={2}>
                <TextField fullWidth label="Location" value={formData.location}
                  onChange={(e) => set('location', e.target.value)} size="small" placeholder="e.g., Room A, Building 2..." />
                <TextField fullWidth label="Assigned To" value={formData.assignedTo}
                  onChange={(e) => set('assignedTo', e.target.value)} size="small" placeholder="Staff name or ID..." />
              </Stack>
            </div>

            {/* Notes */}
            <div style={cardStyle}>
              <div style={labelStyle}>Notes</div>
              <TextField fullWidth multiline rows={4} label="Additional Notes" size="small"
                value={formData.notes} onChange={(e) => set('notes', e.target.value)}
                placeholder="Any additional information..." />
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Status */}
            <Card sx={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1E293B', mb: 2 }}>Status</Typography>
                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} onChange={(e) => set('status', e.target.value)} label="Status">
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="confirmed">Confirmed</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                    <MenuItem value="no_show">No Show</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Chip label={formData.status} sx={{ bgcolor: statusColors[formData.status], color: 'white', fontWeight: 600 }} />
                </Box>
              </CardContent>
            </Card>

            {/* Service */}
            <Card sx={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1E293B', mb: 2 }}>Service</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Service</InputLabel>
                  <Select value={formData.serviceId} onChange={(e) => set('serviceId', e.target.value)} label="Select Service">
                    <MenuItem value="">None</MenuItem>
                    {services.map((svc) => <MenuItem key={svc.id} value={svc.id}>{svc.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card sx={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1E293B', mb: 2 }}>Summary</Typography>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748B' }}>Start</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                      {formData.scheduledAt ? formData.scheduledAt.format('MMM DD, YYYY h:mm A') : '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748B' }}>End</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>
                      {formData.endAt ? formData.endAt.format('MMM DD, YYYY h:mm A') : '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#64748B' }}>Duration</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{formData.durationMins} mins</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default AppointmentEditor;
