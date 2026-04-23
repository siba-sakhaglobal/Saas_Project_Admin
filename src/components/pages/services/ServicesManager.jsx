import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel, Chip,
  Stack, Alert, Snackbar, InputAdornment, Tabs, Tab, IconButton, Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  BusinessCenter as ServiceIcon, Star as StarIcon,
  StarBorder as StarBorderIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import StatCard, { StatCardsGrid } from '../../common/StatCard';
import cms from '../../../services/cms';

const ServicesManager = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, draft: 0, featured: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  const categories = ['development', 'design', 'marketing', 'infrastructure'];
  const statuses = ['active', 'inactive', 'draft'];

  useEffect(() => {
    fetchServices();
    fetchStats();
  }, [searchTerm, categoryFilter, tabValue, pagination.page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      let status = '';
      if (tabValue === 1) status = 'active';
      else if (tabValue === 2) status = 'inactive';
      else if (tabValue === 3) status = 'draft';

      const { data, meta } = await cms.services.list({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status,
        category: categoryFilter,
        featured: ''
      });

      const servicesList = Array.isArray(data) ? data : data.services || [];

      setServices(servicesList);
      setPagination({ ...pagination, total: meta?.total || 0 });
    } catch (error) {
      console.error('Error fetching services:', error);
      showSnackbar('Failed to fetch services', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await cms.services.stats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };


  const handleDeleteService = async () => {
    try {
      await cms.services.delete(deleteTarget.id);
      showSnackbar('Service deleted successfully', 'success');
      setOpenDeleteDialog(false);
      setDeleteTarget(null);
      fetchServices();
      fetchStats();
    } catch (error) {
      console.error('Error deleting service:', error);
      showSnackbar('Failed to delete service', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#16A34A';
      case 'inactive': return '#DC2626';
      case 'draft': return '#D97706';
      default: return '#94A3B8';
    }
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Services</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>Manage your service listings, pricing, and bookings</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate('new')}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
          Add Service
        </Button>
      </Box>

      {/* Stats Cards */}
      <StatCardsGrid>
        <StatCard label="Total" value={stats.total} color="#2563EB" icon={ServiceIcon} />
        <StatCard label="Active" value={stats.active} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Draft" value={stats.draft} color="#D97706" icon={EditIcon} />
        <StatCard label="Featured" value={stats.featured} color="#9333EA" icon={StarIcon} />
      </StatCardsGrid>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => { setTabValue(v); setPagination({ ...pagination, page: 1 }); }}
          sx={{
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem', color: '#475569', '&.Mui-selected': { color: '#2563EB' } },
            '& .MuiTabs-indicator': { backgroundColor: '#2563EB' }
          }}
        >
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Inactive (${stats.inactive})`} />
          <Tab label={`Draft (${stats.draft})`} />
        </Tabs>
      </Paper>

      {/* Search & Filter */}
      <Paper sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 2, mb: 3 }}>
        <TextField size="small" placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPagination({ ...pagination, page: 1 }); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPagination({ ...pagination, page: 1 }); }} label="Category">
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Paper>

      {/* Services Table */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : filteredServices.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <ServiceIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No services found</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8', mb: 3 }}>
              {searchTerm || categoryFilter ? 'Try adjusting your search or filters' : 'Create your first service to get started'}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => navigate('new')}
              sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
              Create Service
            </Button>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Price (₹)</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Duration</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Featured</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id} style={{ borderBottom: '1px solid #E2E8F0', '&:hover': { backgroundColor: '#F8FAFC' } }}>
                    <td style={{ padding: '12px 16px', color: '#1E293B', fontWeight: 500 }}>{service.name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {service.category && <Chip label={service.category} size="small" sx={{ backgroundColor: '#F1F5F9', color: '#2563EB' }} />}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#1E293B', fontWeight: 500 }}>
                      {service.priceCents ? (service.priceCents / 100).toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>
                      {service.durationMins ? `${service.durationMins} min` : '-'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Chip label={service.status} size="small" sx={{ backgroundColor: getStatusColor(service.status) + '20', color: getStatusColor(service.status), fontWeight: 600 }} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {service.featured ? <StarIcon sx={{ color: '#D97706', fontSize: 18 }} /> : <StarBorderIcon sx={{ color: '#94A3B8', fontSize: 18 }} />}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`edit/${service.id}`)} sx={{ color: '#2563EB' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => { setDeleteTarget(service); setOpenDeleteDialog(true); }} sx={{ color: '#DC2626' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.875rem', color: '#475569' }}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)} ({pagination.total} total)
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}>Previous</Button>
              <Button variant="outlined" size="small" disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}>Next</Button>
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteService} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicesManager;
