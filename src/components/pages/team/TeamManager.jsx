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
  Avatar,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Switch,
  FormControlLabel,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Badge,
  Tabs,
  Tab,
  Container,
  Fab,
  CardMedia,
  Skeleton,
  Fade
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  FilterList as FilterIcon,
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import cms from '../../../services/cms';
import ImageUpload from '../../common/ImageUpload';

const TeamManager = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    leadership: 0,
    management: 0,
    programStaff: 0,
    advisors: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    category: 'Management',
    bio: '',
    about: '',
    email: '',
    phone: '',
    avatarUrl: '',
    avatar_url: '',
    sortOrder: 0,
    sort_order: 0,
    socialLinks: {
      linkedin: ''
    },
    social_links: {
      linkedin: ''
    },
    active: true
  });

  const categories = [
    { value: 'Leadership', label: 'Leadership', color: 'primary' },
    { value: 'Management', label: 'Management', color: 'secondary' },
    { value: 'Program Staff', label: 'Program Staff', color: 'success' },
    { value: 'Advisors', label: 'Advisors', color: 'info' }
  ];

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await cms.team.list({ page: 1, limit: 100 });
      const data = response.data || response;
      setTeamMembers(Array.isArray(data) ? data : data?.members || []);
      calculateStats(Array.isArray(data) ? data : data?.members || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      showSnackbar('Failed to fetch team members', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (members) => {
    const stats = {
      totalMembers: members.length,
      leadership: members.filter(m => m.category === 'Leadership').length,
      management: members.filter(m => m.category === 'Management').length,
      programStaff: members.filter(m => m.category === 'Program Staff').length,
      advisors: members.filter(m => m.category === 'Advisors').length
    };
    setStats(stats);
  };

  const handleOpenDialog = (member = null) => {
    if (member) {
      setFormData({
        name: member.name || '',
        designation: member.designation || '',
        category: member.category || 'Management',
        bio: member.bio || '',
        about: member.about || '',
        email: member.email || '',
        phone: member.phone || '',
        avatarUrl: member.avatar_url || member.avatarUrl || '',
        avatar_url: member.avatar_url || member.avatarUrl || '',
        sortOrder: member.sort_order || member.sortOrder || 0,
        sort_order: member.sort_order || member.sortOrder || 0,
        socialLinks: member.social_links || { linkedin: '' },
        social_links: member.social_links || { linkedin: '' },
        active: member.active !== undefined ? member.active : true
      });
      setSelectedMember(member);
    } else {
      setFormData({
        name: '',
        designation: '',
        category: 'Management',
        bio: '',
        about: '',
        email: '',
        phone: '',
        avatarUrl: '',
        avatar_url: '',
        sortOrder: 0,
        sort_order: 0,
        socialLinks: { linkedin: '' },
        social_links: { linkedin: '' },
        active: true
      });
      setSelectedMember(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMember(null);
  };

  const handleSaveMember = async () => {
    try {
      if (selectedMember) {
        await cms.team.update(selectedMember.id, formData);
        showSnackbar('Team member updated successfully', 'success');
      } else {
        await cms.team.create(formData);
        showSnackbar('Team member added successfully', 'success');
      }
      handleCloseDialog();
      fetchTeamMembers();
    } catch (error) {
      console.error('Error saving team member:', error);
      showSnackbar('Failed to save team member', 'error');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await cms.team.delete(id);
        showSnackbar('Team member removed successfully', 'success');
        fetchTeamMembers();
      } catch (error) {
        console.error('Error deleting team member:', error);
        showSnackbar('Failed to remove team member', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getCategoryInfo = (category) => {
    return categories.find(cat => cat.value === category) || { label: category, color: 'default' };
  };

  const getSocialIcon = (platform) => {
    switch (platform) {
      case 'linkedin': return <LinkedInIcon />;
      case 'twitter': return <TwitterIcon />;
      case 'facebook': return <FacebookIcon />;
      case 'instagram': return <InstagramIcon />;
      default: return null;
    }
  };

  // Helper function to get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Advisors': return '#f59e0b';
      case 'Leadership': return '#8b5cf6';
      case 'Program Staff': return '#22c55e';
      case 'Management': return '#06b6d4';
      default: return '#667eea';
    }
  };

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || member.category === filterCategory;
    const matchesTab = tabValue === 0 ||
                       (tabValue === 1 && member.category === 'Leadership') ||
                       (tabValue === 2 && member.category === 'Management') ||
                       (tabValue === 3 && member.category === 'Program Staff') ||
                       (tabValue === 4 && member.category === 'Advisors');
    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <Container maxWidth="xl">
        {/* Header with Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>Team Management</Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>Manage your team members, designations, and settings</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('designations')}
              sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569' }}
            >
              Manage Designations
            </Button>
<Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('new')}
              sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#1D4ED8' } }}
            >
              Add Member
            </Button>
          </Box>
        </Box>

        {/* Enhanced Tabs */}
        <Paper sx={{ mb: 4, borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                color: '#475569',
                '&.Mui-selected': {
                  color: '#2563EB'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563EB'
              }
            }}
          >
            <Tab label={`All Members (${stats.totalMembers})`} />
            <Tab label={`Leadership (${stats.leadership})`} />
            <Tab label={`Management (${stats.management})`} />
            <Tab label={`Program Staff (${stats.programStaff})`} />
            <Tab label={`Advisors (${stats.advisors})`} />
          </Tabs>
        </Paper>


        {/* Team Members Grid with Responsive Layout */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
            xl: 'repeat(4, 1fr)'
          },
          gap: 3,
          mb: 4
        }}>
          {loading ? (
            Array.from(new Array(6)).map((_, index) => (
              <Card key={index} sx={{ height: 400 }}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} width="60%" sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" height={60} sx={{ mt: 2 }} />
                </Box>
              </Card>
            ))
          ) : (
            filteredMembers.map(member => {
              const categoryInfo = getCategoryInfo(member.category);
              return (
                <Fade in={true} timeout={500} key={member.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      },
                      borderRadius: 1.5,
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    {/* Enhanced Header with Flat Background */}
                    <Box
                      sx={{
                        backgroundColor: '#F8FAFC',
                        position: 'relative',
                        textAlign: 'center',
                        pt: 4,
                        pb: 2
                      }}
                    >
                      <Badge
                        badgeContent={<VerifiedIcon sx={{ fontSize: 16 }} />}
                        color="primary"
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      >
                        <Avatar
                          src={member.avatar_url || member.avatar}
                          sx={{
                            width: 90,
                            height: 90,
                            mx: 'auto',
                            mb: 2,
                            border: '4px solid white',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                          }}
                        >
                          {member.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Avatar>
                      </Badge>
                      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                        <Chip
                          label={categoryInfo.label}
                          size="small"
                          sx={{
                            backgroundColor: member.category === 'Advisors' ? '#FEF3C7' : member.category === 'Leadership' ? '#EDE9FE' : member.category === 'Program Staff' ? '#ECFDF5' : '#CFFAFE',
                            color: member.category === 'Advisors' ? '#92400E' : member.category === 'Leadership' ? '#5B21B6' : member.category === 'Program Staff' ? '#047857' : '#0369A1',
                            fontWeight: 600,
                            borderRadius: 1
                          }}
                        />
                      </Box>
                    </Box>

                    <CardContent sx={{ textAlign: 'center', flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1.1rem', color: '#1E293B' }}>
                        {member.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#2563EB',
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        {member.designation}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#475569',
                          mb: 3,
                          minHeight: 60,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {member.bio}
                      </Typography>

                      {/* Enhanced Contact Info */}
                      <Stack spacing={1.5} sx={{ mb: 3 }}>
                        {member.email && (
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            backgroundColor: '#F1F5F9',
                            borderRadius: 1,
                            p: 1
                          }}>
                            <EmailIcon fontSize="small" sx={{ color: '#2563EB' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                              {member.email.length > 20 ? `${member.email.substring(0, 20)}...` : member.email}
                            </Typography>
                          </Box>
                        )}
                        {member.phone && (
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            backgroundColor: '#F1F5F9',
                            borderRadius: 1,
                            p: 1
                          }}>
                            <PhoneIcon fontSize="small" sx={{ color: '#2563EB' }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                              {member.phone}
                            </Typography>
                          </Box>
                        )}
                      </Stack>

                      {/* Enhanced Social Links */}
                      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                        {(member.social_links || member.socialLinks) && Object.entries(member.social_links || member.socialLinks || {}).map(([platform, url]) =>
                          url && (
                            <Tooltip key={platform} title={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                              <IconButton
                                size="small"
                                href={url}
                                target="_blank"
                                sx={{
                                  backgroundColor: '#F1F5F9',
                                  color: '#2563EB',
                                  '&:hover': {
                                    backgroundColor: '#2563EB',
                                    color: 'white'
                                  }
                                }}
                              >
                                {getSocialIcon(platform)}
                              </IconButton>
                            </Tooltip>
                          )
                        )}
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`edit/${member.id}`)}
                        sx={{
                          backgroundColor: '#2563EB',
                          borderRadius: 1,
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: '#1D4ED8'
                          }
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteMember(member.id)}
                        sx={{ borderRadius: 1, fontWeight: 600 }}
                      >
                        Remove
                      </Button>
                    </CardActions>
                  </Card>
                </Fade>
              );
            })
          )}
        </Box>

        {/* Enhanced Empty State */}
        {filteredMembers.length === 0 && !loading && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 1.5, boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <PeopleIcon sx={{ fontSize: 80, color: '#94A3B8', mb: 3 }} />
            <Typography variant="h5" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
              No team members found
            </Typography>
            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4, maxWidth: 400, mx: 'auto' }}>
              {searchTerm || filterCategory !== 'all'
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'Build your team by adding your first team member and start showcasing your organization\'s talent.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate('new')}
              sx={{
                borderRadius: 1,
                px: 4,
                py: 1.5,
                backgroundColor: '#2563EB',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: '#1D4ED8'
                }
              }}
            >
              Add Team Member
            </Button>
          </Paper>
        )}
      </Container>

      {/* Team Member Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMember ? 'Edit Team Member' : 'Add New Team Member'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value), sort_order: parseInt(e.target.value) })}
                helperText="Display order in the team section"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                multiline
                rows={2}
                helperText="Brief biography and role description"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="About"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                multiline
                rows={3}
                helperText="Detailed background information"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Profile Picture
              </Typography>
              <ImageUpload
                value={formData.avatarUrl || formData.avatar_url}
                onChange={(imageUrl, mediaId) => setFormData({ ...formData, avatarUrl: imageUrl, avatar_url: imageUrl })}
                folder="team"
                variant="card"
                width={300}
                height={200}
                label="Upload Profile Picture"
                altText={formData.name}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Social Media Links
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={(formData.socialLinks?.linkedin || formData.social_links?.linkedin || '')}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                      social_links: { ...formData.social_links, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/in/your-profile"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkedInIcon />
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                }
                label="Active Member (Display on website)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
            Cancel
          </Button>
          <Button onClick={handleSaveMember} variant="contained" startIcon={<SaveIcon />}>
            {selectedMember ? 'Update' : 'Add'} Member
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
  );
};

export default TeamManager;