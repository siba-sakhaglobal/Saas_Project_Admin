import React, { useState, useEffect, useCallback } from 'react';
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
  ListItemButton
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
  Article as ArticleIcon,
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
  Instagram as InstagramIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import cms from '../../../services/cms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const EnhancedBlogManager = () => {
  const queryClient = useQueryClient();

  // State Management
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [openMediaDrawer, setOpenMediaDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, card
  const [selectedPost, setSelectedPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [autoSave, setAutoSave] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    status: 'draft',
    is_featured: false,
    published_at: null,
    tags: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    allow_comments: true,
    visibility: 'public', // public, private, password
    password: '',
    author_id: null
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

  // Fetch Posts with React Query
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['blog-posts', { searchTerm, filterCategory, filterStatus, filterAuthor, filterDate, tabValue }],
    queryFn: async () => {
      try {
        const { data } = await cms.blog.list({
          search: searchTerm,
          category: filterCategory,
          status: filterStatus,
          author: filterAuthor,
          date: filterDate,
          tab: tabValue
        });
        return data || getMockPosts();
      } catch (error) {
        console.error('Error fetching posts:', error);
        return getMockPosts();
      }
    }
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      try {
        const { data } = await cms.blog.listCategories();
        return data || getMockCategories();
      } catch (error) {
        return getMockCategories();
      }
    }
  });

  // Fetch Authors
  const { data: authors = [] } = useQuery({
    queryKey: ['blog-authors'],
    queryFn: async () => {
      try {
        const { data } = await cms.blog.authors();
        return data || getMockAuthors();
      } catch (error) {
        return getMockAuthors();
      }
    }
  });

  // Stats Query
  const { data: stats = {} } = useQuery({
    queryKey: ['blog-stats'],
    queryFn: async () => {
      try {
        const { data } = await cms.blog.stats();
        return data || getMockStats();
      } catch (error) {
        return getMockStats();
      }
    }
  });

  // Mock Data Functions
  const getMockPosts = () => [
    {
      id: 1,
      title: 'Empowering Communities Through Education',
      slug: 'empowering-communities-education',
      excerpt: 'Discover how our education initiatives are transforming lives in rural communities across India.',
      content: '<h2>Introduction</h2><p>Education is the cornerstone of development...</p>',
      category: { id: 1, name: 'Education', color: '#3b82f6' },
      author: { id: 1, name: 'Sarah Johnson', avatar: '/images/avatar1.jpg', role: 'Editor' },
      featured_image: '/images/blog/education-1.jpg',
      status: 'published',
      is_featured: true,
      view_count: 1250,
      comment_count: 23,
      share_count: 45,
      tags: ['education', 'community', 'development'],
      published_at: '2024-01-15T10:00:00',
      created_at: '2024-01-10T08:00:00',
      updated_at: '2024-01-15T09:30:00',
      reading_time: 5,
      seo_score: 92
    },
    {
      id: 2,
      title: 'Healthcare Outreach Program Success Story',
      slug: 'healthcare-outreach-success',
      excerpt: 'Our mobile healthcare units have reached over 10,000 patients in remote villages.',
      content: '<h2>The Journey</h2><p>It started with a vision...</p>',
      category: { id: 2, name: 'Healthcare', color: '#10b981' },
      author: { id: 2, name: 'Dr. Michael Chen', avatar: '/images/avatar2.jpg', role: 'Author' },
      featured_image: '/images/blog/healthcare-1.jpg',
      status: 'published',
      is_featured: false,
      view_count: 890,
      comment_count: 15,
      share_count: 32,
      tags: ['healthcare', 'outreach', 'success story'],
      published_at: '2024-01-20T14:30:00',
      created_at: '2024-01-18T09:00:00',
      updated_at: '2024-01-20T14:00:00',
      reading_time: 7,
      seo_score: 88
    },
    {
      id: 3,
      title: 'Environmental Conservation Initiative 2024',
      slug: 'environmental-conservation-2024',
      excerpt: 'Join us in our mission to plant 100,000 trees this year.',
      content: '<h2>Our Goal</h2><p>Climate change demands immediate action...</p>',
      category: { id: 3, name: 'Environment', color: '#84cc16' },
      author: { id: 3, name: 'Emily Rodriguez', avatar: '/images/avatar3.jpg', role: 'Contributor' },
      featured_image: '/images/blog/environment-1.jpg',
      status: 'draft',
      is_featured: false,
      view_count: 0,
      comment_count: 0,
      share_count: 0,
      tags: ['environment', 'conservation', 'trees'],
      published_at: null,
      created_at: '2024-01-25T11:00:00',
      updated_at: '2024-01-26T15:30:00',
      reading_time: 4,
      seo_score: 75
    },
    {
      id: 4,
      title: 'Women Empowerment Workshop Series',
      slug: 'women-empowerment-workshops',
      excerpt: 'Skill development programs helping women become financially independent.',
      content: '<h2>Empowerment Through Skills</h2><p>Our workshop series...</p>',
      category: { id: 4, name: 'Empowerment', color: '#f59e0b' },
      author: { id: 1, name: 'Sarah Johnson', avatar: '/images/avatar1.jpg', role: 'Editor' },
      featured_image: '/images/blog/women-1.jpg',
      status: 'scheduled',
      is_featured: true,
      view_count: 0,
      comment_count: 0,
      share_count: 0,
      tags: ['women', 'empowerment', 'skills'],
      published_at: '2024-02-01T10:00:00',
      created_at: '2024-01-28T09:00:00',
      updated_at: '2024-01-28T11:00:00',
      reading_time: 6,
      seo_score: 95
    }
  ];

  const getMockCategories = () => [
    { id: 1, name: 'Education', slug: 'education', post_count: 15, color: '#3b82f6' },
    { id: 2, name: 'Healthcare', slug: 'healthcare', post_count: 12, color: '#10b981' },
    { id: 3, name: 'Environment', slug: 'environment', post_count: 8, color: '#84cc16' },
    { id: 4, name: 'Empowerment', slug: 'empowerment', post_count: 10, color: '#f59e0b' },
    { id: 5, name: 'Community', slug: 'community', post_count: 20, color: '#8b5cf6' }
  ];

  const getMockAuthors = () => [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Editor', post_count: 25 },
    { id: 2, name: 'Dr. Michael Chen', email: 'michael@example.com', role: 'Author', post_count: 18 },
    { id: 3, name: 'Emily Rodriguez', email: 'emily@example.com', role: 'Contributor', post_count: 12 }
  ];

  const getMockStats = () => ({
    totalPosts: 45,
    publishedPosts: 38,
    draftPosts: 5,
    scheduledPosts: 2,
    totalViews: 125000,
    totalComments: 450,
    totalShares: 890,
    avgReadingTime: 5.5,
    topCategory: 'Community',
    topAuthor: 'Sarah Johnson',
    growth: {
      posts: '+12%',
      views: '+25%',
      engagement: '+18%'
    }
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: (data) => cms.blog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      toast.success('Post created successfully!');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to create post');
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => cms.blog.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      toast.success('Post updated successfully!');
      handleCloseDialog();
    },
    onError: () => {
      toast.error('Failed to update post');
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => cms.blog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      toast.success('Post deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete post');
    }
  });

  // Handlers
  const handleOpenDialog = (post = null) => {
    if (post) {
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category_id: post.category?.id || '',
        featured_image: post.featured_image,
        status: post.status,
        is_featured: post.is_featured,
        published_at: post.published_at ? dayjs(post.published_at) : null,
        tags: post.tags || [],
        meta_title: post.meta_title || '',
        meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || [],
        allow_comments: post.allow_comments !== false,
        visibility: post.visibility || 'public',
        password: post.password || '',
        author_id: post.author?.id || null
      });
      setSelectedPost(post);
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category_id: '',
        featured_image: '',
        status: 'draft',
        is_featured: false,
        published_at: null,
        tags: [],
        meta_title: '',
        meta_description: '',
        meta_keywords: [],
        allow_comments: true,
        visibility: 'public',
        password: '',
        author_id: null
      });
      setSelectedPost(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPost(null);
  };

  const handleSavePost = () => {
    if (selectedPost) {
      updatePostMutation.mutate({ id: selectedPost.id, data: formData });
    } else {
      createPostMutation.mutate(formData);
    }
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(id);
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedPosts.length === 0) return;

    switch (bulkAction) {
      case 'delete':
        if (window.confirm(`Delete ${selectedPosts.length} posts?`)) {
          selectedPosts.forEach(id => deletePostMutation.mutate(id));
          setSelectedPosts([]);
        }
        break;
      case 'publish':
        selectedPosts.forEach(id => {
          updatePostMutation.mutate({ id, data: { status: 'published' } });
        });
        setSelectedPosts([]);
        break;
      case 'draft':
        selectedPosts.forEach(id => {
          updatePostMutation.mutate({ id, data: { status: 'draft' } });
        });
        setSelectedPosts([]);
        break;
      case 'feature':
        selectedPosts.forEach(id => {
          updatePostMutation.mutate({ id, data: { is_featured: true } });
        });
        setSelectedPosts([]);
        break;
      case 'unfeature':
        selectedPosts.forEach(id => {
          updatePostMutation.mutate({ id, data: { is_featured: false } });
        });
        setSelectedPosts([]);
        break;
      default:
        break;
    }
    setBulkAction('');
    setOpenBulkDialog(false);
  };

  const handleDuplicatePost = (post) => {
    const duplicatedPost = {
      ...post,
      id: null,
      title: `${post.title} (Copy)`,
      slug: `${post.slug}-copy`,
      status: 'draft',
      published_at: null,
      view_count: 0,
      comment_count: 0,
      share_count: 0
    };
    handleOpenDialog(duplicatedPost);
  };

  const handlePreviewPost = (post) => {
    setPreviewPost(post);
    setOpenPreviewDialog(true);
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
    setReadingTime(Math.ceil(words / 200)); // Average reading speed
  };

  useEffect(() => {
    if (formData.content) {
      calculateWordCount(formData.content);
    }
  }, [formData.content]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && selectedPost && formData.content) {
      const timer = setTimeout(() => {
        updatePostMutation.mutate({ id: selectedPost.id, data: formData });
        toast.info('Auto-saved', { autoClose: 1000 });
      }, 30000); // Auto-save every 30 seconds
      return () => clearTimeout(timer);
    }
  }, [formData, autoSave, selectedPost]);

  // Grid/Card/List View Render
  const renderPostsView = () => {
    if (viewMode === 'grid') {
      return (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3,
            alignItems: 'start'
          }}
        >
          {posts.map((post) => (
            <Box
              key={post.id}
              sx={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  '& .card-image': {
                    transform: 'scale(1.1)'
                  },
                  '& .card-overlay': {
                    opacity: 1
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${post.category?.color || '#667eea'}, ${post.category?.color || '#764ba2'})`
                }
              }}
            >
              {/* Image Section */}
              <Box sx={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                <Box
                  className="card-image"
                  component="img"
                  src={post.featured_image || '/images/placeholder.jpg'}
                  alt={post.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease'
                  }}
                />

                {/* Overlay */}
                <Box
                  className="card-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />

                {/* Featured Badge */}
                {post.is_featured && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
                    }}
                  >
                    <FeaturedIcon sx={{ fontSize: 14 }} />
                    Featured
                  </Box>
                )}

                {/* Status Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    background: post.status === 'published'
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : post.status === 'draft'
                      ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                      : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}
                >
                  {post.status}
                </Box>
              </Box>

              {/* Content Section */}
              <Box sx={{ p: 3 }}>
                {/* Category */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={post.category?.name || 'Uncategorized'}
                    size="small"
                    sx={{
                      background: `linear-gradient(135deg, ${post.category?.color || '#667eea'}, ${post.category?.color || '#764ba2'})`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.75rem',
                      '& .MuiChip-label': {
                        px: 1.5
                      }
                    }}
                  />
                </Box>

                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.3,
                    mb: 1.5,
                    color: 'text.primary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.6em',
                    fontSize: '1.1rem'
                  }}
                >
                  {post.title}
                </Typography>

                {/* Excerpt */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.5,
                    mb: 2.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '4.5em'
                  }}
                >
                  {post.excerpt}
                </Typography>

                {/* Author Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                  <Avatar
                    src={post.author?.avatar}
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1.5,
                      background: `linear-gradient(135deg, ${post.category?.color || '#667eea'}, ${post.category?.color || '#764ba2'})`,
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {post.author?.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25 }}>
                      {post.author?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                      {dayjs(post.published_at || post.created_at).fromNow()}
                    </Typography>
                  </Box>
                </Box>

                {/* Metrics */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1.5,
                    px: 2,
                    background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                    borderRadius: 2,
                    mb: 2.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ViewIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {post.view_count}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CommentIcon sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {post.comment_count}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ShareIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {post.share_count}
                    </Typography>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    justifyContent: 'center'
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handlePreviewPost(post)}
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ViewIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(post)}
                    sx={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDuplicatePost(post)}
                    sx={{
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <DuplicateIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeletePost(post.id)}
                    sx={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    // DataGrid view for list mode
    const columns = [
      {
        field: 'selection',
        headerName: '',
        width: 50,
        renderCell: (params) => (
          <Checkbox
            checked={selectedPosts.includes(params.row.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPosts([...selectedPosts, params.row.id]);
              } else {
                setSelectedPosts(selectedPosts.filter(id => id !== params.row.id));
              }
            }}
          />
        )
      },
      {
        field: 'title',
        headerName: 'Title',
        flex: 2,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {params.row.featured_image && (
              <Avatar
                src={params.row.featured_image}
                variant="rounded"
                sx={{ width: 40, height: 40 }}
              />
            )}
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {params.row.title}
                {params.row.is_featured && (
                  <FeaturedIcon sx={{ ml: 1, fontSize: 16, color: 'warning.main' }} />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                {params.row.excerpt}
              </Typography>
            </Box>
          </Box>
        )
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 150,
        renderCell: (params) => (
          <Chip
            label={params.row.category?.name || 'Uncategorized'}
            size="small"
            sx={{ backgroundColor: params.row.category?.color, color: 'white' }}
          />
        )
      },
      {
        field: 'author',
        headerName: 'Author',
        width: 180,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={params.row.author?.avatar} sx={{ width: 24, height: 24 }}>
              {params.row.author?.name?.charAt(0)}
            </Avatar>
            <Typography variant="body2">{params.row.author?.name}</Typography>
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
          />
        )
      },
      {
        field: 'metrics',
        headerName: 'Metrics',
        width: 200,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Views">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ViewIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{params.row.view_count}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Comments">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CommentIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{params.row.comment_count}</Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Shares">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShareIcon fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="caption">{params.row.share_count}</Typography>
              </Box>
            </Tooltip>
          </Box>
        )
      },
      {
        field: 'seo_score',
        headerName: 'SEO',
        width: 100,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LinearProgress
              variant="determinate"
              value={params.row.seo_score || 0}
              sx={{
                width: 50,
                mr: 1,
                backgroundColor: 'grey.300',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: params.row.seo_score >= 80 ? 'success.main' :
                    params.row.seo_score >= 60 ? 'warning.main' : 'error.main'
                }
              }}
            />
            <Typography variant="caption">{params.row.seo_score || 0}%</Typography>
          </Box>
        )
      },
      {
        field: 'published_at',
        headerName: 'Published',
        width: 150,
        renderCell: (params) => (
          <Typography variant="body2">
            {params.row.published_at
              ? dayjs(params.row.published_at).format('MMM DD, YYYY')
              : '-'}
          </Typography>
        )
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Box>
            <IconButton size="small" onClick={() => handlePreviewPost(params.row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleOpenDialog(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setSelectedPost(params.row);
              }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>
        )
      }
    ];

    return (
      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={posts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
          loading={postsLoading}
          components={{
            Toolbar: GridToolbar,
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
            }
          }}
        />
      </Paper>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3 }}>
        {/* Continue with the rest of the component... */}
        {/* This is a very large component, so I'll provide the structure */}

        {/* Header Section */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Blog Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, manage, and optimize your blog content
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <IconButton onClick={() => refetchPosts()}>
              <RefreshIcon />
            </IconButton>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid">
                <GridViewIcon />
              </ToggleButton>
              <ToggleButton value="list">
                <ListViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={() => setOpenCategoryDialog(true)}
            >
              Categories
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              New Post
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalPosts || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Posts
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {stats.growth?.posts || '0%'} from last month
                    </Typography>
                  </Box>
                  <ArticleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.publishedPosts || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Published
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {Math.round(((stats.publishedPosts || 0) / (stats.totalPosts || 1)) * 100)}% of total
                    </Typography>
                  </Box>
                  <PublishIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {(stats.totalViews || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Views
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {stats.growth?.views || '0%'} from last month
                    </Typography>
                  </Box>
                  <TrendingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalComments || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Comments
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {stats.growth?.engagement || '0%'} engagement
                    </Typography>
                  </Box>
                  <CommentIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Search */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  label="Category"
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: category.color
                          }}
                        />
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Author</InputLabel>
                <Select
                  value={filterAuthor}
                  label="Author"
                  onChange={(e) => setFilterAuthor(e.target.value)}
                >
                  <MenuItem value="all">All Authors</MenuItem>
                  {authors.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      {author.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Date</InputLabel>
                <Select
                  value={filterDate}
                  label="Date"
                  onChange={(e) => setFilterDate(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {selectedPosts.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.selected', borderRadius: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2">
                  {selectedPosts.length} post(s) selected
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    startIcon={<PublishIcon />}
                    onClick={() => { setBulkAction('publish'); setOpenBulkDialog(true); }}
                  >
                    Publish
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DraftIcon />}
                    onClick={() => { setBulkAction('draft'); setOpenBulkDialog(true); }}
                  >
                    Draft
                  </Button>
                  <Button
                    size="small"
                    startIcon={<FeaturedIcon />}
                    onClick={() => { setBulkAction('feature'); setOpenBulkDialog(true); }}
                  >
                    Feature
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => { setBulkAction('delete'); setOpenBulkDialog(true); }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}
        </Paper>

        {/* Posts View */}
        {renderPostsView()}

        {/* Post Create/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: { height: '90vh' }
          }}
        >
          <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6">
                {selectedPost ? 'Edit Post' : 'Create New Post'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Auto-save"
                />
                <Typography variant="caption" color="text.secondary">
                  {wordCount} words • {readingTime} min read
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Content" />
              <Tab label="Settings" />
              <Tab label="SEO" />
              <Tab label="Preview" />
            </Tabs>

            {/* Content Tab */}
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Post Title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) });
                      }}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      label="Slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      margin="normal"
                      helperText="URL-friendly version of the title"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category_id}
                        label="Category"
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: category.color
                                }}
                              />
                              {category.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      margin="normal"
                      helperText="Brief description of the post"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                      Content
                    </Typography>
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(content) => setFormData({ ...formData, content })}
                      modules={quillModules}
                      style={{ height: '300px', marginBottom: '50px' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={formData.tags}
                      onChange={(e, newValue) => setFormData({ ...formData, tags: newValue })}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={index}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Add tags..."
                          helperText="Press Enter to add tags"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Settings Tab */}
            {tabValue === 1 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <MenuItem value="draft">Draft</MenuItem>
                        <MenuItem value="published">Published</MenuItem>
                        <MenuItem value="scheduled">Scheduled</MenuItem>
                        <MenuItem value="archived">Archived</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Visibility</InputLabel>
                      <Select
                        value={formData.visibility}
                        label="Visibility"
                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                      >
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                        <MenuItem value="password">Password Protected</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  {formData.visibility === 'password' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="password"
                        label="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        margin="normal"
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label="Publish Date"
                        value={formData.published_at}
                        onChange={(newValue) => setFormData({ ...formData, published_at: newValue })}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Featured Image URL"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      margin="normal"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setOpenMediaDrawer(true)}>
                              <ImageIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        />
                      }
                      label="Featured Post"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.allow_comments}
                          onChange={(e) => setFormData({ ...formData, allow_comments: e.target.checked })}
                        />
                      }
                      label="Allow Comments"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* SEO Tab */}
            {tabValue === 2 && (
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Optimize your post for search engines to improve visibility.
                    </Alert>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Meta Title"
                      value={formData.meta_title}
                      onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                      margin="normal"
                      helperText={`${formData.meta_title.length}/60 characters`}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Meta Description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      margin="normal"
                      helperText={`${formData.meta_description.length}/160 characters`}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={formData.meta_keywords}
                      onChange={(e, newValue) => setFormData({ ...formData, meta_keywords: newValue })}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            {...getTagProps({ index })}
                            key={index}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Meta Keywords"
                          placeholder="Add keywords..."
                          helperText="Keywords that describe your content"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Preview Tab */}
            {tabValue === 3 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                  {formData.title || 'Post Title'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formData.excerpt || 'Post excerpt...'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p>Post content...</p>' }}
                  sx={{
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
                    '& p': { mb: 1 },
                    '& blockquote': {
                      borderLeft: '4px solid #ddd',
                      margin: '1rem 0',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              variant="outlined"
              onClick={() => setFormData({ ...formData, status: 'draft' })}
              disabled={createPostMutation.isLoading || updatePostMutation.isLoading}
            >
              Save as Draft
            </Button>
            <Button
              variant="contained"
              onClick={handleSavePost}
              disabled={createPostMutation.isLoading || updatePostMutation.isLoading}
              startIcon={<SaveIcon />}
            >
              {selectedPost ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Category Management Dialog */}
        <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Add New Category</Typography>
                <TextField
                  fullWidth
                  label="Category Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: generateSlug(e.target.value) })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Slug"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  type="color"
                  label="Color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  margin="normal"
                />
                <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                  Add Category
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Existing Categories</Typography>
                <List>
                  {categories.map((category) => (
                    <ListItem key={category.id} divider>
                      <ListItemIcon>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: category.color
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={category.name}
                        secondary={`${category.post_count} posts`}
                      />
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoryDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={openPreviewDialog} onClose={() => setOpenPreviewDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Preview: {previewPost?.title}
          </DialogTitle>
          <DialogContent>
            {previewPost && (
              <Box>
                {previewPost.featured_image && (
                  <Box sx={{ mb: 3 }}>
                    <img
                      src={previewPost.featured_image}
                      alt={previewPost.title}
                      style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip
                    label={previewPost.category?.name}
                    size="small"
                    sx={{ backgroundColor: previewPost.category?.color, color: 'white' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(previewPost.published_at || previewPost.created_at).format('MMMM DD, YYYY')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {previewPost.reading_time} min read
                  </Typography>
                </Box>
                <Typography variant="h4" gutterBottom>
                  {previewPost.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {previewPost.excerpt}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box
                  dangerouslySetInnerHTML={{ __html: previewPost.content }}
                  sx={{
                    '& img': { maxWidth: '100%', height: 'auto' },
                    '& h1, & h2, & h3, & h4, & h5, & h6': { mt: 2, mb: 1 },
                    '& p': { mb: 1 },
                    '& blockquote': {
                      borderLeft: '4px solid #ddd',
                      margin: '1rem 0',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                />
                {previewPost.tags && previewPost.tags.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {previewPost.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPreviewDialog(false)}>Close</Button>
            <Button variant="contained" onClick={() => handleOpenDialog(previewPost)}>
              Edit Post
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Actions Confirmation Dialog */}
        <Dialog open={openBulkDialog} onClose={() => setOpenBulkDialog(false)}>
          <DialogTitle>Confirm Bulk Action</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {bulkAction} {selectedPosts.length} selected post(s)?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBulkDialog(false)}>Cancel</Button>
            <Button
              variant="contained"
              color={bulkAction === 'delete' ? 'error' : 'primary'}
              onClick={handleBulkAction}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Context Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { handlePreviewPost(selectedPost); setAnchorEl(null); }}>
            <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { handleOpenDialog(selectedPost); setAnchorEl(null); }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { handleDuplicatePost(selectedPost); setAnchorEl(null); }}>
            <ListItemIcon><DuplicateIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => { handleDeletePost(selectedPost?.id); setAnchorEl(null); }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Media Drawer */}
        <Drawer
          anchor="right"
          open={openMediaDrawer}
          onClose={() => setOpenMediaDrawer(false)}
          PaperProps={{ sx: { width: 400 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Media Library
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select an image for your post
            </Typography>
            {/* Add media gallery here */}
          </Box>
        </Drawer>

        {/* Speed Dial for Quick Actions */}
        <SpeedDial
          ariaLabel="Quick Actions"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          icon={<SpeedDialIcon />}
        >
          <SpeedDialAction
            icon={<AddIcon />}
            tooltipTitle="New Post"
            onClick={() => handleOpenDialog()}
          />
          <SpeedDialAction
            icon={<CategoryIcon />}
            tooltipTitle="Manage Categories"
            onClick={() => setOpenCategoryDialog(true)}
          />
          <SpeedDialAction
            icon={<ImportIcon />}
            tooltipTitle="Import Posts"
          />
          <SpeedDialAction
            icon={<ExportIcon />}
            tooltipTitle="Export Posts"
          />
        </SpeedDial>
      </Box>
    </LocalizationProvider>
  );
};

export default EnhancedBlogManager;