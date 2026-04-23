import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, IconButton, Tooltip, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, CircularProgress, Alert
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, LocalShipping as ShipmentIcon,
  Edit as EditIcon, Delete as DeleteIcon, Flight as FlightIcon,
  CheckCircle as CheckCircleIcon, Undo as UndoIcon
} from '@mui/icons-material';
import StatCard, { StatCardsGrid } from '../../common/StatCard';
import dayjs from 'dayjs';
import cms from '../../../services/cms';

const STATUS_COLORS = {
  pending: '#94A3B8',
  picked_up: '#D97706',
  in_transit: '#2563EB',
  out_for_delivery: '#7C3AED',
  delivered: '#16A34A',
  returned: '#DC2626',
  failed: '#991B1B'
};

const CARRIERS = ['Blue Dart', 'DTDC', 'Delhivery', 'FedEx', 'India Post', 'Ecom Express'];

const formatStatus = (status) => status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const ShipmentsManager = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [stats, setStats] = useState({ total: 0, in_transit: 0, delivered: 0, returned: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);

  const tabs = [
    { label: 'All', status: null },
    { label: 'Pending', status: 'pending' },
    { label: 'In Transit', status: 'in_transit' },
    { label: 'Delivered', status: 'delivered' },
    { label: 'Returned', status: 'returned' }
  ];

  const fetchShipments = async (p = 0) => {
    setLoading(true);
    setError(null);
    try {
      const status = tabs[tabValue].status;
      const { data } = await cms.shipments.list({
        page: p + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: status || undefined
      });
      setShipments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await cms.shipments.stats();
      setStats(data);
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchShipments(0);
    fetchStats();
  }, [tabValue, searchTerm]);

  useEffect(() => {
    if (page !== 0) {
      fetchShipments(page);
    }
  }, [page, rowsPerPage]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipment?')) return;
    setLoading(true);
    setError(null);
    try {
      await cms.shipments.delete(id);
      fetchShipments(page);
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Shipments</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>Track shipments, manage delivery and returns</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(`/p/${projectId}/shipments/new`)}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
          Create Shipment
        </Button>
      </Box>

      <StatCardsGrid>
        <StatCard label="Total Shipments" value={stats.total || 0} color="#2563EB" icon={ShipmentIcon} />
        <StatCard label="In Transit" value={stats.in_transit || 0} color="#2563EB" icon={FlightIcon} />
        <StatCard label="Delivered" value={stats.delivered || 0} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Returned" value={stats.returned || 0} color="#DC2626" icon={UndoIcon} />
      </StatCardsGrid>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, boxShadow: 'none' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}
          sx={{ px: 2, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } }}>
          {tabs.map((t, i) => <Tab key={i} label={t.label} />)}
        </Tabs>

        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" placeholder="Search tracking number..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
        </Box>

        {loading && !shipments.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && shipments.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <ShipmentIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No shipments</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>No shipments found for this filter</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Tracking #</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Carrier</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Order #</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Est. Delivery</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', fontSize: '0.875rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shipments.map((s) => (
                  <TableRow key={s.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell sx={{ fontSize: '0.875rem', color: '#334155' }}>{s.trackingNumber}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', color: '#334155' }}>{s.carrier}</TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', color: '#334155' }}>{s.order?.orderNumber || '-'}</TableCell>
                    <TableCell>
                      <Chip label={formatStatus(s.status)} sx={{ bgcolor: STATUS_COLORS[s.status] || '#94A3B8', color: '#fff', fontSize: '0.75rem' }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.875rem', color: '#334155' }}>
                      {s.estimatedDelivery ? dayjs(s.estimatedDelivery).format('DD MMM YYYY') : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => navigate(`/p/${projectId}/shipments/edit/${s.id}`)} sx={{ color: '#2563EB' }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: '#DC2626' }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {shipments.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[10, 20, 50]}
            component="div"
            count={stats.total || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
        )}
      </Paper>
    </Box>
  );
};

export default ShipmentsManager;
