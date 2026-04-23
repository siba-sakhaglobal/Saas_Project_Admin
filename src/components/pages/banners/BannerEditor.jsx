import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  IconButton, CircularProgress, Chip, Switch, FormControlLabel
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ImageCropUpload from '../../common/ImageCropUpload';
import cms from '../../../services/cms';

const section = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};
const label = { fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 };

const PLACEMENTS = [
  { value: 'homepage', label: 'Homepage Hero', desc: 'Main banner on homepage' },
  { value: 'sidebar', label: 'Sidebar', desc: 'Side panel banner' },
  { value: 'footer', label: 'Footer', desc: 'Bottom of page' },
  { value: 'popup', label: 'Popup / Modal', desc: 'Overlay banner' },
];

const BannerEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '', subtitle: '', imageUrl: '', mobileImageUrl: '', linkUrl: '', linkTarget: '_self',
    placement: 'homepage', status: 'active', sortOrder: 0, bgColor: '#1E293B', textColor: '#FFFFFF',
    startDate: '', endDate: '',
  });

  const { data: banner, isLoading } = useQuery({
    queryKey: ['banner', id],
    queryFn: async () => { const r = await cms.banners.get(id); return r.data || r; },
    enabled: !!id && isEditing,
  });

  useEffect(() => {
    if (banner && isEditing) {
      setFormData({
        title: banner.title || '', subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl || '', mobileImageUrl: banner.mobileImageUrl || '',
        linkUrl: banner.linkUrl || '', linkTarget: banner.linkTarget || '_self',
        placement: banner.placement || 'homepage', status: banner.status || 'active',
        sortOrder: banner.sortOrder || 0, bgColor: banner.bgColor || '#1E293B', textColor: banner.textColor || '#FFFFFF',
        startDate: banner.startDate ? banner.startDate.split('T')[0] : '',
        endDate: banner.endDate ? banner.endDate.split('T')[0] : '',
      });
    }
  }, [banner, isEditing]);

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const mutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data };
      if (payload.startDate) payload.startDate = new Date(payload.startDate).toISOString();
      else delete payload.startDate;
      if (payload.endDate) payload.endDate = new Date(payload.endDate).toISOString();
      else delete payload.endDate;
      if (isEditing) return cms.banners.update(id, payload);
      return cms.banners.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success(isEditing ? 'Banner updated' : 'Banner created');
      setTimeout(() => navigate('..'), 500);
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Failed to save'),
  });

  const handleSave = () => {
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    mutation.mutate(formData);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('..')} sx={{ border: '1px solid #E2E8F0' }}><BackIcon /></IconButton>
          <Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>
              {isEditing ? 'Edit Banner' : 'Create Banner'}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {isEditing ? formData.title : 'Design a new banner for your website'}
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={mutation.isPending ? null : <SaveIcon />} onClick={handleSave}
          disabled={mutation.isPending}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3, '&:hover': { bgcolor: '#1D4ED8' } }}>
          {mutation.isPending ? 'Saving...' : isEditing ? 'Update Banner' : 'Create Banner'}
        </Button>
      </Box>

      {/* 2-column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Left column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Content */}
          <div style={section}>
            <div style={label}>Banner Content</div>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField size="small" label="Title *" fullWidth value={formData.title}
                onChange={(e) => set('title', e.target.value)} placeholder="e.g., Summer Sale 2026" />
              <TextField size="small" label="Subtitle" fullWidth value={formData.subtitle}
                onChange={(e) => set('subtitle', e.target.value)} placeholder="Short description or CTA text" />
            </Box>
          </div>

          {/* Images */}
          <div style={section}>
            <div style={label}>Banner Images</div>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', mb: 1 }}>Desktop Image</Typography>
                <ImageCropUpload value={formData.imageUrl} onChange={(url) => set('imageUrl', url)}
                  folder="banners" cropAspectRatio={16 / 5} width={400} height={125} label="Upload Desktop" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', mb: 1 }}>Mobile Image</Typography>
                <ImageCropUpload value={formData.mobileImageUrl} onChange={(url) => set('mobileImageUrl', url)}
                  folder="banners" cropAspectRatio={9 / 16} width={150} height={267} label="Upload Mobile" />
              </Box>
            </Box>
          </div>

          {/* Link & Styling */}
          <div style={section}>
            <div style={label}>Link & Styling</div>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField size="small" label="Link URL" fullWidth value={formData.linkUrl}
                onChange={(e) => set('linkUrl', e.target.value)} placeholder="https://..." />
              <FormControl size="small" fullWidth>
                <InputLabel>Link Target</InputLabel>
                <Select value={formData.linkTarget} label="Link Target" onChange={(e) => set('linkTarget', e.target.value)}>
                  <MenuItem value="_self">Same Window</MenuItem>
                  <MenuItem value="_blank">New Tab</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>Background Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #E2E8F0', borderRadius: 1.5, px: 1.5, py: 0.75 }}>
                  <input type="color" value={formData.bgColor} onChange={(e) => set('bgColor', e.target.value)}
                    style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
                  <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#475569' }}>{formData.bgColor}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>Text Color</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, border: '1px solid #E2E8F0', borderRadius: 1.5, px: 1.5, py: 0.75 }}>
                  <input type="color" value={formData.textColor} onChange={(e) => set('textColor', e.target.value)}
                    style={{ width: 32, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
                  <Typography sx={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: '#475569' }}>{formData.textColor}</Typography>
                </Box>
              </Box>
            </Box>
          </div>
        </Box>

        {/* Right sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Live Preview */}
          <div style={section}>
            <div style={label}>Live Preview</div>
            <Box sx={{
              p: 3, borderRadius: 2, minHeight: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              bgcolor: formData.bgColor, color: formData.textColor,
              backgroundImage: formData.imageUrl ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${formData.imageUrl})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 0.5, textShadow: formData.imageUrl ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>
                {formData.title || 'Banner Title'}
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', opacity: 0.9 }}>
                {formData.subtitle || 'Your subtitle text here'}
              </Typography>
            </Box>
          </div>

          {/* Settings */}
          <div style={section}>
            <div style={label}>Settings</div>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={formData.status} label="Status" onChange={(e) => set('status', e.target.value)}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Placement</InputLabel>
                <Select value={formData.placement} label="Placement" onChange={(e) => set('placement', e.target.value)}>
                  {PLACEMENTS.map(p => (
                    <MenuItem key={p.value} value={p.value}>
                      <Box>
                        <Typography sx={{ fontSize: '0.875rem' }}>{p.label}</Typography>
                        <Typography sx={{ fontSize: '0.6875rem', color: '#94A3B8' }}>{p.desc}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField size="small" label="Sort Order" type="number" fullWidth value={formData.sortOrder}
                onChange={(e) => set('sortOrder', parseInt(e.target.value) || 0)} />
            </Box>
          </div>

          {/* Schedule */}
          <div style={section}>
            <div style={label}>Schedule</div>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField size="small" label="Start Date" type="date" fullWidth value={formData.startDate}
                onChange={(e) => set('startDate', e.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField size="small" label="End Date" type="date" fullWidth value={formData.endDate}
                onChange={(e) => set('endDate', e.target.value)} InputLabelProps={{ shrink: true }} />
            </Box>
          </div>

          {/* Stats (edit only) */}
          {isEditing && banner && (
            <div style={section}>
              <div style={label}>Statistics</div>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, bgcolor: '#F8FAFC', borderRadius: 1.5 }}>
                <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563EB' }}>{banner.clickCount || 0}</Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>total clicks</Typography>
              </Box>
            </div>
          )}

          <Button variant="outlined" fullWidth onClick={() => navigate('..')}
            sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569', borderRadius: 1.5 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BannerEditor;
