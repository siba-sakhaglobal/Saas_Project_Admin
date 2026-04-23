import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, CircularProgress, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Save as SaveIcon, ArrowBack as BackIcon, Add as AddIcon, Delete as DeleteIcon,
  Receipt as InvoiceIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import cms from '../../../services/cms';

const STATUS_COLORS = {
  draft: '#94A3B8', sent: '#2563EB', paid: '#16A34A',
  overdue: '#DC2626', cancelled: '#475569', refunded: '#D97706'
};

const sectionStyle = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle = {
  fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 16,
  display: 'flex', alignItems: 'center', gap: 8,
};

const InvoiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    invoiceNumber: '', orderId: '', customerName: '', customerEmail: '',
    status: 'draft', items: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    subtotalCents: 0, taxCents: 0, discountCents: 0, totalCents: 0,
    currency: 'INR', dueDate: null, paidAt: null, notes: '',
  });

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await cms.invoices.get(id);
      return res.data;
    },
    enabled: !!id && isEditing,
  });

  useEffect(() => {
    if (invoice && isEditing) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        orderId: invoice.orderId || '',
        customerName: invoice.customerName || '',
        customerEmail: invoice.customerEmail || '',
        status: invoice.status || 'draft',
        items: invoice.itemsJson || [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
        subtotalCents: invoice.subtotalCents || 0,
        taxCents: invoice.taxCents || 0,
        discountCents: invoice.discountCents || 0,
        totalCents: invoice.totalCents || 0,
        currency: invoice.currency || 'INR',
        dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : null,
        paidAt: invoice.paidAt ? dayjs(invoice.paidAt) : null,
        notes: invoice.notes || '',
      });
    }
  }, [invoice, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data) => cms.invoices.create(data),
    onSuccess: () => {
      toast.success('Invoice created!');
      queryClient.invalidateQueries(['invoices']);
      navigate('..');
    },
    onError: (err) => toast.error(err.details?.message || err.message || 'Failed to create invoice'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => cms.invoices.update(id, data),
    onSuccess: () => {
      toast.success('Invoice updated!');
      queryClient.invalidateQueries(['invoices']);
      queryClient.invalidateQueries(['invoice', id]);
      navigate('..');
    },
    onError: (err) => toast.error(err.details?.message || err.message || 'Failed to update invoice'),
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = Math.round(parseFloat(newItems[index].quantity || 0) * parseFloat(newItems[index].unitPrice || 0) * 100) / 100;
    }
    set('items', newItems);
    recalculateTotals(newItems);
  };

  const recalculateTotals = (items) => {
    const subtotal = Math.round(items.reduce((sum, item) => sum + (item.amount || 0) * 100, 0));
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax - (formData.discountCents || 0);
    set('subtotalCents', subtotal);
    set('taxCents', tax);
    set('totalCents', Math.max(0, total));
  };

  const addItem = () => {
    set('items', [...formData.items, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    set('items', newItems);
    recalculateTotals(newItems);
  };

  const handleDiscountChange = (e) => {
    const discount = Math.round(parseFloat(e.target.value || 0) * 100);
    set('discountCents', discount);
    const total = formData.subtotalCents + formData.taxCents - discount;
    set('totalCents', Math.max(0, total));
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.customerEmail) {
      toast.error('Customer name and email are required');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    const data = {
      orderId: formData.orderId || null,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      status: formData.status,
      itemsJson: formData.items,
      subtotalCents: formData.subtotalCents,
      taxCents: formData.taxCents,
      discountCents: formData.discountCents,
      totalCents: formData.totalCents,
      currency: formData.currency,
      dueDate: formData.dueDate?.format('YYYY-MM-DD') || null,
      paidAt: formData.paidAt?.format('YYYY-MM-DD') || null,
      notes: formData.notes,
    };
    isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);
  };

  const saving = createMutation.isPending || updateMutation.isPending;
  const formatCurrency = (cents) => cents ? `₹${(cents / 100).toFixed(2)}` : '₹0';

  if (invoiceLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
        {/* Header */}
        <Box sx={{
          px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #E2E8F0', bgcolor: '#fff',
        }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
              {isEditing ? 'Edit Invoice' : 'Create New Invoice'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {isEditing ? 'Update invoice details' : 'Fill in customer and invoice details'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('..')}
              sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}>
              Back
            </Button>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave} disabled={saving}
              sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontSize: 13 }}>
              {saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </Stack>
        </Box>

        {/* Form Body */}
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Customer Info */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Customer Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <TextField fullWidth label="Customer Name" value={formData.customerName} required size="small"
                    onChange={(e) => set('customerName', e.target.value)} />
                  <TextField fullWidth label="Email" type="email" value={formData.customerEmail} required size="small"
                    onChange={(e) => set('customerEmail', e.target.value)} />
                </div>
              </div>

              {/* Line Items */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <InvoiceIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Line Items
                </div>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', width: 80 }}>Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', width: 100 }}>Unit Price</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#475569', width: 100 }}>Amount</TableCell>
                        <TableCell sx={{ textAlign: 'center', width: 40 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <TextField size="small" fullWidth value={item.description}
                              onChange={(e) => updateItem(i, 'description', e.target.value)}
                              placeholder="Item description" />
                          </TableCell>
                          <TableCell>
                            <TextField size="small" type="number" inputProps={{ step: '0.01' }} value={item.quantity}
                              onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} />
                          </TableCell>
                          <TableCell>
                            <TextField size="small" type="number" inputProps={{ step: '0.01' }} value={item.unitPrice}
                              onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)}
                              InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{formatCurrency(Math.round(item.amount * 100))}</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => removeItem(i)} sx={{ color: '#DC2626' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button startIcon={<AddIcon />} onClick={addItem} size="small"
                  sx={{ mt: 2, textTransform: 'none', color: '#2563EB' }}>
                  Add Item
                </Button>
              </div>

              {/* Notes */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Notes</div>
                <TextField fullWidth multiline rows={4} value={formData.notes} size="small"
                  onChange={(e) => set('notes', e.target.value)}
                  placeholder="Additional notes for the invoice..." />
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Invoice Status */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Invoice Details</div>
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B', mb: 0.5 }}>Invoice Number</Typography>
                    <TextField fullWidth value={formData.invoiceNumber} disabled size="small"
                      helperText="Auto-generated" />
                  </Box>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={formData.status} onChange={(e) => set('status', e.target.value)} label="Status">
                      {Object.keys(STATUS_COLORS).map((s) => (
                        <MenuItem key={s} value={s}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip label={s} size="small" sx={{
                              backgroundColor: `${STATUS_COLORS[s]}20`, color: STATUS_COLORS[s], fontWeight: 600, fontSize: '0.7rem'
                            }} />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField fullWidth label="Order ID" value={formData.orderId} size="small"
                    onChange={(e) => set('orderId', e.target.value)} />
                  <DatePicker label="Due Date" value={formData.dueDate} onChange={(v) => set('dueDate', v)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  <DatePicker label="Paid Date" value={formData.paidAt} onChange={(v) => set('paidAt', v)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                </Stack>
              </div>

              {/* Totals */}
              <Card sx={{ border: '1px solid #E2E8F0', boxShadow: 'none' }}>
                <Box sx={{ p: 3 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1E293B', mb: 2 }}>Totals</Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#64748B', fontSize: 13 }}>Subtotal:</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{formatCurrency(formData.subtotalCents)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#64748B', fontSize: 13 }}>Tax (18%):</Typography>
                      <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{formatCurrency(formData.taxCents)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#64748B', fontSize: 13 }}>Discount:</Typography>
                      <TextField type="number" inputProps={{ step: '0.01' }} value={formData.discountCents / 100} size="small"
                        onChange={handleDiscountChange}
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                        sx={{ width: 100 }} />
                    </Box>
                    <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>Total:</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#2563EB' }}>{formatCurrency(formData.totalCents)}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Card>
            </div>
          </div>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default InvoiceEditor;
