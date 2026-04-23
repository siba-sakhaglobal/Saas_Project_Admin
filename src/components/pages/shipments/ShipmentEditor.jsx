import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Stack, CircularProgress, Card, CardContent, Divider,
} from '@mui/material';
import {
  Save as SaveIcon, ArrowBack as BackIcon, LocalShipping as ShipmentIcon,
  LocationOn as LocationIcon, Inventory2 as PackageIcon, Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import cms from '../../../services/cms';

const sectionStyle = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle = {
  fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 16,
  display: 'flex', alignItems: 'center', gap: 8,
};

const CARRIERS = ['Blue Dart', 'DTDC', 'Delhivery', 'FedEx', 'India Post', 'Ecom Express'];

const STATUS_OPTIONS = [
  'pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'failed'
];

const formatStatus = (status) =>
  status.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const ShipmentEditor = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    trackingNumber: '', carrier: '', status: 'pending', orderId: '',
    shippingAddress: { line1: '', city: '', state: '', pincode: '', country: '' },
    weightGrams: '', costCents: '', currency: 'INR',
    shippedAt: null, deliveredAt: null, estimatedDelivery: null,
    notes: '', metaJson: null,
  });

  const [orderInfo, setOrderInfo] = useState(null);

  const { data: shipment, isLoading: shipmentLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => {
      const response = await cms.shipments.get(id);
      return response;
    },
    enabled: !!id && isEditing,
  });

  useEffect(() => {
    if (shipment && isEditing) {
      const data = shipment.data?.data || shipment.data;
      const addr = typeof data.shippingAddress === 'string'
        ? JSON.parse(data.shippingAddress)
        : (data.shippingAddress || {});

      setFormData({
        trackingNumber: data.trackingNumber || '',
        carrier: data.carrier || '',
        status: data.status || 'pending',
        orderId: data.orderId || '',
        shippingAddress: {
          line1: addr.line1 || '',
          city: addr.city || '',
          state: addr.state || '',
          pincode: addr.pincode || '',
          country: addr.country || '',
        },
        weightGrams: data.weightGrams || '',
        costCents: data.costCents || '',
        currency: data.currency || 'INR',
        shippedAt: data.shippedAt ? dayjs(data.shippedAt) : null,
        deliveredAt: data.deliveredAt ? dayjs(data.deliveredAt) : null,
        estimatedDelivery: data.estimatedDelivery ? dayjs(data.estimatedDelivery) : null,
        notes: data.notes || '',
        metaJson: data.metaJson || null,
      });

      if (data.order) {
        setOrderInfo(data.order);
      }
    }
  }, [shipment, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data) => cms.shipments.create(data),
    onSuccess: () => {
      toast.success('Shipment created!');
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      navigate(`/p/${projectId}/shipments`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create shipment'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => cms.shipments.update(id, data),
    onSuccess: () => {
      toast.success('Shipment updated!');
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
      navigate(`/p/${projectId}/shipments`);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update shipment'),
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const setAddress = (field, value) =>
    set('shippingAddress', { ...formData.shippingAddress, [field]: value });

  const handleSave = () => {
    if (!formData.trackingNumber || !formData.carrier) {
      toast.error('Tracking number and carrier are required');
      return;
    }

    const data = {
      trackingNumber: formData.trackingNumber,
      carrier: formData.carrier,
      status: formData.status,
      orderId: formData.orderId || null,
      shippingAddress: JSON.stringify(formData.shippingAddress),
      weightGrams: formData.weightGrams ? parseInt(formData.weightGrams) : null,
      costCents: formData.costCents ? parseInt(formData.costCents) : null,
      currency: formData.currency || 'INR',
      shippedAt: formData.shippedAt?.format('YYYY-MM-DD HH:mm:ss') || null,
      deliveredAt: formData.deliveredAt?.format('YYYY-MM-DD HH:mm:ss') || null,
      estimatedDelivery: formData.estimatedDelivery?.format('YYYY-MM-DD') || null,
      notes: formData.notes || null,
      metaJson: formData.metaJson || null,
    };

    isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (shipmentLoading) {
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
            {isEditing ? 'Edit Shipment' : 'Create New Shipment'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {isEditing ? 'Update shipment details' : 'Add tracking and shipping information'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate(`/p/${projectId}/shipments`)}
            sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}>
            Back
          </Button>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave} disabled={saving || !formData.trackingNumber || !formData.carrier}
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

            {/* Shipment Details */}
            <div style={sectionStyle}>
              <div style={labelStyle}>
                <ShipmentIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Shipment Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField fullWidth label="Tracking Number" required value={formData.trackingNumber} size="small"
                  onChange={(e) => set('trackingNumber', e.target.value)} placeholder="e.g., ABC123456789" />
                <FormControl fullWidth size="small">
                  <InputLabel>Carrier</InputLabel>
                  <Select value={formData.carrier} label="Carrier" required
                    onChange={(e) => set('carrier', e.target.value)}>
                    {CARRIERS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={sectionStyle}>
              <div style={labelStyle}>
                <LocationIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Shipping Address
              </div>
              <Stack spacing={2}>
                <TextField fullWidth label="Address Line 1" size="small" value={formData.shippingAddress.line1}
                  onChange={(e) => setAddress('line1', e.target.value)} placeholder="Street address" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <TextField fullWidth label="City" size="small" value={formData.shippingAddress.city}
                    onChange={(e) => setAddress('city', e.target.value)} placeholder="City" />
                  <TextField fullWidth label="State" size="small" value={formData.shippingAddress.state}
                    onChange={(e) => setAddress('state', e.target.value)} placeholder="State" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <TextField fullWidth label="Pincode" size="small" value={formData.shippingAddress.pincode}
                    onChange={(e) => setAddress('pincode', e.target.value)} placeholder="Postal code" />
                  <TextField fullWidth label="Country" size="small" value={formData.shippingAddress.country}
                    onChange={(e) => setAddress('country', e.target.value)} placeholder="Country" />
                </div>
              </Stack>
            </div>

            {/* Package Info */}
            <div style={sectionStyle}>
              <div style={labelStyle}>
                <PackageIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Package Info
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <TextField fullWidth label="Weight (grams)" type="number" size="small" value={formData.weightGrams}
                  onChange={(e) => set('weightGrams', e.target.value)} placeholder="0" />
                <TextField fullWidth label="Cost (₹)" type="number" size="small" value={formData.costCents}
                  onChange={(e) => set('costCents', e.target.value)} placeholder="0" />
              </div>
              <TextField fullWidth label="Currency" size="small" value={formData.currency} disabled
                sx={{ '& .MuiOutlinedInput-root.Mui-disabled': { bgcolor: '#F8FAFC', color: '#64748B' } }} />
            </div>

            {/* Dates */}
            <div style={sectionStyle}>
              <div style={labelStyle}>
                <ScheduleIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Dates
              </div>
              <Stack spacing={2}>
                <TextField fullWidth label="Shipped At" type="datetime-local" size="small"
                  value={formData.shippedAt ? formData.shippedAt.format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => set('shippedAt', e.target.value ? dayjs(e.target.value) : null)} />
                <TextField fullWidth label="Delivered At" type="datetime-local" size="small"
                  value={formData.deliveredAt ? formData.deliveredAt.format('YYYY-MM-DDTHH:mm') : ''}
                  onChange={(e) => set('deliveredAt', e.target.value ? dayjs(e.target.value) : null)} />
                <TextField fullWidth label="Estimated Delivery" type="date" size="small"
                  value={formData.estimatedDelivery ? formData.estimatedDelivery.format('YYYY-MM-DD') : ''}
                  onChange={(e) => set('estimatedDelivery', e.target.value ? dayjs(e.target.value) : null)} />
              </Stack>
            </div>

            {/* Notes */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Notes</div>
              <TextField fullWidth multiline rows={4} value={formData.notes} size="small"
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any special notes or instructions..." />
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Status Card */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Status & Order</div>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} label="Status"
                    onChange={(e) => set('status', e.target.value)}>
                    {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{formatStatus(s)}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField fullWidth label="Order ID" size="small" value={formData.orderId}
                  onChange={(e) => set('orderId', e.target.value)} placeholder="Link to order" />
              </Stack>

              {orderInfo && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Card sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 1 }}>
                        Order Information
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155', mb: 0.5 }}>
                        <strong>Order #:</strong> {orderInfo.orderNumber || '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        <strong>Amount:</strong> {orderInfo.totalAmount ? `₹${(orderInfo.totalAmount / 100).toFixed(2)}` : '-'}
                      </Typography>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Actions Card */}
            <Card sx={{ border: '1px solid #E2E8F0', boxShadow: 'none' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Button fullWidth variant="outlined" size="small" sx={{ textTransform: 'none', mb: 1 }}>
                  Copy Tracking Link
                </Button>
                <Button fullWidth variant="outlined" size="small" sx={{ textTransform: 'none' }}>
                  Email Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default ShipmentEditor;
