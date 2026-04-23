import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Stack, CircularProgress, Rating, InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon, ArrowBack as BackIcon,
  BusinessCenter as CompanyIcon, ContactPhone as ContactIcon,
  LocationOn as LocationIcon, Description as DescIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ImageCropUpload from '../../common/ImageCropUpload';
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

const VendorEditor = () => {
  const { projectId, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    company: '',
    address: {
      line1: '',
      city: '',
      state: '',
      pincode: '',
    },
    description: '',
    logoUrl: '',
    status: 'active',
    rating: 0,
    productCount: 0,
    commissionPct: 0,
    metaJson: null,
  });

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await cms.vendors.get(id);
      return data;
    },
    enabled: !!id && isEditing,
  });

  useEffect(() => {
    if (vendor && isEditing) {
      const parsedAddress = typeof vendor.address === 'string'
        ? JSON.parse(vendor.address || '{}')
        : vendor.address || {};

      setFormData({
        name: vendor.name || '',
        slug: vendor.slug || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        company: vendor.company || '',
        address: {
          line1: parsedAddress.line1 || '',
          city: parsedAddress.city || '',
          state: parsedAddress.state || '',
          pincode: parsedAddress.pincode || '',
        },
        description: vendor.description || '',
        logoUrl: vendor.logoUrl || '',
        status: vendor.status || 'active',
        rating: vendor.rating || 0,
        productCount: vendor.productCount || 0,
        commissionPct: vendor.commissionPct || 0,
        metaJson: vendor.metaJson || null,
      });
    }
  }, [vendor, isEditing]);

  useEffect(() => {
    if (formData.name && !isEditing) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data) => cms.vendors.create(data),
    onSuccess: () => {
      toast.success('Vendor created successfully!');
      queryClient.invalidateQueries(['vendors']);
      navigate(`/p/${projectId}/vendors`);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error?.message || 'Failed to create vendor'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => cms.vendors.update(id, data),
    onSuccess: () => {
      toast.success('Vendor updated successfully!');
      queryClient.invalidateQueries(['vendors']);
      queryClient.invalidateQueries(['vendor', id]);
      navigate(`/p/${projectId}/vendors`);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error?.message || 'Failed to update vendor'),
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const setAddress = (field, value) =>
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));

  const handleSave = () => {
    if (!formData.email) {
      toast.error('Email is required');
      return;
    }
    if (!formData.name) {
      toast.error('Name is required');
      return;
    }

    const data = {
      ...formData,
      address: JSON.stringify(formData.address),
    };

    isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  if (vendorLoading) {
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
            {isEditing ? 'Edit Vendor' : 'Create New Vendor'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {isEditing ? 'Update vendor details' : 'Fill in the vendor details below'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate(`/p/${projectId}/vendors`)}
            sx={{
              textTransform: 'none',
              borderColor: '#E2E8F0',
              color: '#475569',
              fontSize: 13,
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={saving || !formData.name || !formData.email}
            sx={{
              textTransform: 'none',
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' },
              fontSize: 13,
            }}
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
            {/* Vendor Info */}
            <div style={sectionStyle}>
              <div style={labelStyle}><CompanyIcon sx={{ fontSize: 18, color: '#2563EB' }} />Vendor Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <TextField fullWidth label="Vendor Name" value={formData.name} required size="small"
                  onChange={(e) => set('name', e.target.value)} placeholder="Enter vendor name..." />
                <TextField fullWidth label="Slug" value={formData.slug} size="small"
                  onChange={(e) => set('slug', e.target.value)} placeholder="vendor-slug" />
              </div>
              <TextField fullWidth label="Company" value={formData.company} size="small"
                onChange={(e) => set('company', e.target.value)} placeholder="Company name" />
            </div>

            {/* Contact */}
            <div style={sectionStyle}>
              <div style={labelStyle}><ContactIcon sx={{ fontSize: 18, color: '#2563EB' }} />Contact</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField fullWidth label="Email" type="email" value={formData.email} required size="small"
                  onChange={(e) => set('email', e.target.value)} placeholder="vendor@example.com" />
                <TextField fullWidth label="Phone" value={formData.phone} size="small"
                  onChange={(e) => set('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            {/* Address */}
            <div style={sectionStyle}>
              <div style={labelStyle}><LocationIcon sx={{ fontSize: 18, color: '#2563EB' }} />Address</div>
              <TextField fullWidth label="Street" value={formData.address.line1} size="small" margin="normal"
                onChange={(e) => setAddress('line1', e.target.value)} placeholder="123 Main Street" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
                <TextField fullWidth label="City" value={formData.address.city} size="small"
                  onChange={(e) => setAddress('city', e.target.value)} placeholder="New York" />
                <TextField fullWidth label="State" value={formData.address.state} size="small"
                  onChange={(e) => setAddress('state', e.target.value)} placeholder="NY" />
                <TextField fullWidth label="Pincode" value={formData.address.pincode} size="small"
                  onChange={(e) => setAddress('pincode', e.target.value)} placeholder="10001" />
              </div>
            </div>

            {/* Description */}
            <div style={sectionStyle}>
              <div style={labelStyle}><DescIcon sx={{ fontSize: 18, color: '#2563EB' }} />Description</div>
              <TextField fullWidth multiline rows={4} value={formData.description} size="small"
                onChange={(e) => set('description', e.target.value)} placeholder="Describe vendor business, specialties, etc." />
            </div>

            {/* Logo */}
            <div style={sectionStyle}>
              <div style={labelStyle}><ImageIcon sx={{ fontSize: 18, color: '#2563EB' }} />Logo</div>
              {formData.logoUrl && <img src={formData.logoUrl} alt={formData.name} style={{
                width: '100%', height: 160, objectFit: 'contain', borderRadius: 8, marginBottom: 16
              }} />}
              <ImageCropUpload value={formData.logoUrl} onChange={(url) => set('logoUrl', url)}
                folder="vendors" cropAspectRatio={1} width={200} height={200} altText={formData.name} label="Upload" />
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Status & Commission */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Status & Commission</div>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} onChange={(e) => set('status', e.target.value)} label="Status">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              <TextField fullWidth label="Commission %" type="number" value={formData.commissionPct} size="small"
                onChange={(e) => set('commissionPct', parseFloat(e.target.value) || 0)}
                InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
            </div>

            {/* Rating & Products */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Performance</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>Rating</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={formData.rating} readOnly size="small" />
                    <Typography sx={{ fontSize: '0.875rem', color: '#94A3B8' }}>
                      {formData.rating.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>Products Listed</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563EB' }}>
                    {formData.productCount}
                  </Typography>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default VendorEditor;
