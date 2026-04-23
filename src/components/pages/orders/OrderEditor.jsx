import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, CircularProgress, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon, ArrowBack as BackIcon, Delete as DeleteIcon,
  ShoppingCart as CartIcon, LocationOn as AddressIcon, Edit as EditIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import cms from '../../../services/cms';

const sectionStyle = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: '#1E293B',
  marginBottom: 16,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const statusColors = {
  pending: '#D97706',
  confirmed: '#2563EB',
  processing: '#7C3AED',
  shipped: '#06B6D4',
  delivered: '#16A34A',
  cancelled: '#DC2626',
  refunded: '#94A3B8',
};

const OrderEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: 'pending',
    itemsJson: [],
    subtotalCents: 0,
    taxCents: 0,
    shippingCents: 0,
    discountCents: 0,
    totalCents: 0,
    currency: 'INR',
    shippingAddress: { line1: '', city: '', state: '', pincode: '' },
    billingAddress: { line1: '', city: '', state: '', pincode: '' },
    sameBillingAddress: true,
    notes: '',
  });

  const [itemInput, setItemInput] = useState({ name: '', qty: '', unitPrice: '' });
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await cms.orders.get(id);
      return response.data;
    },
    enabled: !!id && isEditing,
  });

  useEffect(() => {
    if (order && isEditing) {
      const o = order;
      setFormData({
        customerName: o.customerName || '',
        customerEmail: o.customerEmail || '',
        customerPhone: o.customerPhone || '',
        status: o.status || 'pending',
        itemsJson: Array.isArray(o.itemsJson) ? o.itemsJson : [],
        subtotalCents: o.subtotalCents || 0,
        taxCents: o.taxCents || 0,
        shippingCents: o.shippingCents || 0,
        discountCents: o.discountCents || 0,
        totalCents: o.totalCents || 0,
        currency: o.currency || 'INR',
        shippingAddress: o.shippingAddress || { line1: '', city: '', state: '', pincode: '' },
        billingAddress: o.billingAddress || { line1: '', city: '', state: '', pincode: '' },
        sameBillingAddress: JSON.stringify(o.shippingAddress) === JSON.stringify(o.billingAddress),
        notes: o.notes || '',
      });
    }
  }, [order, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data) => cms.orders.create(data),
    onSuccess: () => {
      toast.success('Order created!');
      queryClient.invalidateQueries(['orders']);
      navigate('..');
    },
    onError: (err) => toast.error(err.details?.message || err.message || 'Failed to create order'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => cms.orders.update(id, data),
    onSuccess: () => {
      toast.success('Order updated!');
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['order', id]);
      navigate('..');
    },
    onError: (err) => toast.error(err.details?.message || err.message || 'Failed to update order'),
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const setAddress = (type, field, value) => {
    set(type, { ...formData[type], [field]: value });
  };

  const calculateTotals = (items) => {
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax + formData.shippingCents - formData.discountCents;
    set('subtotalCents', Math.round(subtotal * 100));
    set('taxCents', Math.round(tax * 100));
    set('totalCents', Math.round(total * 100));
  };

  const addItem = () => {
    if (!itemInput.name || !itemInput.qty || !itemInput.unitPrice) {
      toast.error('Fill in all item fields');
      return;
    }
    const newItems = [...formData.itemsJson];
    if (editingItemIndex !== null) {
      newItems[editingItemIndex] = {
        name: itemInput.name,
        qty: parseInt(itemInput.qty),
        unitPrice: parseFloat(itemInput.unitPrice),
      };
      setEditingItemIndex(null);
    } else {
      newItems.push({
        name: itemInput.name,
        qty: parseInt(itemInput.qty),
        unitPrice: parseFloat(itemInput.unitPrice),
      });
    }
    set('itemsJson', newItems);
    calculateTotals(newItems);
    setItemInput({ name: '', qty: '', unitPrice: '' });
    setOpenItemDialog(false);
  };

  const removeItem = (index) => {
    const newItems = formData.itemsJson.filter((_, i) => i !== index);
    set('itemsJson', newItems);
    calculateTotals(newItems);
  };

  const editItem = (index) => {
    const item = formData.itemsJson[index];
    setItemInput({ name: item.name, qty: String(item.qty), unitPrice: String(item.unitPrice) });
    setEditingItemIndex(index);
    setOpenItemDialog(true);
  };

  const handleSave = () => {
    if (!formData.customerName || !formData.customerEmail) {
      toast.error('Customer name and email are required');
      return;
    }
    const payload = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone || null,
      status: formData.status,
      subtotalCents: formData.subtotalCents,
      taxCents: formData.taxCents,
      shippingCents: formData.shippingCents,
      discountCents: formData.discountCents,
      totalCents: formData.totalCents,
      currency: formData.currency,
      itemsJson: formData.itemsJson.length > 0 ? formData.itemsJson : null,
      shippingAddress: formData.shippingAddress,
      billingAddress: formData.sameBillingAddress ? formData.shippingAddress : formData.billingAddress,
      notes: formData.notes || null,
    };
    isEditing ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const formatMoney = (cents) => {
    if (!cents) return '₹0.00';
    return `₹${(cents / 100).toFixed(2)}`;
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (orderLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <Box sx={{
        px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid #E2E8F0', bgcolor: '#fff',
      }}>
        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
            {isEditing ? 'Edit Order' : 'Create New Order'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {isEditing ? 'Update order details' : 'Fill in the order details below'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('..')}
            sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}>
            Back
          </Button>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave} disabled={saving || !formData.customerName}
            sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontSize: 13 }}>
            {saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </Button>
        </Stack>
      </Box>

      {/* Form Body */}
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Customer Info */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Customer Information</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <TextField fullWidth label="Customer Name" value={formData.customerName} size="small"
                  onChange={(e) => set('customerName', e.target.value)} placeholder="John Doe" required />
                <TextField fullWidth label="Email" type="email" value={formData.customerEmail} size="small"
                  onChange={(e) => set('customerEmail', e.target.value)} placeholder="john@example.com" required />
              </div>
              <TextField fullWidth label="Phone" value={formData.customerPhone} size="small"
                onChange={(e) => set('customerPhone', e.target.value)} placeholder="+91 9876543210" />
            </div>

            {/* Order Items */}
            <div style={sectionStyle}>
              <div style={labelStyle}><CartIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Order Items</div>
              {formData.itemsJson.length > 0 ? (
                <Table sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#475569' }}>Item Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#475569' }} align="center">Qty</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#475569' }} align="right">Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#475569' }} align="right">Total</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: 12, color: '#475569' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.itemsJson.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontSize: 13 }}>{item.name}</TableCell>
                        <TableCell sx={{ fontSize: 13 }} align="center">{item.qty}</TableCell>
                        <TableCell sx={{ fontSize: 13 }} align="right">{formatMoney(item.unitPrice * 100)}</TableCell>
                        <TableCell sx={{ fontSize: 13, fontWeight: 600 }} align="right">
                          {formatMoney(item.qty * item.unitPrice * 100)}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <IconButton size="small" onClick={() => editItem(idx)} sx={{ color: '#F59E0B' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => removeItem(idx)} sx={{ color: '#DC2626' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography sx={{ fontSize: 13, color: '#94A3B8', mb: 2 }}>No items added yet</Typography>
              )}
              <Button variant="outlined" size="small" onClick={() => {
                setItemInput({ name: '', qty: '', unitPrice: '' });
                setEditingItemIndex(null);
                setOpenItemDialog(true);
              }}>
                Add Item
              </Button>
            </div>

            {/* Addresses */}
            <div style={sectionStyle}>
              <div style={labelStyle}><AddressIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Shipping Address</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <TextField fullWidth label="Address Line 1" value={formData.shippingAddress.line1} size="small"
                  onChange={(e) => setAddress('shippingAddress', 'line1', e.target.value)} />
                <TextField fullWidth label="City" value={formData.shippingAddress.city} size="small"
                  onChange={(e) => setAddress('shippingAddress', 'city', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <TextField fullWidth label="State" value={formData.shippingAddress.state} size="small"
                  onChange={(e) => setAddress('shippingAddress', 'state', e.target.value)} />
                <TextField fullWidth label="Pincode" value={formData.shippingAddress.pincode} size="small"
                  onChange={(e) => setAddress('shippingAddress', 'pincode', e.target.value)} />
              </div>

              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" checked={formData.sameBillingAddress}
                  onChange={(e) => set('sameBillingAddress', e.target.checked)}
                  style={{ marginRight: 8 }} />
                <Typography variant="body2">Same as shipping address</Typography>
              </Box>

              {!formData.sameBillingAddress && (
                <>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#1E293B', mb: 1 }}>Billing Address</Typography>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <TextField fullWidth label="Address Line 1" value={formData.billingAddress.line1} size="small"
                      onChange={(e) => setAddress('billingAddress', 'line1', e.target.value)} />
                    <TextField fullWidth label="City" value={formData.billingAddress.city} size="small"
                      onChange={(e) => setAddress('billingAddress', 'city', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <TextField fullWidth label="State" value={formData.billingAddress.state} size="small"
                      onChange={(e) => setAddress('billingAddress', 'state', e.target.value)} />
                    <TextField fullWidth label="Pincode" value={formData.billingAddress.pincode} size="small"
                      onChange={(e) => setAddress('billingAddress', 'pincode', e.target.value)} />
                  </div>
                </>
              )}
            </div>

            {/* Notes */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Notes</div>
              <TextField fullWidth multiline rows={4} value={formData.notes} size="small"
                onChange={(e) => set('notes', e.target.value)} placeholder="Add any special instructions or notes..." />
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Order Status Card */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Order Status</div>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600, mb: 1 }}>Status</Typography>
                  <FormControl fullWidth size="small">
                    <Select value={formData.status} onChange={(e) => set('status', e.target.value)}>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="processing">Processing</MenuItem>
                      <MenuItem value="shipped">Shipped</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                      <MenuItem value="refunded">Refunded</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#64748B', fontWeight: 600, mb: 1 }}>Order Number</Typography>
                  <Chip label={isEditing && order?.orderNumber ? order.orderNumber : 'Auto-generated'} disabled />
                </Box>
                <Chip label={formData.status} sx={{
                  backgroundColor: statusColors[formData.status] + '20',
                  color: statusColors[formData.status],
                  fontWeight: 600,
                }} />
              </Stack>
            </div>

            {/* Pricing Summary Card */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Pricing Summary</div>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <Typography sx={{ color: '#64748B' }}>Subtotal</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{formatMoney(formData.subtotalCents)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <Typography sx={{ color: '#64748B' }}>Tax (18%)</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>{formatMoney(formData.taxCents)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <Typography sx={{ color: '#64748B' }}>Shipping</Typography>
                  <TextField size="small" type="number" value={(formData.shippingCents / 100).toFixed(2)}
                    onChange={(e) => set('shippingCents', Math.round(parseFloat(e.target.value) * 100))}
                    sx={{ width: 80, '& input': { textAlign: 'right', fontSize: 13 } }} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <Typography sx={{ color: '#64748B' }}>Discount</Typography>
                  <TextField size="small" type="number" value={(formData.discountCents / 100).toFixed(2)}
                    onChange={(e) => set('discountCents', Math.round(parseFloat(e.target.value) * 100))}
                    sx={{ width: 80, '& input': { textAlign: 'right', fontSize: 13 } }} />
                </Box>
                <Box sx={{ borderTop: '1px solid #E2E8F0', pt: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>Total</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>
                    {formatMoney(formData.totalCents)}
                  </Typography>
                </Box>
              </Stack>
            </div>
          </div>
        </div>
      </Box>

      {/* Item Dialog */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItemIndex !== null ? 'Edit Item' : 'Add Item'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            <TextField fullWidth label="Item Name" value={itemInput.name} size="small"
              onChange={(e) => setItemInput(prev => ({ ...prev, name: e.target.value }))} />
            <TextField fullWidth label="Quantity" type="number" value={itemInput.qty} size="small"
              onChange={(e) => setItemInput(prev => ({ ...prev, qty: e.target.value }))} />
            <TextField fullWidth label="Unit Price (₹)" type="number" value={itemInput.unitPrice} size="small"
              onChange={(e) => setItemInput(prev => ({ ...prev, unitPrice: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
          <Button onClick={addItem} variant="contained">
            {editingItemIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderEditor;
