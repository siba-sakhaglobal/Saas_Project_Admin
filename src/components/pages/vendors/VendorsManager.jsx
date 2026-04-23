import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, Avatar, Card, CardContent,
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Rating,
  Tabs, Tab, CircularProgress, Pagination
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Storefront as VendorIcon, Edit as EditIcon,
  Delete as DeleteIcon, CheckCircle as CheckCircleIcon, HourglassEmpty as HourglassEmptyIcon,
  Inventory2 as Inventory2Icon
} from '@mui/icons-material';
import StatCard, { StatCardsGrid } from '../../common/StatCard';
import cms from '../../../services/cms';

const VendorsManager = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, pending: 0, suspended: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const limit = 20;

  useEffect(() => {
    fetchStats();
    fetchVendors();
  }, [currentTab, currentPage, searchTerm]);

  const fetchStats = async () => {
    try {
      const { data } = await cms.vendors.stats();
      const totalProducts = vendors.reduce((sum, v) => sum + (v.productCount || 0), 0);
      setStats({ ...data, totalProducts });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        ...(currentTab !== 'all' && { status: currentTab === 'inactive' ? 'inactive' : currentTab === 'pending' ? 'pending' : currentTab === 'suspended' ? 'suspended' : 'active' })
      };
      const { data, meta } = await cms.vendors.list(params);
      const vendorsList = data.vendors || [];
      setVendors(vendorsList);
      setTotalPages(Math.ceil((meta?.total || 0) / limit));
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteVendor = async (id) => {
    try {
      await cms.vendors.delete(id);
      setDeleteConfirm(null);
      fetchVendors();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      alert('Error: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const statusColors = {
    active: '#16A34A',
    inactive: '#94A3B8',
    pending: '#D97706',
    suspended: '#DC2626'
  };

  const filteredVendors = vendors.filter(v =>
    searchTerm === '' || v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Vendors</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>Manage suppliers, vendor onboarding, and listings</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => navigate(`/p/${projectId}/vendors/new`)}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
          Add Vendor
        </Button>
      </Box>

      <StatCardsGrid>
        <StatCard label="Total Vendors" value={stats.total} color="#2563EB" icon={VendorIcon} />
        <StatCard label="Active" value={stats.active} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Pending" value={stats.pending} color="#D97706" icon={HourglassEmptyIcon} />
        <StatCard label="Products Listed" value={stats.totalProducts} color="#9333EA" icon={Inventory2Icon} />
      </StatCardsGrid>

      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, boxShadow: 'none' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" placeholder="Search vendors..."
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
        </Box>

        <Box sx={{ borderBottom: '1px solid #E2E8F0' }}>
          <Tabs value={currentTab} onChange={(e, v) => { setCurrentTab(v); setCurrentPage(1); }}>
            <Tab label="All" value="all" />
            <Tab label="Active" value="active" />
            <Tab label="Pending" value="pending" />
            <Tab label="Inactive" value="inactive" />
            <Tab label="Suspended" value="suspended" />
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredVendors.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <VendorIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No vendors found</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8', mb: 3 }}>Add your first vendor to start managing suppliers</Typography>
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => navigate(`/p/${projectId}/vendors/new`)}
              sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
              Add First Vendor
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, p: 2 }}>
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} sx={{ border: '1px solid #E2E8F0' }}>
                  <CardContent sx={{ pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Avatar src={vendor.logoUrl} sx={{ width: 48, height: 48, bgcolor: '#2563EB' }}>
                        {vendor.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/p/${projectId}/vendors/edit/${vendor.id}`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteConfirm(vendor.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{vendor.name}</Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: '#64748B', mb: 1 }}>{vendor.company || 'No company'}</Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mb: 1 }}>{vendor.email}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Rating value={vendor.rating || 0} readOnly size="small" />
                      <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>({vendor.rating || 0})</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Chip label={vendor.status} size="small" sx={{ bgcolor: statusColors[vendor.status] + '20', color: statusColors[vendor.status] }} />
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>{vendor.productCount} products</Typography>
                    </Box>
                    {vendor.commissionPct && (
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Commission: {vendor.commissionPct}%</Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, borderTop: '1px solid #E2E8F0' }}>
              <Pagination count={totalPages} page={currentPage} onChange={(e, page) => setCurrentPage(page)} />
            </Box>
          </>
        )}
      </Paper>

<Dialog open={deleteConfirm !== null} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this vendor?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={() => deleteConfirm && handleDeleteVendor(deleteConfirm)} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorsManager;
