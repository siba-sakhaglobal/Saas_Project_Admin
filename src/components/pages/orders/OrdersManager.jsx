import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, IconButton, Chip, TextField, Select, MenuItem, FormControl, InputLabel, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Tooltip, Alert, Snackbar, InputAdornment, Tabs, Tab, Stack
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as ViewIcon, FilterList as FilterIcon, ShoppingCart as OrderIcon,
  HourglassEmpty as HourglassEmptyIcon, CheckCircle as CheckCircleIcon, AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import StatCard, { StatCardsGrid } from '../../common/StatCard';
import cms from '../../../services/cms';

const OrdersManager = () => {
  const navigate = useNavigate();

  // State
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    totalRevenue: 0,
    processing: 0,
    confirmed: 0,
    shipped: 0,
    cancelled: 0,
    refunded: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totalRecords, setTotalRecords] = useState(0);

  // Tabs
  const tabs = [
    { label: 'All', status: 'all' },
    { label: 'Pending', status: 'pending' },
    { label: 'Processing', status: 'processing' },
    { label: 'Shipped', status: 'shipped' },
    { label: 'Delivered', status: 'delivered' },
    { label: 'Cancelled', status: 'cancelled' }
  ];

  // Status colors
  const statusColors = {
    pending: '#D97706',
    confirmed: '#2563EB',
    processing: '#7C3AED',
    shipped: '#06B6D4',
    delivered: '#16A34A',
    cancelled: '#DC2626',
    refunded: '#94A3B8'
  };

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, filterStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const status = filterStatus === 'all' ? '' : filterStatus;
      const { data, meta } = await cms.orders.list({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status
      });

      setOrders(data || []);
      setTotalRecords((meta?.total) || 0);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showSnackbar('Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await cms.orders.stats();
      setStats(data || {
        total: 0,
        pending: 0,
        delivered: 0,
        totalRevenue: 0,
        processing: 0,
        confirmed: 0,
        shipped: 0,
        cancelled: 0,
        refunded: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };


  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      setLoading(true);
      await cms.orders.delete(orderId);
      showSnackbar('Order deleted successfully', 'success');
      fetchOrders();
      fetchStats();
    } catch (error) {
      console.error('Error deleting order:', error);
      showSnackbar('Failed to delete order', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilterStatus(tabs[newValue].status);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const formatMoney = (cents) => {
    if (!cents) return '₹0.00';
    return `₹${(cents / 100).toFixed(2)}`;
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>
            Orders
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>
            Track and manage customer orders
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('new')}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
        >
          Create Order
        </Button>
      </Box>

      {/* Stats Grid */}
      <StatCardsGrid>
        <StatCard label="Total Orders" value={stats.total || 0} color="#2563EB" icon={OrderIcon} />
        <StatCard label="Pending" value={stats.pending || 0} color="#D97706" icon={HourglassEmptyIcon} />
        <StatCard label="Delivered" value={stats.delivered || 0} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Total Revenue" value={formatMoney(stats.totalRevenue ? stats.totalRevenue * 100 : 0)} color="#9333EA" icon={AttachMoneyIcon} />
      </StatCardsGrid>

      {/* Orders Table */}
      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, boxShadow: 'none' }}>
        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            px: 2,
            borderBottom: '1px solid #E2E8F0',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' }
          }}
        >
          {tabs.map((tab, idx) => <Tab key={idx} label={tab.label} />)}
        </Tabs>

        {/* Search Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by order number or customer name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment>
            }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
          <Tooltip title="Filter">
            <IconButton sx={{ border: '1px solid #E2E8F0' }}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Table */}
        {orders.length > 0 ? (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Order Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 600, color: '#2563EB' }}>{order.orderNumber}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography sx={{ fontWeight: 500, color: '#1E293B' }}>
                            {order.customerName}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {order.customerEmail}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        {formatMoney(order.totalCents)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            backgroundColor: statusColors[order.status] + '20',
                            color: statusColors[order.status],
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#64748B' }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`edit/${order.id}`)}
                              sx={{ color: '#2563EB' }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`edit/${order.id}`)}
                              sx={{ color: '#F59E0B' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteOrder(order.id)}
                              sx={{ color: '#DC2626' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <OrderIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>
              No orders found
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
              Create your first order to get started
            </Typography>
          </Box>
        )}
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManager;
