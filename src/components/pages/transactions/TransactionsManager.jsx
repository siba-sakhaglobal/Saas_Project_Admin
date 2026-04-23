import React, { useState, useEffect } from 'react';
import cms from '../../../services/cms';
import dayjs from 'dayjs';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, IconButton, Tooltip, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem,
  LinearProgress, Stack
} from '@mui/material';
import {
  Search as SearchIcon, SwapHoriz as TransactionIcon, Download as ExportIcon,
  Visibility as VisibilityIcon, Refresh as RefreshIcon, Close as CloseIcon,
  AccountBalanceWallet as WalletIcon, CalendarToday as CalendarIcon, CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import StatCard, { StatCardsGrid } from '../../common/StatCard';

const TransactionsManager = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, failed: 0, totalRevenue: 0, totalRefunds: 0 });
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const tabStatusMap = { All: '', Completed: 'completed', Pending: 'pending', Failed: 'failed', Refunded: 'refunded' };
  const tabs = ['All', 'Completed', 'Pending', 'Failed', 'Refunded'];
  const statusChipColors = { completed: '#16A34A', pending: '#D97706', failed: '#DC2626', refunded: '#7C3AED' };
  const typeChipColors = { payment: '#2563EB', refund: '#DC2626' };

  const fetchStats = async () => {
    try {
      const { data } = await cms.transactions.stats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchTransactions = async (currentPage = 0, currentRowsPerPage = 20, search = '', type = '', method = '', status = '') => {
    setLoading(true);
    try {
      const params = {
        page: currentPage + 1,
        limit: currentRowsPerPage,
        search: search || undefined,
        type: type || undefined,
        paymentMethod: method || undefined,
        status: status || undefined,
      };
      Object.keys(params).forEach((k) => params[k] === undefined && delete params[k]);

      const { data, meta } = await cms.transactions.list(params);
      setTransactions((data || []).map((t) => ({
        ...t,
        amountFormatted: `₹${(t.amount || 0).toFixed(2)}`,
      })));
      setTotalCount(meta?.total || 0);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransactions(0, rowsPerPage, searchTerm, typeFilter, paymentMethodFilter, tabStatusMap[tabs[tabValue]]);
  }, []);

  useEffect(() => {
    setPage(0);
    fetchTransactions(0, rowsPerPage, searchTerm, typeFilter, paymentMethodFilter, tabStatusMap[tabs[tabValue]]);
  }, [tabValue, searchTerm, typeFilter, paymentMethodFilter]);

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    fetchTransactions(newPage, rowsPerPage, searchTerm, typeFilter, paymentMethodFilter, tabStatusMap[tabs[tabValue]]);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    fetchTransactions(0, newRowsPerPage, searchTerm, typeFilter, paymentMethodFilter, tabStatusMap[tabs[tabValue]]);
  };

  const handleViewDetails = (txn) => {
    setSelectedTxn(txn);
    setDetailDialogOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailDialogOpen(false);
    setSelectedTxn(null);
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Transactions</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>Read-only ledger of all payment transactions and refunds</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh"><IconButton onClick={() => { fetchStats(); fetchTransactions(page, rowsPerPage, searchTerm, typeFilter, paymentMethodFilter, tabStatusMap[tabs[tabValue]]); }} size="small"
            sx={{ border: '1px solid #E2E8F0', bgcolor: '#fff', color: '#94A3B8', '&:hover': { bgcolor: '#F8FAFC', color: '#475569' } }}>
            <RefreshIcon fontSize="small" />
          </IconButton></Tooltip>
          <Button variant="outlined" startIcon={<ExportIcon />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, borderColor: '#E2E8F0', color: '#475569' }}>
            Export
          </Button>
        </Stack>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <StatCardsGrid>
        <StatCard label="Total Transactions" value={stats.total} color="#2563EB" icon={TransactionIcon} />
        <StatCard label="Completed" value={stats.completed} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Total Revenue" value={`₹${(stats.totalRevenue || 0).toFixed(2)}`} color="#9333EA" icon={TrendingUpIcon} />
        <StatCard label="Total Refunds" value={`₹${(stats.totalRefunds || 0).toFixed(2)}`} color="#DC2626" icon={TrendingDownIcon} />
      </StatCardsGrid>

      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 1.5, bgcolor: '#fff' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}
          sx={{ px: 2, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } }}>
          {tabs.map((t) => <Tab key={t} label={t} />)}
        </Tabs>

        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search reference, customer..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Type</InputLabel>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="refund">Refund</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select value={paymentMethodFilter} onChange={(e) => setPaymentMethodFilter(e.target.value)} label="Payment Method">
              <MenuItem value="">All</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="check">Check</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {transactions.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <TransactionIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No transactions found</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>Try adjusting your filters or search terms</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ '& .MuiTableCell-root': { fontSize: '0.8125rem' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC', '& .MuiTableCell-head': { fontWeight: 700, color: '#475569', border: '1px solid #E2E8F0' } }}>
                    <TableCell>Ref</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Gateway</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id} sx={{ '& .MuiTableCell-body': { border: '1px solid #F1F5F9' }, '&:hover': { bgcolor: '#FAFBFC' } }}>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 500, color: '#1E293B' }}>{txn.transactionRef || '-'}</TableCell>
                      <TableCell><Box><Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1E293B' }}>{txn.customerName}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#64748B' }}>{txn.customerEmail}</Typography></Box></TableCell>
                      <TableCell><Chip label={txn.type} size="small" sx={{ fontSize: '0.6875rem', fontWeight: 600, bgcolor: typeChipColors[txn.type] || '#E2E8F0', color: '#fff' }} /></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#1E293B' }}>{txn.amountFormatted}</TableCell>
                      <TableCell sx={{ color: '#64748B' }}>{txn.paymentMethod || '-'}</TableCell>
                      <TableCell sx={{ color: '#64748B' }}>{txn.paymentGateway || '-'}</TableCell>
                      <TableCell><Chip label={txn.status} size="small" sx={{ fontSize: '0.6875rem', fontWeight: 600, bgcolor: statusChipColors[txn.status] || '#E2E8F0', color: '#fff' }} /></TableCell>
                      <TableCell sx={{ color: '#64748B' }}>{dayjs(txn.createdAt).format('DD MMM YYYY')}</TableCell>
                      <TableCell align="center"><Tooltip title="View details"><IconButton onClick={() => handleViewDetails(txn)} size="small" sx={{ color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}>
                        <VisibilityIcon sx={{ fontSize: 16 }} />
                      </IconButton></Tooltip></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination rowsPerPageOptions={[10, 20, 50]} component="div" count={totalCount} rowsPerPage={rowsPerPage}
              page={page} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange}
              sx={{ borderTop: '1px solid #E2E8F0', '& .MuiTablePagination-root': { p: 1.5 } }} />
          </>
        )}
      </Paper>

      <Dialog open={detailDialogOpen} onClose={handleCloseDetail} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        {selectedTxn && (<>
          {/* Header with close icon */}
          <Box sx={{ bgcolor: selectedTxn.type === 'refund' ? '#FEF2F2' : '#EFF6FF', px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WalletIcon sx={{ fontSize: 20, color: selectedTxn.type === 'refund' ? '#DC2626' : '#2563EB' }} />
                <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B' }}>Transaction Details</Typography>
              </Box>
              <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#64748B', letterSpacing: 0.5 }}>
                {selectedTxn.transactionRef}
              </Typography>
            </Box>
            <IconButton onClick={handleCloseDetail} size="small"
              sx={{ mt: -0.5, mr: -1, color: '#64748B', '&:hover': { bgcolor: 'rgba(0,0,0,0.06)' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Amount banner */}
          <Box sx={{ px: 3, py: 2, bgcolor: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1 }}>Amount</Typography>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: selectedTxn.type === 'refund' ? '#DC2626' : '#1E293B' }}>
                {selectedTxn.type === 'refund' ? '-' : ''}{selectedTxn.amountFormatted} <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#94A3B8' }}>{selectedTxn.currency}</span>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={selectedTxn.type} size="small" sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: typeChipColors[selectedTxn.type], color: '#fff', borderRadius: 1 }} />
              <Chip label={selectedTxn.status} size="small" sx={{ fontWeight: 700, fontSize: '0.6875rem', bgcolor: statusChipColors[selectedTxn.status], color: '#fff', borderRadius: 1 }} />
            </Box>
          </Box>

          {/* Details grid */}
          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Customer</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{selectedTxn.customerName || '-'}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedTxn.customerEmail || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Payment Method</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', textTransform: 'capitalize' }}>{(selectedTxn.paymentMethod || '-').replace(/_/g, ' ')}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Gateway</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B', textTransform: 'capitalize' }}>{selectedTxn.paymentGateway || '-'}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Date</Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1E293B' }}>{dayjs(selectedTxn.createdAt).format('DD MMM YYYY')}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>{dayjs(selectedTxn.createdAt).format('hh:mm:ss A')}</Typography>
              </Box>
              {selectedTxn.gatewayRef && (
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Gateway Reference</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#475569', bgcolor: '#F8FAFC', px: 1.5, py: 0.75, borderRadius: 1, border: '1px solid #E2E8F0' }}>{selectedTxn.gatewayRef}</Typography>
                </Box>
              )}
              {selectedTxn.description && (
                <Box sx={{ gridColumn: 'span 2' }}>
                  <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>Description</Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#475569' }}>{selectedTxn.description}</Typography>
                </Box>
              )}
            </Box>

            {/* Linked records */}
            {(selectedTxn.orderId || selectedTxn.invoiceId) && (
              <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>Linked Records</Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {selectedTxn.orderId && (
                    <Chip label={`Order: ${selectedTxn.order?.orderNumber || selectedTxn.orderId.slice(0, 8)}`} size="small"
                      sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: 1 }} />
                  )}
                  {selectedTxn.invoiceId && (
                    <Chip label={`Invoice: ${selectedTxn.invoice?.invoiceNumber || selectedTxn.invoiceId.slice(0, 8)}`} size="small"
                      sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, bgcolor: '#F0FDF4', color: '#16A34A', borderRadius: 1 }} />
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
        </>)}
      </Dialog>
    </Box>
  );
};

export default TransactionsManager;
