import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Autocomplete,
  InputAdornment,
  IconButton,
  Breadcrumbs,
  Link,
  Container,
  Tooltip,
  Avatar,
  LinearProgress,
  Badge
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Campaign as CampaignIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  Visibility as VisibilityIcon,
  Star as FeaturedIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  TrendingUp as TrendingIcon,
  Favorite as HeartIcon,
  Group as GroupIcon,
  EmojiEvents as GoalIcon,
  School as EducationIcon,
  LocalHospital as HealthIcon,
  Park as EnvironmentIcon,
  Build as InfrastructureIcon,
  Warning as UrgentIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import ImageCropUpload from '../../common/ImageCropUpload';
import cms from '../../../services/cms';

const DonationEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    goal_amount: '',
    raised_amount: 0,
    image_url: '',
    image_id: null,
    start_date: null,
    end_date: null,
    status: 'active',
    featured: false,
    urgent: false,
    location: '',
    organizer: '',
    tags: [],
    bank_details: '',
    contact_email: '',
    contact_phone: '',
    meta_title: '',
    meta_description: ''
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [stats, setStats] = useState({
    donors_count: 0,
    recent_donations: [],
    daily_average: 0,
    days_remaining: 0
  });

  // Categories with icons and colors
  const categories = [
    { name: 'Education', icon: EducationIcon, color: '#3b82f6' },
    { name: 'Healthcare', icon: HealthIcon, color: '#ef4444' },
    { name: 'Environment', icon: EnvironmentIcon, color: '#22c55e' },
    { name: 'Infrastructure', icon: InfrastructureIcon, color: '#f59e0b' },
    { name: 'Emergency Relief', icon: HeartIcon, color: '#ec4899' },
    { name: 'Community Development', icon: GroupIcon, color: '#8b5cf6' }
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'success', icon: SuccessIcon },
    { value: 'paused', label: 'Paused', color: 'warning', icon: InfoIcon },
    { value: 'completed', label: 'Completed', color: 'info', icon: SuccessIcon },
    { value: 'cancelled', label: 'Cancelled', color: 'error', icon: CancelIcon }
  ];

  // Fetch existing campaign data for editing
  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ['donation-campaign', id],
    queryFn: async () => {
      console.log('Fetching campaign data for ID:', id);
      const { data } = await cms.donations.getCampaign(id);
      console.log('Campaign data received:', data);
      return data;
    },
    enabled: !!id && isEditing
  });

  // Fetch campaign stats if editing (using general donation stats for now)
  const { data: campaignStats } = useQuery({
    queryKey: ['campaignStats', id],
    queryFn: async () => {
      const { data } = await cms.donations.stats();
      return data;
    },
    enabled: !!id && isEditing
  });

  // Load campaign data into form when editing
  useEffect(() => {
    console.log('UseEffect triggered - campaign:', campaign, 'isEditing:', isEditing);
    if (campaign && isEditing) {
      console.log('Loading campaign data into form:', campaign);
      setFormData({
        title: campaign.title || '',
        slug: campaign.slug || '',
        description: campaign.description || '',
        content: campaign.content || '',
        category: campaign.category || '',
        goal_amount: campaign.goal_amount || '',
        raised_amount: campaign.raised_amount || campaign.current_amount || 0,
        image_url: campaign.image_url || campaign.featured_image || '',
        image_id: campaign.image_id || null,
        start_date: campaign.start_date ? dayjs(campaign.start_date) : null,
        end_date: campaign.end_date ? dayjs(campaign.end_date) : null,
        status: campaign.status || 'active',
        featured: campaign.featured || false,
        urgent: campaign.urgent || false,
        location: campaign.location || '',
        organizer: campaign.organizer || '',
        tags: Array.isArray(campaign.tags) ? campaign.tags : (campaign.tags ? campaign.tags.split(',').map(tag => tag.trim()) : []),
        bank_details: campaign.bank_details || '',
        contact_email: campaign.contact_email || '',
        contact_phone: campaign.contact_phone || '',
        meta_title: campaign.meta_title || campaign.title || '',
        meta_description: campaign.meta_description || campaign.description || ''
      });
    }
  }, [campaign, isEditing]);

  // Load stats when available
  useEffect(() => {
    if (campaignStats) {
      setStats(campaignStats);
    }
  }, [campaignStats]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !isEditing) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, isEditing]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await cms.donations.createCampaign(data);
      return response;
    },
    onSuccess: (data) => {
      toast.success('Campaign created successfully! 🎉');
      queryClient.invalidateQueries(['donation-campaigns']);
      navigate('..');
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error(error.response?.data?.error || 'Failed to create campaign');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await cms.donations.updateCampaign(id, data);
      return response;
    },
    onSuccess: (data) => {
      toast.success('Campaign updated successfully! ✨');
      queryClient.invalidateQueries(['donation-campaigns']);
      queryClient.invalidateQueries(['donation-campaign', id]);
      navigate('..');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update campaign');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => cms.donations.deleteCampaign(id),
    onSuccess: () => {
      toast.success('Campaign deleted successfully!');
      queryClient.invalidateQueries(['donation-campaigns']);
      navigate('..');
    },
    onError: (error) => {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (imageUrl, mediaId) => {
    console.log('🖼️ handleImageChange called with:', { imageUrl, mediaId });
    setFormData(prev => {
      const newFormData = {
        ...prev,
        image_url: imageUrl,
        image_id: mediaId
      };
      console.log('📋 Updated formData:', newFormData);
      return newFormData;
    });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    const campaignData = {
      ...formData,
      start_date: formData.start_date ? formData.start_date.format('YYYY-MM-DD') : null,
      end_date: formData.end_date ? formData.end_date.format('YYYY-MM-DD') : null,
      tags: Array.isArray(formData.tags) ? formData.tags.join(',') : formData.tags,
      goal_amount: parseFloat(formData.goal_amount) || 0,
      raised_amount: parseFloat(formData.raised_amount) || 0
    };

    console.log('💾 handleSave - Current formData:', formData);
    console.log('📤 handleSave - Sending campaignData:', campaignData);

    if (isEditing) {
      updateMutation.mutate(campaignData);
    } else {
      createMutation.mutate(campaignData);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    const IconComponent = category ? category.icon : CampaignIcon;
    return <IconComponent />;
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#666';
  };

  const getStatusIcon = (statusValue) => {
    const status = statuses.find(s => s.value === statusValue);
    const IconComponent = status ? status.icon : InfoIcon;
    return <IconComponent fontSize="small" />;
  };

  const progressPercentage = formData.goal_amount > 0
    ? Math.min((formData.raised_amount / formData.goal_amount) * 100, 100)
    : 0;

  if (campaignLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const sectionStyle = {
    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
    padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const labelStyle = {
    fontSize: 14, fontWeight: 700, color: '#1E293B', marginBottom: 16,
    display: 'flex', alignItems: 'center', gap: 8,
  };
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{
          px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid #E2E8F0', bgcolor: '#fff',
        }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
              {isEditing ? 'Edit Campaign' : 'Create Campaign'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              {isEditing ? 'Update campaign details and track progress' : 'Set up a new donation campaign'}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate('..')}
              sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}>
              Back
            </Button>
            {isEditing && (
              <Button variant="outlined" color="error" onClick={handleDelete}
                sx={{ textTransform: 'none', fontSize: 13 }}>
                Delete
              </Button>
            )}
            <Button variant="contained" startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave} disabled={saving || !formData.title || !formData.goal_amount}
              sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontSize: 13 }}>
              {saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </Stack>
        </Box>

        {/* Form Body */}
        <Box sx={{ p: 3, maxWidth: 1100, mx: 'auto' }}>

          {/* Row 1: Title + Goal + Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <TextField fullWidth label="Campaign Title" value={formData.title} required size="small"
              onChange={(e) => handleInputChange('title', e.target.value)} />
            <TextField fullWidth label="Goal Amount ($)" type="number" value={formData.goal_amount} required size="small"
              onChange={(e) => handleInputChange('goal_amount', e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} onChange={(e) => handleInputChange('status', e.target.value)} label="Status">
                {statuses.map(s => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          {/* Progress Bar (edit mode) */}
          {isEditing && formData.goal_amount > 0 && (
            <div style={{ ...sectionStyle, marginBottom: 20, padding: 16 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                  ${Number(formData.raised_amount).toLocaleString()} raised of ${Number(formData.goal_amount).toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 700 }}>
                  {progressPercentage.toFixed(0)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progressPercentage}
                sx={{ height: 8, borderRadius: 4, bgcolor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: progressPercentage >= 100 ? '#10B981' : '#2563EB' } }} />
            </div>
          )}

          {/* Row 2: Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Description */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <CampaignIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Description
                </div>
                <TextField fullWidth multiline rows={3} value={formData.description} size="small"
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the campaign..." />
              </div>

              {/* Content Editor */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Campaign Details</div>
                <Box sx={{ '& .ql-editor': { minHeight: 200 }, '& .ql-container': { borderRadius: '0 0 8px 8px' }, '& .ql-toolbar': { borderRadius: '8px 8px 0 0' } }}>
                  <ReactQuill theme="snow" value={formData.content}
                    onChange={(v) => handleInputChange('content', v)} modules={quillModules}
                    placeholder="Write detailed campaign story, impact, how funds will be used..." />
                </Box>
              </div>

              {/* Contact & Banking */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Contact & Banking</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <TextField fullWidth label="Contact Email" type="email" value={formData.contact_email} size="small"
                    onChange={(e) => handleInputChange('contact_email', e.target.value)} />
                  <TextField fullWidth label="Contact Phone" value={formData.contact_phone} size="small"
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)} />
                </div>
                <TextField fullWidth label="Bank Details / Payment Info" value={formData.bank_details} size="small"
                  multiline rows={2} onChange={(e) => handleInputChange('bank_details', e.target.value)} />
              </div>

              {/* SEO */}
              <div style={sectionStyle}>
                <div style={labelStyle}>SEO Settings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <TextField fullWidth label="Meta Title" value={formData.meta_title} size="small"
                    onChange={(e) => handleInputChange('meta_title', e.target.value)} />
                  <TextField fullWidth multiline rows={2} label="Meta Description" value={formData.meta_description} size="small"
                    onChange={(e) => handleInputChange('meta_description', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Featured Image */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Campaign Image</div>
                {formData.image_url && (
                  <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                    <img src={formData.image_url} alt={formData.title}
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
                  </Box>
                )}
                <ImageCropUpload value={formData.image_url} onChange={handleImageChange}
                  folder="donations" cropAspectRatio={16 / 9} width={292} height={160}
                  altText={formData.title} label="Upload Image" />
              </div>

              {/* Schedule */}
              <div style={sectionStyle}>
                <div style={labelStyle}>
                  <ScheduleIcon sx={{ fontSize: 18, color: '#2563EB' }} /> Campaign Duration
                </div>
                <Stack spacing={2}>
                  <DatePicker label="Start Date" value={formData.start_date}
                    onChange={(v) => handleInputChange('start_date', v)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  <DatePicker label="End Date" value={formData.end_date}
                    onChange={(v) => handleInputChange('end_date', v)}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                </Stack>
              </div>

              {/* Category & Details */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Category & Details</div>
                <Stack spacing={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} label="Category">
                      {categories.map(c => (
                        <MenuItem key={c.name} value={c.name}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c.color }} />
                            {c.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField fullWidth label="Organizer" value={formData.organizer} size="small"
                    onChange={(e) => handleInputChange('organizer', e.target.value)} />
                  <TextField fullWidth label="Location" value={formData.location} size="small"
                    onChange={(e) => handleInputChange('location', e.target.value)} />
                </Stack>
              </div>

              {/* Tags */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Tags</div>
                <TextField fullWidth size="small" label="Add Tag" value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={handleAddTag} size="small"><AddIcon /></IconButton></InputAdornment> }}
                  sx={{ mb: 1.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag, i) => (
                    <Chip key={i} label={tag} onDelete={() => handleRemoveTag(tag)}
                      size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', '& .MuiChip-deleteIcon': { color: '#93C5FD' } }} />
                  ))}
                </Box>
              </div>

              {/* Options */}
              <div style={sectionStyle}>
                <div style={labelStyle}>Options</div>
                <Stack spacing={1}>
                  <FormControlLabel
                    control={<Switch checked={formData.featured} onChange={(e) => handleInputChange('featured', e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Featured Campaign</Typography>} />
                  <FormControlLabel
                    control={<Switch checked={formData.urgent} onChange={(e) => handleInputChange('urgent', e.target.checked)} size="small" />}
                    label={<Typography variant="body2">Mark as Urgent</Typography>} />
                </Stack>
              </div>
            </div>
          </div>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DonationEditor;
