import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Stack, CircularProgress, Card, CardContent, FormControlLabel, Switch,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon, ArrowBack as BackIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ImageCropUpload from '../../common/ImageCropUpload';
import cms from '../../../services/cms';

const sectionStyle = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle = {
  fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 16,
};

const ServiceEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDesc: '',
    category: '',
    priceCents: 0,
    currency: 'INR',
    durationMins: '',
    imageUrl: '',
    status: 'draft',
    featured: false,
    sortOrder: 0,
    metaJson: {},
  });

  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const { data } = await cms.services.get(id);
      return data;
    },
    enabled: !!id && isEditing,
  });

  useEffect(() => {
    if (service && isEditing) {
      setFormData({
        name: service.name || '',
        slug: service.slug || '',
        description: service.description || '',
        shortDesc: service.shortDesc || '',
        category: service.category || '',
        priceCents: service.priceCents ? service.priceCents / 100 : 0,
        currency: service.currency || 'INR',
        durationMins: service.durationMins || '',
        imageUrl: service.imageUrl || '',
        status: service.status || 'draft',
        featured: service.featured || false,
        sortOrder: service.sortOrder || 0,
        metaJson: service.metaJson || {},
      });
    }
  }, [service, isEditing]);

  useEffect(() => {
    if (formData.name && !isEditing) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data) => cms.services.create(data),
    onSuccess: () => {
      toast.success('Service created!');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      navigate('..');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create service'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => cms.services.update(id, data),
    onSuccess: () => {
      toast.success('Service updated!');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', id] });
      navigate('..');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update service'),
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    const data = {
      ...formData,
      priceCents: Math.round(formData.priceCents * 100),
      durationMins: formData.durationMins ? parseInt(formData.durationMins) : null,
      sortOrder: parseInt(formData.sortOrder) || 0,
    };

    isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }],
      ['blockquote', 'link', 'image'],
      ['clean'],
    ],
  };

  if (serviceLoading) {
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
            {isEditing ? 'Edit Service' : 'Create New Service'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {isEditing ? 'Update service details' : 'Fill in the service details below'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('..')}
            sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}>
            Back
          </Button>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave} disabled={saving || !formData.name}
            sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontSize: 13 }}>
            {saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </Button>
        </Stack>
      </Box>

      {/* Form Body */}
      <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>

        {/* Row 1: Title + Slug + Category — 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
          <TextField fullWidth label="Service Name" value={formData.name} required size="small"
            onChange={(e) => set('name', e.target.value)} placeholder="Enter service name..." />
          <TextField fullWidth label="Slug" value={formData.slug} size="small"
            onChange={(e) => set('slug', e.target.value)} placeholder="service-slug" />
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={formData.category} onChange={(e) => set('category', e.target.value)} label="Category">
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="design">Design</MenuItem>
              <MenuItem value="marketing">Marketing</MenuItem>
              <MenuItem value="infrastructure">Infrastructure</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Row 2: Two columns — Left (Basic Info + Description) | Right (Status Card + Image) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Basic Info */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Basic Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <TextField fullWidth label="Short Description" multiline rows={2} value={formData.shortDesc} size="small"
                  onChange={(e) => set('shortDesc', e.target.value)}
                  placeholder="Brief one-liner for service..." />
              </div>
            </div>

            {/* Description Editor */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Description</div>
              <Box sx={{ '& .ql-editor': { minHeight: 220 }, '& .ql-container': { borderRadius: '0 0 8px 8px' }, '& .ql-toolbar': { borderRadius: '8px 8px 0 0' } }}>
                <ReactQuill theme="snow" value={formData.description}
                  onChange={(v) => set('description', v)} modules={quillModules}
                  placeholder="Write detailed service information, features, benefits..." />
              </Box>
            </div>

            {/* Pricing & Duration */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Pricing & Duration</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField fullWidth label="Price" type="number" inputProps={{ step: '0.01', min: '0' }} value={formData.priceCents} size="small"
                  onChange={(e) => set('priceCents', parseFloat(e.target.value) || 0)}
                  InputProps={{ endAdornment: <InputAdornment position="end">₹</InputAdornment> }} />
                <TextField fullWidth label="Duration (minutes)" type="number" inputProps={{ min: '1' }} value={formData.durationMins} size="small"
                  onChange={(e) => set('durationMins', e.target.value)} />
              </div>
            </div>

            {/* Image Upload */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Featured Image</div>
              {formData.imageUrl && (
                <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <img src={formData.imageUrl} alt={formData.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }} />
                </Box>
              )}
              <ImageCropUpload value={formData.imageUrl}
                onChange={(url, mediaId) => setFormData(prev => ({ ...prev, imageUrl: url }))}
                folder="services" cropAspectRatio={16 / 9} width={400} height={225}
                altText={formData.name} label="Upload Image" />
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Status Card */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Settings</div>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} onChange={(e) => set('status', e.target.value)} label="Status">
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select value={formData.category} onChange={(e) => set('category', e.target.value)} label="Category">
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="design">Design</MenuItem>
                    <MenuItem value="marketing">Marketing</MenuItem>
                    <MenuItem value="infrastructure">Infrastructure</MenuItem>
                  </Select>
                </FormControl>

                <TextField fullWidth label="Sort Order" type="number" value={formData.sortOrder} size="small"
                  onChange={(e) => set('sortOrder', e.target.value)} />

                <FormControlLabel
                  control={<Switch checked={formData.featured} onChange={(e) => set('featured', e.target.checked)} size="small" />}
                  label={<Typography variant="body2">Featured Service</Typography>} />
              </Stack>
            </div>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default ServiceEditor;
