import React, { useState, useEffect } from 'react';
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
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingIcon,
  Campaign as CampaignIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  PaymentIcon,
  AccountBalanceWallet as WalletIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const DonationManager = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [donations, setDonations] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [openCampaignDialog, setOpenCampaignDialog] = useState(false);
  const [openDonationDialog, setOpenDonationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalDonations: 0,
    activeCampaigns: 0,
    avgDonation: 0,
    monthlyGrowth: 0
  });

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    category: '',
    goal_amount: '',
    start_date: null,
    end_date: null,
    image_url: '',
    status: 'active'
  });

  const [donationForm, setDonationForm] = useState({
    campaign_id: '',
    donor_name: '',
    donor_email: '',
    donor_phone: '',
    amount: '',
    payment_method: '',
    transaction_id: '',
    message: '',
    is_anonymous: false,
    status: 'completed'
  });

  const categories = ['Education', 'Healthcare', 'Environment', 'Disaster Relief', 'Community Development', 'Women Empowerment'];
  const paymentMethods = ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Cash', 'Cheque', 'Bank Transfer'];

  useEffect(() => {
    fetchCampaigns();
    fetchDonations();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // Using dummy data
      const dummyCampaigns = [
        {
          id: 1,
          title: 'Education for All - Rural School Initiative',
          description: 'Help us build and equip schools in rural areas to provide quality education to underprivileged children.',
          category: 'Education',
          goal_amount: 1000000,
          raised_amount: 750000,
          start_date: '2024-01-01',
          end_date: '2024-06-30',
          image_url: '/images/campaigns/education.jpg',
          status: 'active',
          donor_count: 324,
          created_at: '2024-01-01'
        },
        {
          id: 2,
          title: 'Medical Equipment for Rural Health Centers',
          description: 'Essential medical equipment and supplies for health centers serving remote communities.',
          category: 'Healthcare',
          goal_amount: 500000,
          raised_amount: 320000,
          start_date: '2024-02-01',
          end_date: '2024-05-31',
          image_url: '/images/campaigns/healthcare.jpg',
          status: 'active',
          donor_count: 156,
          created_at: '2024-02-01'
        },
        {
          id: 3,
          title: 'Clean Water Initiative',
          description: 'Install water purification systems and build wells in drought-affected areas.',
          category: 'Community Development',
          goal_amount: 800000,
          raised_amount: 800000,
          start_date: '2023-10-01',
          end_date: '2023-12-31',
          image_url: '/images/campaigns/water.jpg',
          status: 'completed',
          donor_count: 287,
          created_at: '2023-10-01'
        },
        {
          id: 4,
          title: 'Emergency Relief Fund',
          description: 'Immediate assistance for families affected by natural disasters.',
          category: 'Disaster Relief',
          goal_amount: 2000000,
          raised_amount: 450000,
          start_date: '2024-01-15',
          end_date: '2024-12-31',
          image_url: '/images/campaigns/relief.jpg',
          status: 'active',
          donor_count: 89,
          created_at: '2024-01-15'
        }
      ];
      setCampaigns(dummyCampaigns);
    } catch (error) {
      showSnackbar('Failed to fetch campaigns', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      // Using dummy data
      const dummyDonations = [
        {
          id: 1,
          campaign: { id: 1, title: 'Education for All - Rural School Initiative' },
          donor_name: 'Rajesh Kumar',
          donor_email: 'rajesh@example.com',
          donor_phone: '+91 9876543210',
          amount: 25000,
          payment_method: 'UPI',
          transaction_id: 'TXN123456789',
          message: 'Happy to contribute to education',
          is_anonymous: false,
          status: 'completed',
          created_at: '2024-01-20T10:30:00'
        },
        {
          id: 2,
          campaign: { id: 2, title: 'Medical Equipment for Rural Health Centers' },
          donor_name: 'Anonymous',
          donor_email: 'donor@example.com',
          donor_phone: '+91 9876543211',
          amount: 50000,
          payment_method: 'Credit Card',
          transaction_id: 'TXN123456790',
          message: '',
          is_anonymous: true,
          status: 'completed',
          created_at: '2024-01-21T14:15:00'
        },
        {
          id: 3,
          campaign: { id: 1, title: 'Education for All - Rural School Initiative' },
          donor_name: 'Priya Sharma',
          donor_email: 'priya@example.com',
          donor_phone: '+91 9876543212',
          amount: 10000,
          payment_method: 'Net Banking',
          transaction_id: 'TXN123456791',
          message: 'For the future of our children',
          is_anonymous: false,
          status: 'pending',
          created_at: '2024-01-22T09:00:00'
        },
        {
          id: 4,
          campaign: { id: 4, title: 'Emergency Relief Fund' },
          donor_name: 'Corporate Donor',
          donor_email: 'corporate@example.com',
          donor_phone: '+91 9876543213',
          amount: 100000,
          payment_method: 'Bank Transfer',
          transaction_id: 'TXN123456792',
          message: 'CSR Initiative',
          is_anonymous: false,
          status: 'completed',
          created_at: '2024-01-23T16:45:00'
        }
      ];
      setDonations(dummyDonations);
    } catch (error) {
      showSnackbar('Failed to fetch donations', 'error');
    }
  };

  const fetchStats = async () => {
    try {
      // Using dummy data
      setStats({
        totalRaised: 2320000,
        totalDonations: 856,
        activeCampaigns: 3,
        avgDonation: 2710,
        monthlyGrowth: 15.3
      });
    } catch (error) {
      showSnackbar('Failed to fetch stats', 'error');
    }
  };

  const handleOpenCampaignDialog = (campaign = null) => {
    if (campaign) {
      setCampaignForm({
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        goal_amount: campaign.goal_amount,
        start_date: campaign.start_date ? dayjs(campaign.start_date) : null,
        end_date: campaign.end_date ? dayjs(campaign.end_date) : null,
        image_url: campaign.image_url,
        status: campaign.status
      });
      setSelectedCampaign(campaign);
    } else {
      setCampaignForm({
        title: '',
        description: '',
        category: '',
        goal_amount: '',
        start_date: null,
        end_date: null,
        image_url: '',
        status: 'active'
      });
      setSelectedCampaign(null);
    }
    setOpenCampaignDialog(true);
  };

  const handleOpenDonationDialog = (donation = null) => {
    if (donation) {
      setDonationForm({
        campaign_id: donation.campaign.id,
        donor_name: donation.donor_name,
        donor_email: donation.donor_email,
        donor_phone: donation.donor_phone,
        amount: donation.amount,
        payment_method: donation.payment_method,
        transaction_id: donation.transaction_id,
        message: donation.message,
        is_anonymous: donation.is_anonymous,
        status: donation.status
      });
      setSelectedDonation(donation);
    } else {
      setDonationForm({
        campaign_id: '',
        donor_name: '',
        donor_email: '',
        donor_phone: '',
        amount: '',
        payment_method: '',
        transaction_id: '',
        message: '',
        is_anonymous: false,
        status: 'completed'
      });
      setSelectedDonation(null);
    }
    setOpenDonationDialog(true);
  };

  const handleSaveCampaign = async () => {
    try {
      if (selectedCampaign) {
        showSnackbar('Campaign updated successfully', 'success');
      } else {
        showSnackbar('Campaign created successfully', 'success');
      }
      setOpenCampaignDialog(false);
      fetchCampaigns();
    } catch (error) {
      showSnackbar('Failed to save campaign', 'error');
    }
  };

  const handleSaveDonation = async () => {
    try {
      if (selectedDonation) {
        showSnackbar('Donation updated successfully', 'success');
      } else {
        showSnackbar('Donation recorded successfully', 'success');
      }
      setOpenDonationDialog(false);
      fetchDonations();
    } catch (error) {
      showSnackbar('Failed to save donation', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getProgressPercentage = (campaign) => {
    return Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'paused': return 'warning';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Chart data
  const campaignData = campaigns.map(campaign => ({
    name: campaign.title.substring(0, 15) + '...',
    raised: campaign.raised_amount,
    goal: campaign.goal_amount,
    percentage: getProgressPercentage(campaign)
  }));

  const donationStatusData = [
    { name: 'Completed', value: donations.filter(d => d.status === 'completed').length, color: '#4CAF50' },
    { name: 'Pending', value: donations.filter(d => d.status === 'pending').length, color: '#FF9800' },
    { name: 'Failed', value: donations.filter(d => d.status === 'failed').length, color: '#F44336' }
  ];

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || campaign.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          donation.campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const donationColumns = [
    {
      field: 'donor_name',
      headerName: 'Donor',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {params.row.donor_name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {params.row.is_anonymous ? 'Anonymous' : params.row.donor_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.donor_email}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'campaign',
      headerName: 'Campaign',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
          {params.row.campaign.title}
        </Typography>
      )
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="success.main">
          ₹{params.row.amount.toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'payment_method',
      headerName: 'Payment Method',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.row.payment_method} size="small" variant="outlined" />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          size="small"
          color={getStatusColor(params.row.status)}
        />
      )
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2">
          {dayjs(params.row.created_at).format('MMM DD, YYYY')}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleOpenDonationDialog(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Receipt">
            <IconButton size="small">
              <ReceiptIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Donation Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage donation campaigns, track contributions, and analyze fundraising performance
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<MoneyIcon />}
              onClick={() => handleOpenDonationDialog()}
            >
              Add Donation
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCampaignDialog()}
            >
              New Campaign
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Raised
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ₹{(stats.totalRaised / 100000).toFixed(1)}L
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      +{stats.monthlyGrowth}% this month
                    </Typography>
                  </Box>
                  <MoneyIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Total Donations
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalDonations}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Individual contributions
                    </Typography>
                  </Box>
                  <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Active Campaigns
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {stats.activeCampaigns}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Currently running
                    </Typography>
                  </Box>
                  <CampaignIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      Avg. Donation
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="secondary.main">
                      ₹{stats.avgDonation.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Per contribution
                    </Typography>
                  </Box>
                  <AnalyticsIcon sx={{ fontSize: 40, color: 'secondary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Analytics Charts */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Campaign Progress
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={campaignData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="raised" fill="#4CAF50" name="Raised" />
                  <Bar dataKey="goal" fill="#E0E0E0" name="Goal" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Donation Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={donationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {donationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Campaigns Section */}
        <Paper sx={{ mb: 3 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Donation Campaigns</Typography>
          </Box>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
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
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {filteredCampaigns.map(campaign => (
                <Grid item xs={12} md={6} key={campaign.id}>
                  <Card sx={{ height: '100%' }}>
                    {campaign.image_url && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={campaign.image_url}
                        alt={campaign.title}
                      />
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {campaign.title}
                        </Typography>
                        <Chip
                          label={campaign.status}
                          size="small"
                          color={getStatusColor(campaign.status)}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {campaign.description.substring(0, 100)}...
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">
                            Raised: ₹{campaign.raised_amount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            Goal: ₹{campaign.goal_amount.toLocaleString()}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressPercentage(campaign)}
                          sx={{ height: 8, borderRadius: 5 }}
                          color={getProgressPercentage(campaign) >= 100 ? 'success' : 'primary'}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                          {getProgressPercentage(campaign).toFixed(1)}% of goal • {campaign.donor_count} donors
                        </Typography>
                      </Box>
                      
                      <Chip label={campaign.category} size="small" variant="outlined" />
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => handleOpenCampaignDialog(campaign)}>
                        Edit
                      </Button>
                      <Button size="small" color="primary">
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>

        {/* Recent Donations Table */}
        <Paper sx={{ height: 600 }}>
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Recent Donations</Typography>
          </Box>
          <DataGrid
            rows={filteredDonations}
            columns={donationColumns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            loading={loading}
          />
        </Paper>

        {/* Campaign Dialog */}
        <Dialog open={openCampaignDialog} onClose={() => setOpenCampaignDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedCampaign ? 'Edit Campaign' : 'Create New Campaign'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Campaign Title"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  multiline
                  rows={4}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={campaignForm.category}
                    onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}
                    label="Category"
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Goal Amount (₹)"
                  type="number"
                  value={campaignForm.goal_amount}
                  onChange={(e) => setCampaignForm({ ...campaignForm, goal_amount: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={campaignForm.start_date}
                  onChange={(date) => setCampaignForm({ ...campaignForm, start_date: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={campaignForm.end_date}
                  onChange={(date) => setCampaignForm({ ...campaignForm, end_date: date })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Featured Image URL"
                  value={campaignForm.image_url}
                  onChange={(e) => setCampaignForm({ ...campaignForm, image_url: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={campaignForm.status}
                    onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="paused">Paused</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCampaignDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCampaign} variant="contained" startIcon={<SaveIcon />}>
              {selectedCampaign ? 'Update' : 'Create'} Campaign
            </Button>
          </DialogActions>
        </Dialog>

        {/* Donation Dialog */}
        <Dialog open={openDonationDialog} onClose={() => setOpenDonationDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedDonation ? 'Edit Donation' : 'Add New Donation'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Campaign</InputLabel>
                  <Select
                    value={donationForm.campaign_id}
                    onChange={(e) => setDonationForm({ ...donationForm, campaign_id: e.target.value })}
                    label="Campaign"
                  >
                    {campaigns.map(campaign => (
                      <MenuItem key={campaign.id} value={campaign.id}>
                        {campaign.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Donor Name"
                  value={donationForm.donor_name}
                  onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount (₹)"
                  type="number"
                  value={donationForm.amount}
                  onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={donationForm.donor_email}
                  onChange={(e) => setDonationForm({ ...donationForm, donor_email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={donationForm.donor_phone}
                  onChange={(e) => setDonationForm({ ...donationForm, donor_phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={donationForm.payment_method}
                    onChange={(e) => setDonationForm({ ...donationForm, payment_method: e.target.value })}
                    label="Payment Method"
                  >
                    {paymentMethods.map(method => (
                      <MenuItem key={method} value={method}>{method}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Transaction ID"
                  value={donationForm.transaction_id}
                  onChange={(e) => setDonationForm({ ...donationForm, transaction_id: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message"
                  value={donationForm.message}
                  onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={donationForm.is_anonymous}
                      onChange={(e) => setDonationForm({ ...donationForm, is_anonymous: e.target.checked })}
                    />
                  }
                  label="Anonymous Donation"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={donationForm.status}
                    onChange={(e) => setDonationForm({ ...donationForm, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDonationDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveDonation} variant="contained" startIcon={<SaveIcon />}>
              {selectedDonation ? 'Update' : 'Add'} Donation
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default DonationManager;