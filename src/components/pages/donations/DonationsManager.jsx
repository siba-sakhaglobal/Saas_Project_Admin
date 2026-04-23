import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Switch,
  FormControlLabel,
  Avatar,
  Stack,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Fade,
  Skeleton,
  Container,
  Fab,
  Tabs,
  Tab,
  Pagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  Favorite as HeartIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  FilterList as FilterIcon,
  BarChart as ChartIcon,
  CheckCircle as SuccessIcon,
  Schedule as PendingIcon,
  Cancel as CancelIcon,
  Launch as LaunchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  Group as GroupIcon,
  EmojiEvents as GoalIcon,
  Business as CorporateIcon,
  Person as IndividualIcon,
  School as EducationIcon,
  LocalHospital as HealthIcon,
  Park as EnvironmentIcon,
  Build as InfrastructureIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import cms from '../../../services/cms';

const DonationsManager = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [openDonationsDialog, setOpenDonationsDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [viewMode, setViewMode] = useState('grid');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalDonors: 0,
    thisMonthDonations: 0,
    averageDonation: 0
  });


  const categories = [
    { name: 'Education', icon: EducationIcon, color: '#3b82f6' },
    { name: 'Healthcare', icon: HealthIcon, color: '#ef4444' },
    { name: 'Environment', icon: EnvironmentIcon, color: '#22c55e' },
    { name: 'Infrastructure', icon: InfrastructureIcon, color: '#f59e0b' },
    { name: 'Emergency Relief', icon: HeartIcon, color: '#ec4899' },
    { name: 'Community Development', icon: GroupIcon, color: '#8b5cf6' }
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'paused', label: 'Paused', color: 'warning' },
    { value: 'completed', label: 'Completed', color: 'info' },
    { value: 'cancelled', label: 'Cancelled', color: 'error' }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await cms.donations.listCampaigns();
      setCampaigns(data.campaigns || data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      showSnackbar('Failed to fetch campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async (campaignId) => {
    try {
      const { data } = await cms.donations.listDonations({ campaign_id: campaignId });
      setDonations(data.donations || data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      showSnackbar('Failed to fetch donations', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await cms.donations.stats();
      setStats(data || {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalRaised: 0,
        totalDonors: 0,
        thisMonthDonations: 0,
        averageDonation: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      showSnackbar('Failed to fetch statistics', 'error');
    }
  };

  const handleEditCampaign = (campaign) => {
    navigate(`edit/${campaign.id}`);
  };

  const handleCreateCampaign = () => {
    navigate('new');
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      try {
        const updatedCampaigns = campaigns.filter(campaign => campaign.id !== campaignId);
        setCampaigns(updatedCampaigns);
        showSnackbar('Campaign deleted successfully', 'success');
        fetchStats();
      } catch (error) {
        showSnackbar('Failed to delete campaign', 'error');
      }
    }
  };

  const handleDuplicateCampaign = async (campaign) => {
    const duplicatedCampaign = {
      ...campaign,
      id: Math.max(...campaigns.map(c => c.id)) + 1,
      title: `${campaign.title} (Copy)`,
      slug: `${campaign.slug}-copy`,
      raised_amount: 0,
      donors_count: 0,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 0
    };
    setCampaigns([duplicatedCampaign, ...campaigns]);
    showSnackbar('Campaign duplicated successfully! 📋', 'success');
  };

  const handleOpenDonations = (campaign) => {
    setSelectedCampaign(campaign);
    fetchDonations(campaign.id);
    setOpenDonationsDialog(true);
  };

  const handleOpenPreview = (campaign) => {
    setPreviewCampaign(campaign);
    setOpenPreviewDialog(true);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };


  const getStatusColor = (status) => {
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'default';
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : CampaignIcon;
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#666';
  };

  const getCampaignsByStatus = (status) => {
    return campaigns.filter(campaign => campaign.status === status);
  };

  // Filter and sort campaigns based on search and filters - latest first
  const filteredCampaigns = campaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            campaign.organizer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || campaign.category === filterCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    })
    // Sort by latest first (created_at descending)
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.start_date);
      const dateB = new Date(b.created_at || b.start_date);
      return dateB.getTime() - dateA.getTime();
    });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Stats Cards
  const StatsCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card
      sx={{
        height: '100%',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 1.5,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            backgroundColor: `${color}15`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 50,
            height: 50
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', my: 0.5, fontSize: '1.75rem', lineHeight: 1.2 }}>
            {typeof value === 'number' && title.includes('₹')
              ? `₹${value.toLocaleString()}`
              : typeof value === 'number'
              ? value.toLocaleString()
              : value
            }
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <TrendingIcon fontSize="small" sx={{ color: '#10B981' }} />
              <Typography variant="caption" color="success.main" fontWeight="600" sx={{ fontSize: '0.75rem' }}>
                {trend}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  // Enhanced Campaign Card Component
  const CampaignCard = ({ campaign }) => {
    const CategoryIconComponent = getCategoryIcon(campaign.category);
    const categoryColor = getCategoryColor(campaign.category);

    return (
      <Fade in={true} timeout={500}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            border: '1px solid #E2E8F0',
            borderRadius: 1.5,
            backgroundColor: '#FFFFFF',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
            },
            position: 'relative',
            overflow: 'visible'
          }}
        >
          {/* Badges */}
          <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2, display: 'flex', gap: 1 }}>
            {campaign.featured && (
              <Chip
                label="Featured"
                size="small"
                sx={{
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  fontWeight: '600'
                }}
              />
            )}
            {campaign.urgent && (
              <Chip
                label="Urgent"
                size="small"
                sx={{
                  backgroundColor: '#DC2626',
                  color: 'white',
                  fontWeight: '600'
                }}
              />
            )}
          </Box>

          {/* Campaign Image */}
          {campaign.image_url && (
            <CardMedia
              component="img"
              height="220"
              image={campaign.image_url}
              alt={campaign.title}
              sx={{
                borderRadius: '8px 8px 0 0',
                objectFit: 'cover'
              }}
            />
          )}

          <CardContent sx={{ flexGrow: 1, p: 3 }}>
            {/* Header with Status and Category */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: '8px',
                    backgroundColor: `${categoryColor}15`,
                    color: categoryColor
                  }}
                >
                  <CategoryIconComponent fontSize="small" />
                </Box>
                <Chip
                  label={campaign.category}
                  size="small"
                  sx={{
                    backgroundColor: `${categoryColor}15`,
                    color: categoryColor,
                    fontWeight: 'medium'
                  }}
                />
              </Box>
              <Chip
                label={campaign.status}
                size="small"
                color={getStatusColor(campaign.status)}
                sx={{ fontWeight: 'medium' }}
              />
            </Box>

            {/* Campaign Title */}
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                lineHeight: 1.3,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.6em'
              }}
            >
              {campaign.title}
            </Typography>

            {/* Campaign Details */}
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {campaign.location}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DateIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {dayjs(campaign.start_date).format('MMM DD')} - {dayjs(campaign.end_date).format('MMM DD, YYYY')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {campaign.donors_count} donors
                </Typography>
              </Box>
            </Stack>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.5
              }}
            >
              {campaign.description}
            </Typography>

            {/* Funding Progress */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="700" sx={{ color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{campaign.raised_amount.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Goal: ₹{campaign.goal_amount.toLocaleString()}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(campaign.progress, 100)}
                sx={{
                  height: 8,
                  borderRadius: 1.5,
                  backgroundColor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: campaign.progress >= 100
                      ? '#10B981'
                      : campaign.progress >= 75
                      ? '#F59E0B'
                      : '#2563EB',
                    borderRadius: 1.5
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {parseFloat(campaign.progress_percentage || 0).toFixed(1)}% raised
              </Typography>
            </Box>

            {/* Tags */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {campaign.tags?.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: '24px' }}
                />
              ))}
            </Box>

            {/* Organizer */}
            <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
              By {campaign.organizer}
            </Typography>
          </CardContent>

          {/* Action Buttons */}
          <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Preview Campaign">
                <IconButton
                  size="small"
                  onClick={() => handleOpenPreview(campaign)}
                  sx={{
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                  }}
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Campaign">
                <IconButton
                  size="small"
                  onClick={() => handleEditCampaign(campaign)}
                  sx={{
                    backgroundColor: 'warning.light',
                    color: 'warning.main',
                    '&:hover': { backgroundColor: 'warning.main', color: 'white' }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Duplicate Campaign">
                <IconButton
                  size="small"
                  onClick={() => handleDuplicateCampaign(campaign)}
                  sx={{
                    backgroundColor: 'info.light',
                    color: 'info.main',
                    '&:hover': { backgroundColor: 'info.main', color: 'white' }
                  }}
                >
                  <LaunchIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Campaign">
                <IconButton
                  size="small"
                  onClick={() => handleDeleteCampaign(campaign.id)}
                  sx={{
                    backgroundColor: 'error.light',
                    color: 'error.main',
                    '&:hover': { backgroundColor: 'error.main', color: 'white' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Button
              size="small"
              variant="contained"
              startIcon={<PeopleIcon />}
              onClick={() => handleOpenDonations(campaign)}
              sx={{
                backgroundColor: '#2563EB',
                '&:hover': {
                  backgroundColor: '#1d4ed8'
                }
              }}
            >
              Donations ({campaign.donors_count})
            </Button>
          </CardActions>
        </Card>
      </Fade>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Container maxWidth="xl">
          {/* Stats Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 4,
              mt: 3,
              alignItems: 'stretch'
            }}
          >
            <StatsCard
              title="Total Campaigns"
              value={stats.totalCampaigns || 0}
              icon={CampaignIcon}
              color="#2563EB"
            />
            <StatsCard
              title="Active Campaigns"
              value={stats.activeCampaigns || 0}
              icon={TrendingIcon}
              color="#10B981"
            />
            <StatsCard
              title="Total Raised"
              value={stats.totalRaised || 0}
              icon={MoneyIcon}
              color="#2563EB"
            />
            <StatsCard
              title="Total Donors"
              value={stats.totalDonors || 0}
              icon={PeopleIcon}
              color="#F59E0B"
            />
            <StatsCard
              title="This Month Donations"
              value={stats.thisMonthDonations || 0}
              icon={GoalIcon}
              color="#10B981"
            />
            <StatsCard
              title="Average Donation"
              value={stats.averageDonation || 0}
              icon={TrendingIcon}
              color="#F59E0B"
            />
          </Box>

          {/* Tab Navigation */}
          <Box sx={{ mb: 4, borderBottom: '1px solid #E2E8F0' }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#475569',
                  borderBottom: '2px solid transparent',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#2563EB',
                    borderBottomColor: '#2563EB'
                  }
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              <Tab label={`All Campaigns (${campaigns.length})`} />
              <Tab label={`Active (${getCampaignsByStatus('active').length})`} />
              <Tab label={`Completed (${getCampaignsByStatus('completed').length})`} />
              <Tab label="Analytics" />
            </Tabs>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateCampaign}
                sx={{ backgroundColor: '#2563EB', textTransform: 'none', fontWeight: 600, borderRadius: 1 }}
              >
                New Campaign
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 1.5, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search campaigns, locations, organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: 'primary.main' }
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    {statuses.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Category"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat.name} value={cat.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <cat.icon fontSize="small" sx={{ color: cat.color }} />
                          {cat.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterCategory('all');
                  }}
                  sx={{ borderRadius: 2, height: '40px' }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Results Count */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Showing {filteredCampaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length} of {filteredCampaigns.length} campaigns
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('table')}
              >
                Table View
              </Button>
            </Box>
          </Box>

          {/* Loading State */}
          {loading ? (
            <Grid container spacing={3}>
              {[...Array(6)].map((_, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card sx={{ height: 400 }}>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={30} />
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <>
              {/* Campaigns Grid */}
              {viewMode === 'grid' ? (
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)'
                  },
                  gap: 2,
                  alignItems: 'stretch'
                }}>
                  {filteredCampaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(campaign => (
                    <Box key={campaign.id}>
                      <CampaignCard campaign={campaign} />
                    </Box>
                  ))}
                </Box>
              ) : (
                // Table View
                <TableContainer component={Paper} sx={{ borderRadius: 1.5, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Campaign</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Goal Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Raised Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Donors</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCampaigns.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(campaign => {
                        const CategoryIconComponent = getCategoryIcon(campaign.category);
                        const categoryColor = getCategoryColor(campaign.category);

                        return (
                          <TableRow key={campaign.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {campaign.image_url && (
                                  <Avatar
                                    src={campaign.image_url}
                                    sx={{ width: 48, height: 48, borderRadius: 2 }}
                                    variant="rounded"
                                  />
                                )}
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                                    {campaign.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {campaign.location} • By {campaign.organizer}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                    {campaign.featured && (
                                      <Chip label="Featured" size="small" color="primary" sx={{ fontSize: '0.65rem', height: '20px' }} />
                                    )}
                                    {campaign.urgent && (
                                      <Chip label="Urgent" size="small" color="error" sx={{ fontSize: '0.65rem', height: '20px' }} />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                  sx={{
                                    p: 0.5,
                                    borderRadius: '6px',
                                    backgroundColor: `${categoryColor}15`,
                                    color: categoryColor
                                  }}
                                >
                                  <CategoryIconComponent fontSize="small" />
                                </Box>
                                <Typography variant="body2">{campaign.category}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                ₹{campaign.goal_amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                ₹{campaign.raised_amount.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ minWidth: 100 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(campaign.progress, 100)}
                                    sx={{
                                      flexGrow: 1,
                                      height: 6,
                                      borderRadius: 1.5,
                                      backgroundColor: '#E2E8F0',
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 1.5,
                                        backgroundColor: '#2563EB'
                                      }
                                    }}
                                  />
                                  <Typography variant="caption" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
                                    {parseFloat(campaign.progress_percentage || 0).toFixed(1)}%
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={campaign.status}
                                size="small"
                                color={getStatusColor(campaign.status)}
                                sx={{ fontWeight: 'medium' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {campaign.donors_count}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                <Tooltip title="Preview">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenPreview(campaign)}
                                    sx={{ color: 'primary.main' }}
                                  >
                                    <ViewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditCampaign(campaign)}
                                    sx={{ color: 'warning.main' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Donations">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDonations(campaign)}
                                    sx={{ color: 'info.main' }}
                                  >
                                    <PeopleIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Empty State */}
              {filteredCampaigns.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center', my: 4, borderRadius: 1.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
                  <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    No campaigns found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Try adjusting your search terms or filters
                  </Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateCampaign}>
                    Create Your First Campaign
                  </Button>
                </Paper>
              )}
            </>
          )}

          {/* Enhanced Pagination */}
          {filteredCampaigns.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <TablePagination
                rowsPerPageOptions={[6, 9, 12, 18]}
                component="div"
                count={filteredCampaigns.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    borderRadius: 1.5,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0'
                  }
                }}
              />
            </Box>
          )}
        </Container>


        {/* Donations Dialog */}
        <Dialog open={openDonationsDialog} onClose={() => setOpenDonationsDialog(false)} maxWidth="lg" fullWidth>
          <DialogTitle sx={{
            backgroundColor: '#FFFFFF',
            color: '#1E293B',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MoneyIcon />
              <Box>
                <Typography variant="h6">Campaign Donations</Typography>
                <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>
                  {selectedCampaign?.title}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                startIcon={<DownloadIcon />}
                size="small"
                variant="outlined"
                sx={{ color: '#2563EB', borderColor: '#E2E8F0' }}
              >
                Export CSV
              </Button>
              <IconButton size="small" onClick={() => setOpenDonationsDialog(false)} sx={{ color: '#475569' }}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>Donor</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>Payment Method</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#1E293B' }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {donations.map(donation => (
                    <TableRow key={donation.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{
                            backgroundColor: donation.donor_type === 'corporate' ? 'orange' : 'primary.main',
                            width: 40,
                            height: 40
                          }}>
                            {donation.donor_type === 'corporate' ?
                              <CorporateIcon fontSize="small" /> :
                              <IndividualIcon fontSize="small" />
                            }
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {donation.donor_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {donation.donor_email}
                            </Typography>
                            {donation.donor_phone && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {donation.donor_phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          ₹{donation.amount.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{donation.payment_method}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {donation.transaction_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={donation.message}
                        >
                          {donation.message || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={donation.status}
                          size="small"
                          color={donation.status === 'completed' ? 'success' : 'warning'}
                          sx={{ fontWeight: 'medium' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {dayjs(donation.created_at).format('MMM DD, YYYY')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {donations.length === 0 && (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <MoneyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No donations yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Donations will appear here once people start contributing
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              {donations.length} total donations
            </Typography>
            <Button onClick={() => setOpenDonationsDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{
            backgroundColor: '#2563EB',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ViewIcon />
              Campaign Preview
            </Box>
            <IconButton size="small" onClick={() => setOpenPreviewDialog(false)} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            {previewCampaign && (
              <Box>
                {/* Preview Image */}
                {previewCampaign.image_url && (
                  <Box sx={{ height: 300, overflow: 'hidden' }}>
                    <img
                      src={previewCampaign.image_url}
                      alt={previewCampaign.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                )}

                <Box sx={{ p: 4 }}>
                  {/* Title and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {previewCampaign.title}
                    </Typography>
                    <Chip
                      label={previewCampaign.status}
                      color={getStatusColor(previewCampaign.status)}
                      sx={{ fontWeight: 'medium' }}
                    />
                  </Box>

                  {/* Campaign Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h5" color="success.main" fontWeight="bold">
                        ₹{previewCampaign.raised_amount.toLocaleString()}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Goal: ₹{previewCampaign.goal_amount.toLocaleString()}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(previewCampaign.progress, 100)}
                      sx={{ height: 12, borderRadius: 6, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {parseFloat(previewCampaign.progress_percentage || 0).toFixed(1)}% raised • {previewCampaign.donation_count} donors
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {previewCampaign.description}
                  </Typography>

                  {/* Content */}
                  {previewCampaign.content && (
                    <Box
                      sx={{ mb: 3 }}
                      dangerouslySetInnerHTML={{ __html: previewCampaign.content }}
                    />
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setOpenPreviewDialog(false);
                handleEditCampaign(previewCampaign);
              }}
            >
              Edit Campaign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ borderRadius: 2 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default DonationsManager;