import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Chip, Stack, CircularProgress, Card, CardContent, FormControlLabel, Switch,
  InputAdornment, IconButton,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Save as SaveIcon, ArrowBack as BackIcon, Add as AddIcon,
  Event as EventIcon, LocationOn as LocationIcon, People as PeopleIcon,
  Schedule as ScheduleIcon, Star as FeaturedIcon,
  Public as PublicIcon, Lock as PrivateIcon,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import ImageCropUpload from '../../common/ImageCropUpload';
import cms from '../../../services/cms';

const sectionStyle = {
  background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle = {
  fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 16,
  display: 'flex', alignItems: 'center', gap: 8,
};

const EventEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', content: '',
    location: '', venue: '', address: '',
    event_date: null, event_time: '', end_date: null, end_time: '',
    image_id: null, category: '',
    registration_required: true, max_participants: '', registration_fee: 0,
    contact_person: '', contact_email: '', contact_phone: '',
    status: 'upcoming', is_featured: false, visibility: 'public',
    tags: [], meta_title: '', meta_description: '', image_url: '',
  });

  const [tagInput, setTagInput] = useState('');

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const { data } = await cms.events.get(id);
      return data;
    },
    enabled: !!id && isEditing,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => { try { const { data } = await cms.events.listCategories(); return data; } catch { return []; } },
  });

  useEffect(() => {
    if (event && isEditing) {
      setFormData({
        title: event.title || '', slug: event.slug || '',
        description: event.description || '', content: event.content || '',
        location: event.location || '', venue: event.venue || '',
        event_date: event.event_date ? dayjs(event.event_date) : null,
        event_time: event.event_time || '',
        end_date: event.end_date ? dayjs(event.end_date) : null,
        end_time: event.end_time || '',
        image_id: event.image_id || null,
        category: event.category?.name?.toLowerCase() || '',
        registration_required: event.registration_required ?? false,
        max_participants: event.max_participants || '',
        status: event.status || 'upcoming',
        image_url: event.image_url || '',
        address: event.address || '',
        registration_fee: event.registration_fee || 0,
        contact_person: event.contact_person || '',
        contact_email: event.contact_email || '',
        contact_phone: event.contact_phone || '',
        is_featured: event.is_featured || false,
        visibility: event.visibility || 'public',
        tags: Array.isArray(event.tags) ? event.tags : [],
        meta_title: event.meta_title || event.title || '',
        meta_description: event.meta_description || event.description || '',
      });
    }
  }, [event, isEditing]);

  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data) => cms.events.create(data),
    onSuccess: () => { toast.success('Event created!'); queryClient.invalidateQueries(['events']); navigate('..'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create event'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => cms.events.update(id, data),
    onSuccess: () => { toast.success('Event updated!'); queryClient.invalidateQueries(['events']); queryClient.invalidateQueries(['event', id]); navigate('..'); },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update event'),
  });

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const data = {
      ...formData,
      event_date: formData.event_date?.format('YYYY-MM-DD') || null,
      end_date: formData.end_date?.format('YYYY-MM-DD') || null,
      tags: formData.tags.join(','),
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      registration_fee: parseFloat(formData.registration_fee) || 0,
    };
    isEditing ? updateMutation.mutate(data) : createMutation.mutate(data);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      set('tags', [...formData.tags, tagInput.trim()]);
      setTagInput('');
    }
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

  if (eventLoading) {
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
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {isEditing ? 'Update event details' : 'Fill in the event details below'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('..')}
              sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}>
              Back
            </Button>
            <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave} disabled={saving || !formData.title}
              sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontSize: 13 }}>
              {saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </Stack>
        </Box>

        {/* Form Body */}
        <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>

          {/* Row 1: Title + Slug + Category — 3 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <TextField fullWidth label="Event Title" value={formData.title} required size="small"
              onChange={(e) => set('title', e.target.value)} placeholder="Enter event title..." />
            <TextField fullWidth label="Slug" value={formData.slug} size="small"
              onChange={(e) => set('slug', e.target.value)} placeholder="event-slug" />
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select value={formData.category} onChange={(e) => set('category', e.target.value)} label="Category">
                {categories.map((cat, i) => {
                  const name = typeof cat === 'string' ? cat : cat.name;
                  return <MenuItem key={i} value={name.toLowerCase()}>{name}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </div>

          {/* Row 2: Two columns — Left (Description + Content + Location + SEO) | Right (Image + Schedule + Registration + Contact + Tags + Publish) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Description */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <EventIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Description
                </div>
                <TextField fullWidth multiline rows={3} value={formData.description} size="small"
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Brief description of the event..." />
              </div>

              {/* Content Editor */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <EventIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Event Details
                </div>
                <Box sx={{ '& .ql-editor': { minHeight: 220 }, '& .ql-container': { borderRadius: '0 0 8px 8px' }, '& .ql-toolbar': { borderRadius: '8px 8px 0 0' } }}>
                  <ReactQuill theme="snow" value={formData.content}
                    onChange={(v) => set('content', v)} modules={quillModules}
                    placeholder="Write detailed event information, agenda, requirements..." />
                </Box>
              </div>

              {/* Location & Venue */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <LocationIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Location & Venue
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <TextField fullWidth label="Location" value={formData.location} size="small"
                    onChange={(e) => set('location', e.target.value)} placeholder="City, State" />
                  <TextField fullWidth label="Venue" value={formData.venue} size="small"
                    onChange={(e) => set('venue', e.target.value)} placeholder="Venue name" />
                </div>
                <TextField fullWidth label="Full Address" value={formData.address} size="small"
                  onChange={(e) => set('address', e.target.value)} placeholder="Complete address with zip code" />
              </div>

              {/* SEO */}
              <div style={sectionStyle}>
                <div style={labelStyle}>SEO Settings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <TextField fullWidth label="Meta Title" value={formData.meta_title} size="small"
                    onChange={(e) => set('meta_title', e.target.value)} />
                  <TextField fullWidth multiline rows={2} label="Meta Description" value={formData.meta_description} size="small"
                    onChange={(e) => set('meta_description', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Featured Image */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Featured Image</div>
                {formData.image_url && (
                  <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                    <img src={formData.image_url} alt={formData.title} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
                  </Box>
                )}
                <ImageCropUpload value={formData.image_url}
                  onChange={(url, mediaId) => setFormData(prev => ({ ...prev, image_url: url, image_id: mediaId }))}
                  folder="events" cropAspectRatio={16 / 9} width={292} height={160}
                  altText={formData.title} label="Upload Image" />
              </div>

              {/* Schedule */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <ScheduleIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Schedule
                </div>
                <Stack spacing={2}>
                  <DateTimePicker label="Start Date & Time" value={formData.event_date}
                    onChange={(v) => set('event_date', v)} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  <DateTimePicker label="End Date & Time" value={formData.end_date}
                    onChange={(v) => set('end_date', v)} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                </Stack>
              </div>

              {/* Registration */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <PeopleIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Registration
                </div>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch checked={formData.registration_required} onChange={(e) => set('registration_required', e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Registration Required</Typography>} />
                  <TextField fullWidth label="Max Participants" type="number" value={formData.max_participants} size="small"
                    onChange={(e) => set('max_participants', e.target.value)} placeholder="Unlimited" />
                  <TextField fullWidth label="Registration Fee" type="number" value={formData.registration_fee} size="small"
                    onChange={(e) => set('registration_fee', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                </Stack>
              </div>

              {/* Contact */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Contact Information</div>
                <Stack spacing={2}>
                  <TextField fullWidth label="Contact Person" value={formData.contact_person} size="small"
                    onChange={(e) => set('contact_person', e.target.value)} />
                  <TextField fullWidth label="Email" type="email" value={formData.contact_email} size="small"
                    onChange={(e) => set('contact_email', e.target.value)} />
                  <TextField fullWidth label="Phone" value={formData.contact_phone} size="small"
                    onChange={(e) => set('contact_phone', e.target.value)} />
                </Stack>
              </div>

              {/* Tags */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Tags</div>
                <TextField fullWidth size="small" label="Add Tag" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={addTag} size="small"><AddIcon /></IconButton></InputAdornment> }}
                  sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag, i) => (
                    <Chip key={i} label={tag} onDelete={() => set('tags', formData.tags.filter(t => t !== tag))}
                      size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', '& .MuiChip-deleteIcon': { color: '#93C5FD' } }} />
                  ))}
                </Box>
              </div>

              {/* Publishing */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Publishing</div>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={formData.status} onChange={(e) => set('status', e.target.value)} label="Status">
                      <MenuItem value="upcoming">Upcoming</MenuItem>
                      <MenuItem value="ongoing">Ongoing</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel>Visibility</InputLabel>
                    <Select value={formData.visibility} onChange={(e) => set('visibility', e.target.value)} label="Visibility">
                      <MenuItem value="public"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PublicIcon sx={{ fontSize: 16 }} /> Public</Box></MenuItem>
                      <MenuItem value="private"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PrivateIcon sx={{ fontSize: 16 }} /> Private</Box></MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={<Switch checked={formData.is_featured} onChange={(e) => set('is_featured', e.target.checked)} size="small" />}
                    label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><FeaturedIcon sx={{ fontSize: 16, color: '#F59E0B' }} /><Typography variant="body2">Featured</Typography></Box>} />
                </Stack>
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default EventEditor;
