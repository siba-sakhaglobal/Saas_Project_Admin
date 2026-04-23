import React, { useState, useEffect, useCallback } from 'react';
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
  Fab,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Stack,
  Divider,
  Menu,
  ListItemIcon,
  ListItemText,
  Checkbox,
  LinearProgress,
  Skeleton,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Breadcrumbs,
  Link,
  AppBar,
  Toolbar,
  Container,
  Fade,
  Slide,
  Zoom,
  Pagination
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  CloudUpload as UploadIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Publish as PublishIcon,
  Drafts as DraftIcon,
  Category as CategoryIcon,
  Event as EventIcon,
  TrendingUp as TrendingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  MoreVert as MoreIcon,
  ContentCopy as DuplicateIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Label as TagIcon,
  LocalOffer as LabelIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AttachFile as AttachIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatQuote as QuoteIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  ViewAgenda as CardViewIcon,
  Refresh as RefreshIcon,
  Download as ExportIcon,
  Upload as ImportIcon,
  Star as FeaturedIcon,
  StarBorder as UnfeaturedIcon,
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime as ClockIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as AIIcon,
  Translate as TranslateIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Palette as PaletteIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  EventSeat as SeatsIcon,
  QrCode as TicketIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import cms from '../../../services/cms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const EventsManager = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State Management
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openMediaDrawer, setOpenMediaDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [autoSave, setAutoSave] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category_id: '',
    image_url: '',
    status: 'draft',
    is_featured: false,
    event_date: null,
    event_time: '',
    end_date: null,
    end_time: '',
    location: '',
    venue: '',
    address: '',
    latitude: '',
    longitude: '',
    max_participants: '',
    registration_fee: 0,
    registration_required: true,
    registration_deadline: null,
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    tags: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    visibility: 'public',
    password: '',
    organizer_id: null,
    event_type: 'workshop'
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    parent_id: null,
    color: '#667eea'
  });

  // Rich Text Editor Configuration
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }, { 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video', 'formula'],
        ['clean']
      ],
      handlers: {
        image: () => setOpenMediaDrawer(true)
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  // Mock Data Functions
  const getMockEvents = () => [
    {
      id: 1,
      title: 'Annual Charity Fundraiser Gala',
      slug: 'annual-charity-fundraiser-gala',
      description: 'Join us for an elegant evening of giving back to the community through our annual charity gala.',
      content: '<h2>Event Overview</h2><p>Our Annual Charity Fundraiser Gala is the highlight of our fundraising calendar.</p>',
      category: { id: 1, name: 'Fundraising', color: '#3b82f6' },
      organizer: { id: 1, name: 'Sarah Johnson', avatar: '/images/avatar1.jpg', role: 'Event Coordinator' },
      image_url: '/images/events/gala-1.jpg',
      status: 'published',
      is_featured: true,
      event_date: '2024-03-15',
      event_time: '18:00',
      end_date: '2024-03-15',
      end_time: '22:00',
      location: 'Grand Hotel Ballroom',
      venue: 'Grand Hotel',
      address: '123 Main Street, Downtown',
      max_participants: 200,
      registered_count: 145,
      registration_fee: 100,
      registration_required: true,
      registration_deadline: '2024-03-10',
      contact_person: 'Sarah Johnson',
      contact_email: 'sarah@example.com',
      contact_phone: '+1-555-0123',
      tags: ['fundraising', 'gala', 'charity'],
      event_type: 'fundraiser',
      created_at: '2024-01-10T08:00:00',
      updated_at: '2024-01-15T09:30:00'
    },
    {
      id: 2,
      title: 'Community Health Workshop',
      slug: 'community-health-workshop',
      description: 'Learn about preventive healthcare and wellness practices in this interactive workshop.',
      content: '<h2>Workshop Details</h2><p>This comprehensive health workshop covers essential topics.</p>',
      category: { id: 2, name: 'Healthcare', color: '#10b981' },
      organizer: { id: 2, name: 'Dr. Michael Chen', avatar: '/images/avatar2.jpg', role: 'Medical Director' },
      image_url: '/images/events/health-workshop.jpg',
      status: 'published',
      is_featured: false,
      event_date: '2024-02-20',
      event_time: '10:00',
      end_date: '2024-02-20',
      end_time: '16:00',
      location: 'Community Center',
      venue: 'Main Hall',
      address: '456 Community Drive',
      max_participants: 50,
      registered_count: 35,
      registration_fee: 0,
      registration_required: true,
      registration_deadline: '2024-02-15',
      contact_person: 'Dr. Michael Chen',
      contact_email: 'michael@example.com',
      contact_phone: '+1-555-0124',
      tags: ['health', 'workshop', 'community'],
      event_type: 'workshop',
      created_at: '2024-01-18T09:00:00',
      updated_at: '2024-01-20T14:00:00'
    },
    {
      id: 3,
      title: 'Environmental Clean-up Drive',
      slug: 'environmental-cleanup-drive',
      description: 'Join hands with fellow volunteers to clean up our local parks and waterways.',
      content: '<h2>Make a Difference</h2><p>Participate in our monthly environmental clean-up drive.</p>',
      category: { id: 3, name: 'Environment', color: '#84cc16' },
      organizer: { id: 3, name: 'Emily Rodriguez', avatar: '/images/avatar3.jpg', role: 'Environmental Coordinator' },
      image_url: '/images/events/cleanup-drive.jpg',
      status: 'scheduled',
      is_featured: true,
      event_date: '2024-04-22',
      event_time: '08:00',
      end_date: '2024-04-22',
      end_time: '12:00',
      location: 'Riverside Park',
      venue: 'Main Entrance',
      address: '789 Park Avenue',
      max_participants: 100,
      registered_count: 0,
      registration_fee: 0,
      registration_required: true,
      registration_deadline: '2024-04-20',
      contact_person: 'Emily Rodriguez',
      contact_email: 'emily@example.com',
      contact_phone: '+1-555-0125',
      tags: ['environment', 'cleanup', 'volunteer'],
      event_type: 'volunteer',
      created_at: '2024-01-25T11:00:00',
      updated_at: '2024-01-26T15:30:00'
    }
  ];

  const getMockCategories = () => [
    { id: 1, name: 'Fundraising', slug: 'fundraising', event_count: 8, color: '#3b82f6', description: 'Fundraising events and galas' },
    { id: 2, name: 'Healthcare', slug: 'healthcare', event_count: 6, color: '#10b981', description: 'Health and medical events' },
    { id: 3, name: 'Environment', slug: 'environment', event_count: 4, color: '#84cc16', description: 'Environmental activities' },
    { id: 4, name: 'Education', slug: 'education', event_count: 10, color: '#f59e0b', description: 'Educational workshops and seminars' },
    { id: 5, name: 'Community', slug: 'community', event_count: 12, color: '#8b5cf6', description: 'Community development events' }
  ];

  const getMockOrganizers = () => [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Event Coordinator', event_count: 15, avatar: '/images/avatar1.jpg' },
    { id: 2, name: 'Dr. Michael Chen', email: 'michael@example.com', role: 'Medical Director', event_count: 8, avatar: '/images/avatar2.jpg' },
    { id: 3, name: 'Emily Rodriguez', email: 'emily@example.com', role: 'Environmental Coordinator', event_count: 6, avatar: '/images/avatar3.jpg' }
  ];

  const getMockStats = () => ({
    totalEvents: 32,
    upcomingEvents: 15,
    pastEvents: 17,
    draftEvents: 5,
    totalRegistrations: 450,
    totalRevenue: 25000,
    avgAttendance: 75,
    topCategory: 'Community',
    topOrganizer: 'Sarah Johnson',
    growth: {
      events: '+12%',
      registrations: '+28%',
      revenue: '+15%'
    },
    recentActivity: [
      { type: 'registration', title: '5 new registrations', time: '2 hours ago' },
      { type: 'event', title: 'New event published', time: '4 hours ago' },
      { type: 'revenue', title: '$500 in registrations', time: '6 hours ago' }
    ]
  });

  // Fetch Events with Mock Data
  const { data: events = [], isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['events', { searchTerm, filterCategory, filterStatus, filterType, filterDate, tabValue }],
    queryFn: async () => {
      try {
        const { data } = await cms.events.list();
        return data.events || data || [];
      } catch (error) {
        console.error('Error fetching events:', error);
        return getMockEvents();
      }
    }
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['event-categories'],
    queryFn: async () => {
      try {
        const { data } = await cms.events.listCategories();
        return data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        return getMockCategories();
      }
    }
  });

  // Fetch Organizers
  const { data: organizers = [] } = useQuery({
    queryKey: ['event-organizers'],
    queryFn: async () => {
      try {
        // Note: SDK doesn't have getEventOrganizers, using mock data
        return getMockOrganizers();
      } catch (error) {
        console.error('Error fetching organizers:', error);
        return getMockOrganizers();
      }
    }
  });

  // Stats Query
  const { data: stats = {} } = useQuery({
    queryKey: ['event-stats'],
    queryFn: async () => {
      try {
        const { data } = await cms.events.stats();
        return data;
      } catch (error) {
        console.error('Error fetching stats:', error);
        return getMockStats();
      }
    }
  });

  // Mutations
  const createEventMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await cms.events.create(data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event created successfully!');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Create event error:', error);
      toast.error('Failed to create event');
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const response = await cms.events.update(id, data);
        return response;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event updated successfully!');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Update event error:', error);
      toast.error('Failed to update event');
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id) => {
      const response = await cms.events.delete(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete event error:', error);
      toast.error('Failed to delete event');
    }
  });

  // Handlers
  const handleEditEvent = (event = null) => {
    if (event) {
      navigate(`edit/${event.id}`);
    } else {
      navigate('new');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = () => {
    if (selectedEvent) {
      updateEventMutation.mutate({ id: selectedEvent.id, data: formData });
    } else {
      createEventMutation.mutate(formData);
    }
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id);
    }
  };

  const handleDuplicateEvent = (event) => {
    const duplicatedEvent = {
      ...event,
      id: null,
      title: `${event.title} (Copy)`,
      slug: `${event.slug}-copy`,
      status: 'draft',
      event_date: null,
      registration_deadline: null,
      registered_count: 0
    };

    sessionStorage.setItem('duplicatedEvent', JSON.stringify(duplicatedEvent));
    navigate('new');
  };

  const handlePreviewEvent = (event) => {
    navigate(`edit/${event.id}`);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const calculateWordCount = (content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200));
  };

  useEffect(() => {
    if (formData.content) {
      calculateWordCount(formData.content);
    }
  }, [formData.content]);

  // Filter and sort events based on search and filters, with pagination
  const allFilteredEvents = (events || [])
    .filter(event => {
      const matchesSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (event.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || event.category === categories.find(cat => cat.id === filterCategory)?.name || event.category?.name === categories.find(cat => cat.id === filterCategory)?.name;
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      const matchesType = filterType === 'all' || event.event_type === filterType;

      let matchesDate = true;
      if (filterDate !== 'all') {
        const eventDate = dayjs(event.event_date);
        const now = dayjs();
        switch (filterDate) {
          case 'today':
            matchesDate = eventDate.isSame(now, 'day');
            break;
          case 'week':
            matchesDate = eventDate.isAfter(now) && eventDate.isBefore(now.add(7, 'day'));
            break;
          case 'month':
            matchesDate = eventDate.isAfter(now) && eventDate.isBefore(now.add(1, 'month'));
            break;
          case 'upcoming':
            matchesDate = eventDate.isAfter(now);
            break;
          case 'past':
            matchesDate = eventDate.isBefore(now);
            break;
        }
      }

      // Apply tab filters
      const eventDate = dayjs(event.event_date);
      if (tabValue === 1) return eventDate.isAfter(dayjs()) && matchesSearch && matchesCategory && matchesType;
      if (tabValue === 2) return eventDate.isBefore(dayjs()) && matchesSearch && matchesCategory && matchesType;
      if (tabValue === 3) return event.is_featured && matchesSearch && matchesCategory && matchesType;
      if (tabValue === 4) return event.status === 'draft' && matchesSearch && matchesCategory && matchesType;

      return matchesSearch && matchesCategory && matchesStatus && matchesType && matchesDate;
    })
    // Sort by latest first (created_at or id descending)
    .sort((a, b) => {
      const dateA = dayjs(a.created_at || a.event_date);
      const dateB = dayjs(b.created_at || b.event_date);
      return dateB.valueOf() - dateA.valueOf();
    });

  // Calculate pagination
  const totalEvents = allFilteredEvents.length;
  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredEvents = allFilteredEvents.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterType, filterDate, tabValue]);

  // Grid View Render
  const renderGridView = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2,
        alignItems: 'stretch'
      }}
    >
      {eventsLoading ? (
        Array.from(new Array(8)).map((_, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: 'white',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
          >
            <Skeleton variant="rectangular" height={200} />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" height={32} width="60%" />
              <Skeleton variant="text" height={24} width="100%" />
              <Skeleton variant="text" height={20} width="80%" />
              <Skeleton variant="text" height={16} width="60%" />
            </Box>
          </Box>
        ))
      ) : (
        filteredEvents.map((event, index) => (
          <Fade in timeout={300 + index * 100} key={event.id}>
            <Box
              onClick={() => handleEditEvent(event)}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: 1.5,
                border: '1px solid #E2E8F0',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: 410,
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  '& .event-image': {
                    transform: 'scale(1.05)'
                  }
                }
              }}
            >
              {/* Image Section */}
              <Box sx={{ position: 'relative', overflow: 'hidden', height: 180, flexShrink: 0 }}>
                <Box
                  className="event-image"
                  component="img"
                  src={event.image_url || '/images/placeholder.jpg'}
                  alt={event.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease'
                  }}
                />

                {/* Category Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: '#2563EB',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  {event.category?.name || 'Uncategorized'}
                </Box>

                {/* Featured Badge */}
                {event.is_featured && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: '#F59E0B',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <FeaturedIcon sx={{ fontSize: 14 }} />
                    Featured
                  </Box>
                )}
              </Box>

              {/* Content Section */}
              <Box sx={{ px: 2, pt: 2, pb: 1.5, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: '700',
                    lineHeight: 1.2,
                    mb: 1,
                    color: 'text.primary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.4em',
                    fontSize: '0.95rem'
                  }}
                >
                  {event.title}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.4,
                    mb: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.8em',
                    fontSize: '0.85rem'
                  }}
                >
                  {event.description}
                </Typography>

                {/* Event Details */}
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                    <CalendarIcon sx={{ fontSize: 14, color: '#2563EB', mr: 0.75 }} />
                    <Typography variant="caption" sx={{ fontWeight: '500', color: 'text.primary', fontSize: '0.8rem' }}>
                      {dayjs(event.event_date).format('MMM DD')} at {event.event_time}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
                    <LocationIcon sx={{ fontSize: 14, color: '#10B981', mr: 0.75 }} />
                    <Typography variant="caption" sx={{ fontWeight: '500', color: 'text.primary', fontSize: '0.8rem' }}>
                      {event.location || 'TBD'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SeatsIcon sx={{ fontSize: 14, color: '#F59E0B', mr: 0.75 }} />
                    <Typography variant="caption" sx={{ fontWeight: '500', color: 'text.primary', fontSize: '0.8rem' }}>
                      {event.registered_count || 0}/{event.max_participants || 'Unlimited'}
                    </Typography>
                  </Box>
                </Box>

                {/* Registration Fee */}
                {event.registration_fee > 0 && (
                  <Box
                    sx={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #E2E8F0',
                      borderRadius: 2,
                      p: 1,
                      mb: 1.5,
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: '700', color: '#2563EB' }}>
                      ${event.registration_fee}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      Fee
                    </Typography>
                  </Box>
                )}

                {/* Tags */}
                <Box sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {(event.tags || []).slice(0, 2).map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          borderColor: '#E2E8F0'
                        }}
                      />
                    ))}
                    {(event.tags || []).length > 2 && (
                      <Chip
                        label={`+${(event.tags || []).length - 2}`}
                        size="small"
                        sx={{
                          fontSize: '0.7rem',
                          height: 20,
                          backgroundColor: '#F3F4F6',
                          color: 'text.secondary'
                        }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'flex-end',
                    position: 'relative',
                    top: '-20px',
                    flexShrink: 0,
                  }}
                >
                  <Tooltip title="Preview">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handlePreviewEvent(event); }}
                      sx={{ backgroundColor: '#2563EB', color: 'white', padding: '6px', '&:hover': { backgroundColor: '#1D4ED8' } }}
                    >
                      <ViewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                      sx={{ backgroundColor: '#10B981', color: 'white', padding: '6px', '&:hover': { backgroundColor: '#059669' } }}
                    >
                      <EditIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Duplicate">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleDuplicateEvent(event); }}
                      sx={{ backgroundColor: '#7C3AED', color: 'white', padding: '6px', '&:hover': { backgroundColor: '#6D28D9' } }}
                    >
                      <DuplicateIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                      sx={{ backgroundColor: '#DC2626', color: 'white', padding: '6px', '&:hover': { backgroundColor: '#B91C1C' } }}
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Fade>
        ))
      )}
    </Box>
  );

  // List View Render with DataGrid
  const renderListView = () => {
    const columns = [
      {
        field: 'selection',
        headerName: '',
        width: 50,
        renderCell: (params) => (
          <Checkbox
            checked={selectedEvents.includes(params.row.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedEvents([...selectedEvents, params.row.id]);
              } else {
                setSelectedEvents(selectedEvents.filter(id => id !== params.row.id));
              }
            }}
          />
        )
      },
      {
        field: 'title',
        headerName: 'Event Title',
        flex: 2.5,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1, width: '100%' }}>
            <Avatar
              src={params.row.image_url}
              variant="rounded"
              sx={{ width: 48, height: 48, flexShrink: 0 }}
            >
              <EventIcon />
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight="600" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                wordBreak: 'break-word'
              }}>
                {params.row.title}
                {params.row.is_featured && (
                  <FeaturedIcon sx={{ ml: 1, fontSize: 16, color: 'warning.main' }} />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {params.row.description}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                {(Array.isArray(params.row.tags) ? params.row.tags : []).slice(0, 3).map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.65rem', height: 18 }}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        )
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 140,
        renderCell: (params) => (
          <Chip
            label={params.row.category?.name || 'Uncategorized'}
            size="small"
            sx={{
              backgroundColor: params.row.category?.color,
              color: 'white',
              fontWeight: 600
            }}
          />
        )
      },
      {
        field: 'event_date',
        headerName: 'Event Date',
        width: 130,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2">
              {dayjs(params.row.event_date).format('MMM DD, YYYY')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.event_time}
            </Typography>
          </Box>
        )
      },
      {
        field: 'location',
        headerName: 'Location',
        width: 160,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2" fontWeight="500">
              {params.row.location || 'TBD'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.venue}
            </Typography>
          </Box>
        )
      },
      {
        field: 'registrations',
        headerName: 'Registrations',
        width: 120,
        renderCell: (params) => (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" fontWeight="600">
              {params.row.registered_count || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / {params.row.max_participants || '∞'}
            </Typography>
          </Box>
        )
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => (
          <Chip
            label={params.row.status}
            size="small"
            color={
              params.row.status === 'published' ? 'success' :
              params.row.status === 'draft' ? 'default' :
              params.row.status === 'scheduled' ? 'warning' : 'error'
            }
            icon={
              params.row.status === 'published' ? <PublishIcon /> :
              params.row.status === 'draft' ? <DraftIcon /> :
              params.row.status === 'scheduled' ? <ScheduleIcon /> : null
            }
          />
        )
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 140,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Preview">
              <IconButton size="small" onClick={() => handlePreviewEvent(params.row)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEditEvent(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton
                size="small"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setSelectedEvent(params.row);
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ];

    return (
      <Paper sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={filteredEvents}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50, 100]}
          disableSelectionOnClick
          loading={eventsLoading}
          rowHeight={120}
          getRowHeight={() => 120}
          components={{
            Toolbar: GridToolbar,
          }}
          componentsProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start'
            },
            '& .MuiDataGrid-row': {
              minHeight: '120px !important',
              maxHeight: '120px !important',
              '&:hover': {
                backgroundColor: '#F8FAFC'
              }
            },
            '& .MuiDataGrid-virtualScrollerRenderZone': {
              gap: '2px',
            },
            '& .MuiDataGrid-toolbarContainer': {
              padding: 2,
              backgroundColor: 'background.paper'
            }
          }}
        />
      </Paper>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Stats Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 2,
              mb: 3
            }}
          >
            <Paper
              sx={{
                p: 3,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
                <EventIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.875rem' }}>Total Events</Typography>
                <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1.75rem' }}>{stats.total || 0}</Typography>
              </Box>
            </Paper>

            <Paper
              sx={{
                p: 3,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: '#F0FDF4', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
                <ScheduleIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.875rem' }}>Upcoming</Typography>
                <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1.75rem' }}>{stats.upcoming || 0}</Typography>
              </Box>
            </Paper>

            <Paper
              sx={{
                p: 3,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: '#FFFBEB', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
                <PeopleIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.875rem' }}>Registrations</Typography>
                <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1.75rem' }}>{stats.registrations || 0}</Typography>
              </Box>
            </Paper>

            <Paper
              sx={{
                p: 3,
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50 }}>
                <TrendingIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.875rem' }}>Revenue</Typography>
                <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '1.75rem' }}>${((0) / 1000).toFixed(0)}K</Typography>
              </Box>
            </Paper>
          </Box>

          {/* View Mode & Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={() => refetchEvents()}
                  sx={{ border: '1px solid #E2E8F0' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
                sx={{
                  border: '1px solid #E2E8F0',
                  '& .MuiToggleButton-root': {
                    border: 'none',
                    color: 'text.primary',
                    '&.Mui-selected': {
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB'
                    }
                  }
                }}
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ListViewIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={() => setOpenCategoryDialog(true)}
                sx={{ border: '1px solid #E2E8F0' }}
              >
                Categories
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate('categories')}
                sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#E2E8F0', color: '#475569' }}
              >
                Manage Categories
              </Button>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleEditEvent()}
                sx={{
                  backgroundColor: '#2563EB',
                  '&:hover': {
                    backgroundColor: '#1D4ED8'
                  }
                }}
              >
                New Event
              </Button>
            </Stack>
          </Box>

          {/* Tabs */}
          <Paper sx={{ mb: 3, borderRadius: 1.5, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: '600',
                  fontSize: '0.875rem',
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
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1, fontSize: 18 }} />
                    All Events
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1, fontSize: 18 }} />
                    Upcoming
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 18 }} />
                    Past Events
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FeaturedIcon sx={{ mr: 1, fontSize: 18 }} />
                    Featured
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DraftIcon sx={{ mr: 1, fontSize: 18 }} />
                    Drafts
                  </Box>
                }
              />
            </Tabs>
          </Paper>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 1.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="600">
                Filters & Search
              </Typography>
              <Button
                size="small"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                endIcon={showAdvancedFilters ? <ViewIcon /> : <ViewIcon />}
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
              </Button>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search events, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
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
                      <MenuItem key={cat.id} value={cat.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              backgroundColor: cat.color,
                              borderRadius: '50%',
                              mr: 1
                            }}
                          />
                          {cat.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    <MenuItem value="published">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PublishIcon sx={{ mr: 1, color: 'success.main' }} />
                        Published
                      </Box>
                    </MenuItem>
                    <MenuItem value="draft">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DraftIcon sx={{ mr: 1, color: 'grey.500' }} />
                        Draft
                      </Box>
                    </MenuItem>
                    <MenuItem value="scheduled">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                        Scheduled
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {showAdvancedFilters && (
                <>
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        label="Event Type"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="workshop">Workshop</MenuItem>
                        <MenuItem value="fundraiser">Fundraiser</MenuItem>
                        <MenuItem value="volunteer">Volunteer</MenuItem>
                        <MenuItem value="conference">Conference</MenuItem>
                        <MenuItem value="community">Community</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Date Range</InputLabel>
                      <Select
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        label="Date Range"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="upcoming">Upcoming</MenuItem>
                        <MenuItem value="past">Past Events</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="week">This Week</MenuItem>
                        <MenuItem value="month">This Month</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={showAdvancedFilters ? 12 : 2}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FilterIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                      setFilterStatus('all');
                      setFilterType('all');
                      setFilterDate('all');
                    }}
                    sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}
                  >
                    Clear
                  </Button>
                  {selectedEvents.length > 0 && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => setOpenBulkDialog(true)}
                      sx={{ borderRadius: 2, backgroundColor: '#2563EB' }}
                    >
                      Bulk ({selectedEvents.length})
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Events View */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                {totalEvents} Event{totalEvents !== 1 ? 's' : ''}
                {totalEvents > itemsPerPage && (
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({Math.min(startIndex + 1, totalEvents)}-{Math.min(endIndex, totalEvents)} of {totalEvents})
                  </Typography>
                )}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  size="small"
                  sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ImportIcon />}
                  size="small"
                  sx={{ borderRadius: 2, border: '1px solid #E2E8F0' }}
                >
                  Import
                </Button>
              </Stack>
            </Box>

            {viewMode === 'grid' ? renderGridView() : renderListView()}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      fontWeight: 500,
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          {/* No Events State */}
          {totalEvents === 0 && !eventsLoading && (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 1.5, border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <EventIcon sx={{ fontSize: 80, color: '#D1D5DB', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by creating your first event'
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleEditEvent()}
                sx={{ borderRadius: 2, backgroundColor: '#2563EB' }}
              >
                Create Your First Event
              </Button>
            </Paper>
          )}
        </Container>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            handlePreviewEvent(selectedEvent);
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleEditEvent(selectedEvent);
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleDuplicateEvent(selectedEvent);
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              <DuplicateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            if (selectedEvent) {
              updateEventMutation.mutate({
                id: selectedEvent.id,
                data: { is_featured: !selectedEvent.is_featured }
              });
            }
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              {selectedEvent?.is_featured ? <UnfeaturedIcon fontSize="small" /> : <FeaturedIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {selectedEvent?.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedEvent) {
              const newStatus = selectedEvent.status === 'published' ? 'draft' : 'published';
              updateEventMutation.mutate({
                id: selectedEvent.id,
                data: { status: newStatus }
              });
            }
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              {selectedEvent?.status === 'published' ? <DraftIcon fontSize="small" /> : <PublishIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {selectedEvent?.status === 'published' ? 'Move to Draft' : 'Publish'}
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              if (selectedEvent) {
                handleDeleteEvent(selectedEvent.id);
              }
              setAnchorEl(null);
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Speed Dial for Quick Actions */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="New Event"
            onClick={() => handleEditEvent()}
          />
          <SpeedDialAction
            icon={<CategoryIcon />}
            tooltipTitle="Manage Categories"
            onClick={() => setOpenCategoryDialog(true)}
          />
          <SpeedDialAction
            icon={<ImportIcon />}
            tooltipTitle="Import Events"
          />
          <SpeedDialAction
            icon={<ExportIcon />}
            tooltipTitle="Export Events"
          />
          <SpeedDialAction
            icon={<AnalyticsIcon />}
            tooltipTitle="Analytics"
          />
        </SpeedDial>

        {/* Preview Dialog */}
        <Dialog
          open={openPreviewDialog}
          onClose={() => setOpenPreviewDialog(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '90vh', maxHeight: '90vh' }
          }}
        >
          <DialogTitle>
            Preview: {previewEvent?.title}
          </DialogTitle>
          <DialogContent sx={{ overflow: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
            {previewEvent && (
              <Box>
                <Typography variant="h4" gutterBottom>
                  {previewEvent.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {previewEvent.description}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={previewEvent.category?.name}
                    sx={{
                      backgroundColor: previewEvent.category?.color,
                      color: 'white',
                      mr: 1
                    }}
                  />
                  <Chip
                    label={previewEvent.event_type}
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  {previewEvent.is_featured && (
                    <Chip
                      label="Featured"
                      color="warning"
                      icon={<FeaturedIcon />}
                    />
                  )}
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body1">
                        {dayjs(previewEvent.event_date).format('MMMM DD, YYYY')} at {previewEvent.event_time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="body1">
                        {previewEvent.location}, {previewEvent.venue}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SeatsIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="body1">
                        {previewEvent.registered_count || 0} / {previewEvent.max_participants || 'Unlimited'} registered
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    {previewEvent.registration_fee > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" color="primary.main">
                          Registration Fee: ${previewEvent.registration_fee}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Organized by: {previewEvent.organizer?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Contact: {previewEvent.contact_email}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                  {(Array.isArray(previewEvent.tags) ? previewEvent.tags : []).map(tag => (
                    <Chip key={tag} label={tag} variant="outlined" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>

                <Box
                  sx={{
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      fontWeight: 'bold',
                      mb: 2,
                      mt: 3
                    },
                    '& h1': { fontSize: '2rem' },
                    '& h2': { fontSize: '1.75rem' },
                    '& h3': { fontSize: '1.5rem' },
                    '& p': { mb: 2, lineHeight: 1.6 },
                    '& ul, & ol': { mb: 2, pl: 3 },
                    '& li': { mb: 1 },
                    '& blockquote': {
                      borderLeft: '4px solid #ddd',
                      pl: 2,
                      fontStyle: 'italic',
                      mb: 2
                    },
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& a': { color: 'primary.main', textDecoration: 'underline' }
                  }}
                  dangerouslySetInnerHTML={{
                    __html: previewEvent.content || '<p>No content available</p>'
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
            <Button
              onClick={() => {
                setOpenPreviewDialog(false);
                handleEditEvent(previewEvent);
              }}
              variant="contained"
            >
              Edit Event
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default EventsManager;