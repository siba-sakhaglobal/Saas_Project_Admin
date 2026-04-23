import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Alert, IconButton, Chip, CircularProgress
} from '@mui/material';
import {
  ArrowBack as BackIcon, Save as SaveIcon,
  LinkedIn as LinkedInIcon, Twitter as TwitterIcon,
  Facebook as FacebookIcon, Instagram as InstagramIcon,
} from '@mui/icons-material';
import ImageCropUpload from '../../common/ImageCropUpload';
import cms from '../../../services/cms';
import { toast } from 'react-toastify';

const sectionStyle = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle = {
  fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 12,
  display: 'flex', alignItems: 'center', gap: 8,
};

const TeamMemberEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [formData, setFormData] = useState({
    name: '', designation: '', category: '', bio: '',
    email: '', phone: '', image_url: '', order_position: 0,
    social_links: { linkedin: '', twitter: '', facebook: '', instagram: '' },
    is_active: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, desRes] = await Promise.all([
          cms.team.categories().catch(() => ({ data: [] })),
          cms.raw().get('/api/team-designations').catch(() => ({ data: { designations: [] } })),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data?.categories || []);
        setDesignations(Array.isArray(desRes.data) ? desRes.data : desRes.data?.designations || []);
      } catch {}

      if (isEditing) {
        setLoading(true);
        try {
          const m = await cms.team.get(id);
          const member = m.data || m;
          if (member) {
            setFormData({
              name: member.name || '', designation: member.designation || '',
              category: member.category || '', bio: member.bio || '',
              email: member.email || '', phone: member.phone || '',
              image_url: member.avatar_url || member.avatar || member.image_url || '',
              order_position: member.sort_order || 0,
              social_links: member.social_links || { linkedin: '', twitter: '', facebook: '', instagram: '' },
              is_active: member.active !== undefined ? member.active : true,
            });
          }
        } catch { toast.error('Failed to load member'); }
        setLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
  const setSocial = (platform, value) => setFormData(prev => ({
    ...prev, social_links: { ...prev.social_links, [platform]: value },
  }));

  const handleSave = async () => {
    if (!formData.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      if (isEditing) {
        await cms.team.update(id, formData);
        toast.success('Member updated');
      } else {
        await cms.team.create(formData);
        toast.success('Member created');
      }
      setTimeout(() => navigate('..'), 800);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('..')} sx={{ border: '1px solid #E2E8F0' }}><BackIcon /></IconButton>
          <Box>
            <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>
              {isEditing ? 'Edit Team Member' : 'Add Team Member'}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', color: '#64748B' }}>
              {isEditing ? formData.name : 'Fill in the details to add a new member'}
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={saving ? null : <SaveIcon />} onClick={handleSave} disabled={saving}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1.5, px: 3, '&:hover': { bgcolor: '#1D4ED8' } }}>
          {saving ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </Box>

      {/* Form — 2 column layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Left column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Personal Info */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Personal Information</div>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField size="small" label="Full Name *" fullWidth value={formData.name}
                onChange={(e) => set('name', e.target.value)} />
              <FormControl size="small" fullWidth>
                <InputLabel>Designation</InputLabel>
                <Select value={formData.designation} label="Designation"
                  onChange={(e) => set('designation', e.target.value)}>
                  {designations.map((d) => <MenuItem key={d.id} value={d.title}>{d.title}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={formData.category} label="Category"
                  onChange={(e) => set('category', e.target.value)}>
                  {categories.map((c) => <MenuItem key={c.id} value={c.name}>{c.display_name || c.name}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField size="small" label="Sort Order" type="number" fullWidth value={formData.order_position}
                onChange={(e) => set('order_position', parseInt(e.target.value) || 0)} />
            </Box>
            <TextField size="small" label="Bio / About" multiline rows={3} fullWidth value={formData.bio}
              onChange={(e) => set('bio', e.target.value)} sx={{ mt: 2 }} />
          </div>

          {/* Contact + Social */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Contact & Social</div>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField size="small" label="Email" type="email" fullWidth value={formData.email}
                onChange={(e) => set('email', e.target.value)} />
              <TextField size="small" label="Phone" fullWidth value={formData.phone}
                onChange={(e) => set('phone', e.target.value)} />
              <TextField size="small" label="LinkedIn" fullWidth value={formData.social_links.linkedin}
                onChange={(e) => setSocial('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..."
                InputProps={{ startAdornment: <LinkedInIcon sx={{ mr: 1, fontSize: 18, color: '#0077B5' }} /> }} />
              <TextField size="small" label="Twitter / X" fullWidth value={formData.social_links.twitter}
                onChange={(e) => setSocial('twitter', e.target.value)} placeholder="https://twitter.com/..."
                InputProps={{ startAdornment: <TwitterIcon sx={{ mr: 1, fontSize: 18, color: '#1DA1F2' }} /> }} />
              <TextField size="small" label="Facebook" fullWidth value={formData.social_links.facebook}
                onChange={(e) => setSocial('facebook', e.target.value)} placeholder="https://facebook.com/..."
                InputProps={{ startAdornment: <FacebookIcon sx={{ mr: 1, fontSize: 18, color: '#1877F2' }} /> }} />
              <TextField size="small" label="Instagram" fullWidth value={formData.social_links.instagram}
                onChange={(e) => setSocial('instagram', e.target.value)} placeholder="https://instagram.com/..."
                InputProps={{ startAdornment: <InstagramIcon sx={{ mr: 1, fontSize: 18, color: '#E4405F' }} /> }} />
            </Box>
          </div>
        </Box>

        {/* Right sidebar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Photo */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Profile Photo</div>
            <ImageCropUpload
              value={formData.image_url}
              onChange={(url) => set('image_url', url)}
              folder="team"
              width={240}
              height={240}
              cropAspectRatio={1}
              label="Upload Photo"
              altText={formData.name}
            />
          </div>

          {/* Status */}
          <div style={sectionStyle}>
            <div style={labelStyle}>Status</div>
            <FormControlLabel
              control={<Switch checked={formData.is_active} onChange={(e) => set('is_active', e.target.checked)}
                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#2563EB' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#2563EB' } }} />}
              label={<Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{formData.is_active ? 'Active' : 'Inactive'}</Typography>}
            />
            <Chip label={formData.is_active ? 'Visible on website' : 'Hidden from website'} size="small"
              sx={{ mt: 1, fontSize: '0.75rem', bgcolor: formData.is_active ? '#DCFCE7' : '#FEE2E2', color: formData.is_active ? '#166534' : '#991B1B' }} />
          </div>

          {/* Cancel */}
          <Button variant="outlined" fullWidth onClick={() => navigate('..')}
            sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569', borderRadius: 1.5 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TeamMemberEdit;
