import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, InputAdornment, IconButton, Tooltip,
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, CircularProgress, TablePagination, Stack
} from '@mui/material';
import {
  Add as AddIcon, Search as SearchIcon, Receipt as InvoiceIcon, FilterList as FilterIcon,
  Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon,
  CheckCircle as CheckCircleIcon, Warning as WarningIcon, AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import StatCard, { StatCardsGrid } from '../../common/StatCard';
import cms from '../../../services/cms';

const STATUS_COLORS = {
  draft: '#94A3B8',
  sent: '#2563EB',
  paid: '#16A34A',
  overdue: '#DC2626',
  cancelled: '#475569',
  refunded: '#D97706'
};

const InvoicesManager = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0, paid: 0, overdue: 0, cancelled: 0, totalPaid: 0, overdueCount: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const tabs = ['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];

  useEffect(() => {
    fetchStats();
    fetchInvoices();
  }, [page, limit, tabValue, searchTerm]);

  const fetchStats = async () => {
    try {
      const { data } = await cms.invoices.stats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError('');
    try {
      const status = tabValue === 0 ? '' : tabs[tabValue].toLowerCase();
      const { data, meta } = await cms.invoices.list({
        page: page + 1,
        limit,
        search: searchTerm,
        status
      });
      setInvoices(data || []);
      setTotal(meta?.total || 0);
    } catch (err) {
      setError('Failed to load invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await cms.invoices.delete(id);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      setError('Failed to delete invoice');
    }
  };

  const formatCurrency = (cents) => {
    if (!cents) return '₹0';
    return `₹${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const downloadInvoicePDF = (inv) => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${inv.invoiceNumber}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;color:#1E293B;padding:40px;max-width:800px;margin:auto}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #2563EB}
.logo{font-size:24px;font-weight:800;color:#2563EB}.inv-title{text-align:right}.inv-title h2{font-size:28px;color:#2563EB;margin-bottom:4px}
.inv-title p{font-size:13px;color:#64748B}.meta{display:flex;justify-content:space-between;margin-bottom:28px}
.meta-block h4{font-size:11px;text-transform:uppercase;color:#94A3B8;margin-bottom:6px;letter-spacing:1px}
.meta-block p{font-size:13px;margin-bottom:3px}table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#F1F5F9;padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;color:#64748B;letter-spacing:0.5px}
td{padding:10px 12px;border-bottom:1px solid #E2E8F0;font-size:13px}.amount{text-align:right}
.totals{width:280px;margin-left:auto}.totals tr td{padding:6px 12px;font-size:13px}
.totals .total-row{font-weight:700;font-size:15px;border-top:2px solid #1E293B;color:#2563EB}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;text-align:center}
.badge{display:inline-block;padding:4px 12px;border-radius:4px;font-weight:700;font-size:12px;background:${inv.status==='paid'?'#DCFCE7':'#FEF3C7'};color:${inv.status==='paid'?'#166534':'#92400E'}}
@media print{body{padding:20px}@page{margin:15mm}}</style></head><body>
<div class="header"><div class="logo">SaaS Project Admin</div><div class="inv-title"><h2>INVOICE</h2><p>${inv.invoiceNumber}</p></div></div>
<div class="meta"><div class="meta-block"><h4>Bill To</h4><p><strong>${inv.customerName}</strong></p><p>${inv.customerEmail||''}</p></div>
<div class="meta-block" style="text-align:right"><h4>Invoice Details</h4><p>Date: ${formatDate(inv.createdAt)}</p>
<p>Due: ${formatDate(inv.dueDate)}</p><p>Status: <span class="badge">${(inv.status||'').toUpperCase()}</span></p></div></div>
<table><thead><tr><th>Description</th><th>Qty</th><th class="amount">Unit Price</th><th class="amount">Amount</th></tr></thead>
<tbody>${(inv.itemsJson||[]).map(item=>`<tr><td>${item.description||item.name||'-'}</td><td>${item.quantity||item.qty||1}</td>
<td class="amount">${formatCurrency((item.unitPrice||item.amount||0))}</td>
<td class="amount">${formatCurrency((item.quantity||item.qty||1)*(item.unitPrice||item.amount||0))}</td></tr>`).join('')}
${(inv.itemsJson||[]).length===0?'<tr><td colspan="4" style="text-align:center;color:#94A3B8">No line items</td></tr>':''}</tbody></table>
<table class="totals"><tr><td>Subtotal</td><td class="amount">${formatCurrency(inv.subtotalCents)}</td></tr>
<tr><td>Tax (18% GST)</td><td class="amount">${formatCurrency(inv.taxCents)}</td></tr>
${inv.discountCents?`<tr><td>Discount</td><td class="amount">-${formatCurrency(inv.discountCents)}</td></tr>`:''}
<tr class="total-row"><td>Total</td><td class="amount">${formatCurrency(inv.totalCents)}</td></tr></table>
<div class="footer"><p>Thank you for your business</p><p style="margin-top:4px">Generated by SaaS Project Admin</p></div></body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 250); }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>Invoices</Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>Create and manage invoices, track payments</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('new')}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, '&:hover': { bgcolor: '#1D4ED8' } }}>
          Create Invoice
        </Button>
      </Box>

      <StatCardsGrid>
        <StatCard label="Total Invoices" value={stats.total} color="#2563EB" icon={InvoiceIcon} />
        <StatCard label="Paid" value={stats.paid} color="#16A34A" icon={CheckCircleIcon} />
        <StatCard label="Overdue" value={stats.overdueCount} color="#DC2626" icon={WarningIcon} />
        <StatCard label="Total Paid" value={formatCurrency(stats.totalPaid * 100)} color="#9333EA" icon={AttachMoneyIcon} />
      </StatCardsGrid>

      <Paper sx={{ border: '1px solid #E2E8F0', borderRadius: 2, boxShadow: 'none' }}>
        <Tabs value={tabValue} onChange={(_, v) => { setTabValue(v); setPage(0); }}
          sx={{ px: 2, borderBottom: '1px solid #E2E8F0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } }}>
          {tabs.map((t) => <Tab key={t} label={t} />)}
        </Tabs>

        <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField size="small" placeholder="Search invoices..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> }}
            sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }} />
          <Tooltip title="Filter"><IconButton sx={{ border: '1px solid #E2E8F0' }}><FilterIcon /></IconButton></Tooltip>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : invoices.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <InvoiceIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, color: '#475569', mb: 1 }}>No invoices yet</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8', mb: 3 }}>Create your first invoice to start billing</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('new')}
              sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}>
              Create First Invoice
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} sx={{ borderBottom: '1px solid #E2E8F0', '&:hover': { backgroundColor: '#F8FAFC' } }}>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1E293B' }}>{invoice.invoiceNumber}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#475569' }}>{invoice.customerName}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#1E293B', fontWeight: 500 }}>{formatCurrency(invoice.totalCents)}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#475569' }}>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>
                        <Chip label={invoice.status} size="small" sx={{
                          backgroundColor: `${STATUS_COLORS[invoice.status]}20`,
                          color: STATUS_COLORS[invoice.status],
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center' }}>
                          <Tooltip title="Download PDF">
                            <IconButton size="small" onClick={() => downloadInvoicePDF(invoice)} sx={{ color: '#16A34A' }}>
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => navigate(`edit/${invoice.id}`)} sx={{ color: '#2563EB' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => handleDelete(invoice.id)} sx={{ color: '#DC2626' }}>
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
            <TablePagination rowsPerPageOptions={[10, 20, 50]} component="div" count={total} rowsPerPage={limit}
              page={page} onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value)); setPage(0); }}
              sx={{ borderTop: '1px solid #E2E8F0' }} />
          </>
        )}
      </Paper>

    </Box>
  );
};

export default InvoicesManager;
