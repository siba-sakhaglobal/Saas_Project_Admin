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
  Instagram as InstagramIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  AutoAwesome as AutoAwesomeIcon,
  Psychology as AIIcon,
  Translate as TranslateIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import cms from '../../../services/cms';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const BlogManager = () => {
  const navigate = useNavigate();
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
  const [viewMode, setViewMode] = useState('grid');
  const [selectedPost, setSelectedPost] = useState(null);
  const [previewPost, setPreviewPost] = useState(null);
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
  const getMockPosts = () => [
    {
      id: 1,
      title: 'Empowering Communities Through Education',
      slug: 'empowering-communities-education',
      excerpt: 'Discover how our education initiatives are transforming lives in rural communities across India.',
      content: '<h2>Introduction</h2><p>Education is the cornerstone of development and the foundation upon which we build stronger communities. Our comprehensive education initiatives have been transforming lives across rural India, reaching over 15,000 students in the past year alone.</p><h3>Our Impact</h3><p>Through dedicated efforts and community partnerships, we have established 25 learning centers in remote villages where traditional educational infrastructure was lacking. These centers provide not just basic literacy and numeracy skills, but also digital literacy, vocational training, and life skills education.</p><h3>Success Stories</h3><p>Meet Priya, a 14-year-old from a village in Rajasthan, who learned to code through our digital literacy program and now teaches other children in her community. Her story exemplifies the transformative power of education when made accessible to all.</p><p>Our education programs focus on:</p><ul><li>Primary and secondary education support</li><li>Adult literacy programs</li><li>Vocational training initiatives</li><li>Digital skills development</li><li>Teacher training and development</li></ul><h3>Looking Forward</h3><p>As we continue to expand our reach, we remain committed to ensuring that quality education is not a privilege but a right accessible to every child, regardless of their geographical location or economic background.</p>',
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
      content: '<h2>The Journey</h2><p>It started with a vision to bring quality healthcare to the most remote corners of our country. Our mobile healthcare units have now reached over 10,000 patients in villages where the nearest hospital is hours away.</p><h3>Mobile Healthcare Revolution</h3><p>Our fleet of 15 mobile healthcare units travels to remote villages, providing essential medical services including:</p><ul><li>Basic health checkups and consultations</li><li>Vaccination programs for children and adults</li><li>Maternal and child healthcare</li><li>Chronic disease management</li><li>Health education and awareness programs</li></ul><h3>Real Impact Stories</h3><p>In the remote village of Bhangarh, our mobile unit helped deliver a healthy baby when the mother could not reach the district hospital in time. Our trained medical staff provided emergency obstetric care, ensuring both mother and child remained safe.</p><blockquote>Healthcare is not a luxury but a fundamental right that should reach every individual, regardless of their location or economic status.</blockquote><h3>Technology Integration</h3><p>We have integrated telemedicine capabilities in our mobile units, allowing remote consultation with specialist doctors in urban centers. This has revolutionized the way we deliver healthcare in rural areas.</p><p>The program has achieved a 95% patient satisfaction rate and has significantly reduced infant and maternal mortality rates in the regions we serve.</p>',
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
      content: '<h2>Our Goal</h2><p>Climate change demands immediate action, and we are committed to making a significant environmental impact through our tree plantation initiative. This year, we aim to plant 100,000 trees across various regions, creating green corridors and restoring degraded landscapes.</p><h3>Why Trees Matter</h3><p>Trees are essential for maintaining ecological balance. They provide oxygen, absorb carbon dioxide, prevent soil erosion, and create habitats for countless species. Our initiative focuses on:</p><ul><li>Native species plantation for better ecosystem integration</li><li>Fruit-bearing trees for community sustenance</li><li>Fast-growing species for quick environmental impact</li><li>Medicinal plants for traditional healthcare support</li></ul><h3>Community Involvement</h3><p>This initiative involves local communities at every step. We provide saplings and training to village committees, ensuring long-term care and maintenance of planted trees. Our survival rate has improved to 85% through this community-driven approach.</p><blockquote>A society grows great when old men plant trees whose shade they know they shall never sit in.</blockquote><h3>Progress So Far</h3><p>In just six months, we have successfully planted 45,000 trees across 50 villages. Each tree is geo-tagged and monitored through our mobile app, allowing sponsors to track their adopted trees\' growth.</p><p>Join us in this green revolution. Together, we can create a sustainable future for generations to come.</p>',
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
    },
    {
      id: 5,
      title: 'Digital Literacy Program Success',
      slug: 'digital-literacy-program',
      excerpt: 'How we trained 500+ rural youth in computer skills.',
      content: '<h2>Digital Transformation</h2><p>Technology education...</p>',
      category: { id: 1, name: 'Education', color: '#3b82f6' },
      author: { id: 2, name: 'Dr. Michael Chen', avatar: '/images/avatar2.jpg', role: 'Author' },
      featured_image: '/images/blog/digital-1.jpg',
      status: 'published',
      is_featured: false,
      view_count: 567,
      comment_count: 8,
      share_count: 19,
      tags: ['digital', 'literacy', 'youth'],
      published_at: '2024-01-30T09:00:00',
      created_at: '2024-01-25T10:00:00',
      updated_at: '2024-01-30T08:30:00',
      reading_time: 8,
      seo_score: 85
    },
    {
      id: 6,
      title: 'Clean Water Initiative Progress Report',
      slug: 'clean-water-initiative',
      excerpt: 'Bringing safe drinking water to 50 villages across the region.',
      content: '<h2>Water is Life</h2><p>Our clean water project...</p>',
      category: { id: 3, name: 'Environment', color: '#84cc16' },
      author: { id: 3, name: 'Emily Rodriguez', avatar: '/images/avatar3.jpg', role: 'Contributor' },
      featured_image: '/images/blog/water-1.jpg',
      status: 'published',
      is_featured: true,
      view_count: 1890,
      comment_count: 34,
      share_count: 67,
      tags: ['water', 'environment', 'villages'],
      published_at: '2024-02-05T11:00:00',
      created_at: '2024-02-01T09:00:00',
      updated_at: '2024-02-05T10:30:00',
      reading_time: 6,
      seo_score: 91
    }
  ];

  const getMockCategories = () => [
    { id: 1, name: 'Education', slug: 'education', post_count: 15, color: '#3b82f6', description: 'Educational initiatives and programs' },
    { id: 2, name: 'Healthcare', slug: 'healthcare', post_count: 12, color: '#10b981', description: 'Medical and health-related activities' },
    { id: 3, name: 'Environment', slug: 'environment', post_count: 8, color: '#84cc16', description: 'Environmental conservation projects' },
    { id: 4, name: 'Empowerment', slug: 'empowerment', post_count: 10, color: '#f59e0b', description: 'Community empowerment programs' },
    { id: 5, name: 'Community', slug: 'community', post_count: 20, color: '#8b5cf6', description: 'Community development activities' }
  ];

  const getMockAuthors = () => [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Editor', post_count: 25, avatar: '/images/avatar1.jpg' },
    { id: 2, name: 'Dr. Michael Chen', email: 'michael@example.com', role: 'Author', post_count: 18, avatar: '/images/avatar2.jpg' },
    { id: 3, name: 'Emily Rodriguez', email: 'emily@example.com', role: 'Contributor', post_count: 12, avatar: '/images/avatar3.jpg' }
  ];

  const getMockStats = () => ({
    totalPosts: 65,
    publishedPosts: 48,
    draftPosts: 12,
    scheduledPosts: 5,
    totalViews: 185000,
    totalComments: 650,
    totalShares: 1240,
    avgReadingTime: 5.8,
    topCategory: 'Community',
    topAuthor: 'Sarah Johnson',
    growth: {
      posts: '+18%',
      views: '+32%',
      engagement: '+25%'
    },
    recentActivity: [
      { type: 'published', title: 'New post published', time: '2 hours ago' },
      { type: 'comment', title: '5 new comments', time: '4 hours ago' },
      { type: 'view', title: '1.2K views today', time: '6 hours ago' }
    ]
  });

  // Fetch Posts with Mock Data
  const { data: posts = [], isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['blog-posts', { searchTerm, filterCategory, filterStatus, filterAuthor, filterDate, tabValue }],
    queryFn: async () => {
      try {
        // Convert category ID to category name if a category is selected
        let categoryParam = filterCategory;
        if (filterCategory !== 'all') {
          const selectedCategory = (categories || []).find(cat => cat.id === filterCategory || cat.name === filterCategory);
          categoryParam = selectedCategory?.name || filterCategory;
        }

        const { data } = await cms.blog.list({
          search: searchTerm,
          category: categoryParam,
          status: filterStatus,
          author: filterAuthor,
          date: filterDate,
          tab: tabValue,
          limit: 50 // Show more posts by default to avoid pagination issues in admin
        });
        // If the API returns { posts, pagination }, extract posts
        // If it returns an array directly, use as is
        return data.posts || data;
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Fallback to mock data if API fails
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
        return data;
      } catch (error) {
        console.error('Error fetching categories:', error);
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
        return data;
      } catch (error) {
        console.error('Error fetching authors:', error);
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
        return data;
      } catch (error) {
        console.error('Error fetching stats:', error);
        return getMockStats();
      }
    }
  });

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const { data: result } = await cms.blog.create(data);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      toast.success('Post created successfully!');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Create post error:', error);
      toast.error('Failed to create post');
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        const { data: result } = await cms.blog.update(id, data);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      toast.success('Post updated successfully!');
      handleCloseDialog();
    },
    onError: (error) => {
      console.error('Update post error:', error);
      toast.error('Failed to update post');
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id) => {
      try {
        const result = await cms.blog.delete(id);
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['blog-posts']);
      toast.success('Post deleted successfully!');
    },
    onError: (error) => {
      console.error('Delete post error:', error);
      toast.error('Failed to delete post');
    }
  });

  // Handlers
  const handleEditPost = (post = null) => {
    if (post) {
      navigate(`edit/${post.id}`);
    } else {
      navigate('new');
    }
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
    setOpenDialog(false);
    setSelectedPost(null);
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(id);
    }
  };

  const handleDuplicatePost = (post) => {
    // Create a new post with duplicated data
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

    // Store duplicated data in session storage for the editor to pick up
    sessionStorage.setItem('duplicatedPost', JSON.stringify(duplicatedPost));
    navigate('/blog/new');
  };

  const handlePreviewPost = (post) => {
    navigate(`edit/${post.id}`);
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

  // Filter and sort posts based on search and filters, with pagination
  const allFilteredPosts = (posts || [])
    .filter(post => {
      const matchesSearch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (post.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' ||
        (post.category?.name === (categories || []).find(cat => cat.id === filterCategory)?.name) ||
        (post.category_name === filterCategory);
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
      const matchesAuthor = filterAuthor === 'all' || post.author?.id === parseInt(filterAuthor);

      let matchesDate = true;
      if (filterDate !== 'all') {
        const postDate = dayjs(post.published_at || post.created_at);
        const now = dayjs();
        switch (filterDate) {
          case 'today':
            matchesDate = postDate.isSame(now, 'day');
            break;
          case 'week':
            matchesDate = postDate.isAfter(now.subtract(7, 'day'));
            break;
          case 'month':
            matchesDate = postDate.isAfter(now.subtract(1, 'month'));
            break;
        }
      }

      // Apply tab filters
      if (tabValue === 1) return post.status === 'published' && matchesSearch && matchesCategory && matchesAuthor && matchesDate;
      if (tabValue === 2) return post.status === 'draft' && matchesSearch && matchesCategory && matchesAuthor && matchesDate;
      if (tabValue === 3) return post.is_featured && matchesSearch && matchesCategory && matchesAuthor && matchesDate;
      if (tabValue === 4) return post.status === 'scheduled' && matchesSearch && matchesCategory && matchesAuthor && matchesDate;

      return matchesSearch && matchesCategory && matchesStatus && matchesAuthor && matchesDate;
    })
    // Sort by latest first (created_at or published_at descending)
    .sort((a, b) => {
      const dateA = dayjs(a.published_at || a.created_at);
      const dateB = dayjs(b.published_at || b.created_at);
      return dateB.valueOf() - dateA.valueOf();
    });

  // Calculate pagination
  const totalPosts = allFilteredPosts.length;
  const totalPages = Math.ceil(totalPosts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredPosts = allFilteredPosts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, filterAuthor, filterDate, tabValue]);

  // Grid View Render
  const renderGridView = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        },
        gap: 2.5
      }}
    >
      {postsLoading ? (
        Array.from(new Array(8)).map((_, index) => (
          <Box
            key={index}
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: 3,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              border: '1px solid #E2E8F0'
            }}
          >
            <Skeleton variant="rectangular" height={200} />
            <Box sx={{ p: 3 }}>
              <Skeleton variant="text" height={32} width="60%" />
              <Skeleton variant="text" height={24} width="100%" />
              <Skeleton variant="text" height={20} width="80%" />
              <Skeleton variant="text" height={16} width="60%" />
            </Box>
          </Box>
        ))
      ) : (
        filteredPosts.map((post, index) => (
          <Fade in timeout={300 + index * 100} key={post.id}>
            <Box
              onClick={() => handleEditPost(post)}
              sx={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                border: '1px solid #E2E8F0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                height: 600,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  borderColor: '#CBD5E1'
                }
              }}
            >
              {/* Image Section with Overlay */}
              <Box sx={{ position: 'relative', overflow: 'hidden', height: 180, flexShrink: 0 }}>
                <Box
                  className="post-image"
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

                {/* Dark overlay on hover */}
                <Box
                  className="post-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />

                {/* Category Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: post.category?.color || '#2563EB',
                    color: 'white',
                    px: 2,
                    py: 0.75,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}
                >
                  {post.category?.name || 'Uncategorized'}
                </Box>

                {/* Featured Badge */}
                {post.is_featured && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: '#F59E0B',
                      color: 'white',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <FeaturedIcon sx={{ fontSize: 13 }} />
                  </Box>
                )}

                {/* Status Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    backgroundColor: post.status === 'published'
                      ? '#ECFDF5'
                      : post.status === 'draft'
                      ? '#F1F5F9'
                      : '#FFFBEB',
                    color: post.status === 'published'
                      ? '#059669'
                      : post.status === 'draft'
                      ? '#475569'
                      : '#B45309',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    border: '1px solid ' + (post.status === 'published'
                      ? '#D1FAE5'
                      : post.status === 'draft'
                      ? '#E2E8F0'
                      : '#FEE3C3')
                  }}
                >
                  {post.status}
                </Box>
              </Box>

              {/* Content Section */}
              <Box sx={{ p: 2.5, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: '700',
                    lineHeight: 1.3,
                    mb: 1.5,
                    color: '#1E293B',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.6em',
                    fontSize: '1rem'
                  }}
                >
                  {post.title}
                </Typography>

                {/* Excerpt */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    lineHeight: 1.5,
                    mb: 2.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '4.5em',
                    fontSize: '13px'
                  }}
                >
                  {post.excerpt}
                </Typography>

                {/* Author + Edit/Delete Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                  <Avatar
                    src={post.author?.avatar}
                    sx={{
                      width: 36, height: 36, mr: 1.5,
                      backgroundColor: post.category?.color || '#2563EB',
                      fontSize: '0.9rem', fontWeight: 'bold', color: 'white',
                    }}
                  >
                    {post.author?.name?.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: '600', color: '#1E293B', mb: 0.25, fontSize: '13px' }}>
                      {post.author?.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569', fontSize: '12px' }}>
                      {dayjs(post.published_at || post.created_at).fromNow()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Edit">
                      <IconButton size="small"
                        onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}
                        sx={{ color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small"
                        onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                        sx={{ color: '#DC2626', '&:hover': { bgcolor: '#FEF2F2' } }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Metrics Row */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 1, py: 1.5, px: 2,
                    backgroundColor: '#F8FAFC', borderRadius: '8px', mb: 2.5,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ViewIcon sx={{ fontSize: 18, color: 'primary.main', mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {(post.view_count || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CommentIcon sx={{ fontSize: 18, color: 'success.main', mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {post.comment_count || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ShareIcon sx={{ fontSize: 18, color: 'warning.main', mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {post.share_count || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <ClockIcon sx={{ fontSize: 18, color: 'info.main', mb: 0.5 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {post.reading_time || 0}m
                    </Typography>
                  </Box>
                </Box>

                {/* SEO Score */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: '600', color: '#475569', fontSize: '12px' }}>
                      SEO Score
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: '600', color: '#1E293B', fontSize: '12px' }}>
                      {post.seo_score || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={post.seo_score || 0}
                    sx={{
                      height: 6, borderRadius: '3px', backgroundColor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '3px',
                        backgroundColor: (post.seo_score || 0) >= 80 ? '#10B981' : (post.seo_score || 0) >= 60 ? '#F59E0B' : '#DC2626',
                      },
                    }}
                  />
                </Box>

                {/* Tags */}
                <Box>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                    {(post.tags || []).slice(0, 3).map(tag => (
                      <Chip key={tag} label={tag} size="small" variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24, borderColor: post.category?.color || 'grey.300', color: post.category?.color || 'text.secondary' }} />
                    ))}
                    {(post.tags || []).length > 3 && (
                      <Chip label={`+${(post.tags || []).length - 3}`} size="small" variant="filled"
                        sx={{ fontSize: '0.7rem', height: 24, backgroundColor: 'grey.100', color: 'text.secondary' }} />
                    )}
                  </Stack>
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
        flex: 2.5,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1, width: '100%' }}>
            <Avatar
              src={params.row.featured_image}
              variant="rounded"
              sx={{ width: 48, height: 48, flexShrink: 0 }}
            >
              <ArticleIcon />
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
                {params.row.excerpt}
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
        field: 'author',
        headerName: 'Author',
        width: 160,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={params.row.author?.avatar} sx={{ width: 28, height: 28 }}>
              {params.row.author?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="500">
                {params.row.author?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {params.row.author?.role}
              </Typography>
            </Box>
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
        field: 'metrics',
        headerName: 'Metrics',
        width: 180,
        renderCell: (params) => (
          <Grid container spacing={1} sx={{ fontSize: '0.75rem' }}>
            <Grid item xs={4}>
              <Tooltip title="Views">
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <ViewIcon fontSize="small" color="action" />
                  <Typography variant="caption">{params.row.view_count}</Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={4}>
              <Tooltip title="Comments">
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <CommentIcon fontSize="small" color="action" />
                  <Typography variant="caption">{params.row.comment_count}</Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={4}>
              <Tooltip title="Shares">
                <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <ShareIcon fontSize="small" color="action" />
                  <Typography variant="caption">{params.row.share_count}</Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        )
      },
      {
        field: 'seo_score',
        headerName: 'SEO',
        width: 100,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <LinearProgress
              variant="determinate"
              value={params.row.seo_score || 0}
              sx={{
                width: '100%',
                mb: 0.5,
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
        width: 130,
        renderCell: (params) => (
          <Box>
            <Typography variant="body2">
              {params.row.published_at
                ? dayjs(params.row.published_at).format('MMM DD, YYYY')
                : '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.published_at
                ? dayjs(params.row.published_at).format('h:mm A')
                : dayjs(params.row.created_at).fromNow()}
            </Typography>
          </Box>
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
              <IconButton size="small" onClick={() => handlePreviewPost(params.row)}>
                <ViewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => handleEditPost(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="More">
              <IconButton
                size="small"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setSelectedPost(params.row);
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
      <Paper sx={{ height: 700, width: '100%', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
        <DataGrid
          rows={filteredPosts}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50, 100]}
          disableSelectionOnClick
          loading={postsLoading}
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
              borderBottom: '1px solid #E2E8F0',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              color: '#475569'
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#F8FAFC',
              color: '#1E293B',
              fontWeight: '600',
              borderBottom: '1px solid #E2E8F0'
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
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0'
            }
          }}
        />
      </Paper>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Stats Cards Grid */}
          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }
            }}
          >
            <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', pb: 2, pt: 2 }}>
                <Box sx={{ width: 40, height: 40, backgroundColor: '#EFF6FF', borderRadius: '8px', mx: 'auto', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArticleIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                  {stats.total || stats.totalPosts || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '13px' }}>
                  Total Posts
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', pb: 2, pt: 2 }}>
                <Box sx={{ width: 40, height: 40, backgroundColor: '#F0FDF4', borderRadius: '8px', mx: 'auto', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PublishIcon sx={{ color: '#10B981', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                  {stats.published || stats.publishedPosts || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '13px' }}>
                  Published
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', pb: 2, pt: 2 }}>
                <Box sx={{ width: 40, height: 40, backgroundColor: '#EFF6FF', borderRadius: '8px', mx: 'auto', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ViewIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                  {((stats.totalViews || 0) / 1000).toFixed(0)}K
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '13px' }}>
                  Total Views
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center', pb: 2, pt: 2 }}>
                <Box sx={{ width: 40, height: 40, backgroundColor: '#FFFBEB', borderRadius: '8px', mx: 'auto', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B', mb: 0.5 }}>
                  {stats.drafts || stats.growth?.posts || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500, fontSize: '13px' }}>
                  Drafts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Controls Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
            <Tooltip title="Refresh">
              <IconButton
                onClick={() => refetchPosts()}
                sx={{ color: '#6B7280' }}
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
                borderRadius: '8px',
                '& .MuiToggleButton-root': {
                  color: '#475569',
                  border: 'none',
                  fontWeight: '600',
                  '&.Mui-selected': {
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF'
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

            <Button
              variant="outlined"
              startIcon={<CategoryIcon />}
              onClick={() => navigate('categories')}
              sx={{
                color: '#475569',
                borderColor: '#E2E8F0',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                '&:hover': {
                  borderColor: '#CBD5E1',
                  backgroundColor: '#F8FAFC'
                }
              }}
            >
              Manage Categories
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleEditPost()}
              sx={{
                backgroundColor: '#2563EB',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '13px',
                '&:hover': {
                  backgroundColor: '#1D4ED8'
                }
              }}
            >
              New Post
            </Button>
          </Box>

          {/* Enhanced Tabs */}
          <Paper sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Tabs
              value={tabValue}
              onChange={(e, v) => setTabValue(v)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#475569',
                  borderBottom: '2px solid transparent',
                  '&.Mui-selected': {
                    color: '#2563EB',
                    borderBottom: '2px solid #2563EB'
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
                    <ArticleIcon sx={{ mr: 1 }} />
                    All Posts
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PublishIcon sx={{ mr: 1 }} />
                    Published
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DraftIcon sx={{ mr: 1 }} />
                    Drafts
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FeaturedIcon sx={{ mr: 1 }} />
                    Featured
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    Scheduled
                  </Box>
                }
              />
            </Tabs>
          </Paper>

          {/* Enhanced Filters */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#1E293B', fontSize: '15px' }}>
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

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search posts, tags, content..."
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
                    renderValue={(selected) => {
                      if (selected === 'all') return 'All Categories';
                      const cat = categories.find(c => c.id === selected || c.name === selected);
                      return cat ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              backgroundColor: cat.color,
                              borderRadius: '50%',
                              mr: 1
                            }}
                          />
                          {cat.name}
                        </Box>
                      ) : 'All Categories';
                    }}
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
                      <InputLabel>Author</InputLabel>
                      <Select
                        value={filterAuthor}
                        onChange={(e) => setFilterAuthor(e.target.value)}
                        label="Author"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="all">All Authors</MenuItem>
                        {authors.map(author => (
                          <MenuItem key={author.id} value={author.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar src={author.avatar} sx={{ width: 20, height: 20, mr: 1 }}>
                                {author.name.charAt(0)}
                              </Avatar>
                              {author.name} ({author.post_count})
                            </Box>
                          </MenuItem>
                        ))}
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
                    startIcon={<FilterIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                      setFilterStatus('all');
                      setFilterAuthor('all');
                      setFilterDate('all');
                    }}
                    sx={{ borderRadius: '8px', color: '#475569', borderColor: '#E2E8F0', fontWeight: '600' }}
                  >
                    Clear All
                  </Button>
                  {selectedPosts.length > 0 && (
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setOpenBulkDialog(true)}
                      sx={{ borderRadius: '8px', backgroundColor: '#2563EB', fontWeight: '600' }}
                    >
                      Bulk Actions ({selectedPosts.length})
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Paper>

          {/* Posts View */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="700" sx={{ color: '#1E293B', fontSize: '15px' }}>
                {totalPosts} Post{totalPosts !== 1 ? 's' : ''} Found
                {totalPosts > itemsPerPage && (
                  <Typography component="span" variant="body2" sx={{ color: '#475569', ml: 1, fontWeight: '500' }}>
                    (Showing {Math.min(startIndex + 1, totalPosts)}-{Math.min(endIndex, totalPosts)} of {totalPosts})
                  </Typography>
                )}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  size="small"
                  sx={{ borderRadius: '8px', color: '#475569', borderColor: '#E2E8F0', fontWeight: '600' }}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ImportIcon />}
                  size="small"
                  sx={{ borderRadius: '8px', color: '#475569', borderColor: '#E2E8F0', fontWeight: '600' }}
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
                      borderRadius: '8px',
                      fontWeight: '600',
                      color: '#475569',
                      border: '1px solid #E2E8F0',
                      '&.Mui-selected': {
                        backgroundColor: '#2563EB',
                        color: 'white',
                        border: '1px solid #2563EB'
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Box>

          {/* No Posts State */}
          {totalPosts === 0 && !postsLoading && (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <ArticleIcon sx={{ fontSize: 80, color: '#CBD5E1', mb: 2 }} />
              <Typography variant="h5" gutterBottom sx={{ color: '#1E293B', fontWeight: '700' }}>
                No posts found
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', mb: 3 }}>
                {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Get started by creating your first blog post'
                }
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleEditPost()}
                size="large"
                sx={{ borderRadius: '8px', backgroundColor: '#2563EB', fontWeight: '600' }}
              >
                Create Your First Post
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
            handlePreviewPost(selectedPost);
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Preview</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleEditPost(selectedPost);
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleDuplicatePost(selectedPost);
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              <DuplicateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            if (selectedPost) {
              updatePostMutation.mutate({
                id: selectedPost.id,
                data: { is_featured: !selectedPost.is_featured }
              });
            }
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              {selectedPost?.is_featured ? <UnfeaturedIcon fontSize="small" /> : <FeaturedIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {selectedPost?.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            if (selectedPost) {
              const newStatus = selectedPost.status === 'published' ? 'draft' : 'published';
              updatePostMutation.mutate({
                id: selectedPost.id,
                data: { status: newStatus }
              });
            }
            setAnchorEl(null);
          }}>
            <ListItemIcon>
              {selectedPost?.status === 'published' ? <DraftIcon fontSize="small" /> : <PublishIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>
              {selectedPost?.status === 'published' ? 'Move to Draft' : 'Publish'}
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              if (selectedPost) {
                handleDeletePost(selectedPost.id);
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
            tooltipTitle="New Post"
            onClick={() => handleEditPost()}
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
          <SpeedDialAction
            icon={<AnalyticsIcon />}
            tooltipTitle="Analytics"
          />
        </SpeedDial>

        {/* Advanced Blog Editor Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: { height: '95vh', maxHeight: '95vh' }
          }}
        >
          <DialogTitle sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <Typography variant="h5">
              {selectedPost ? 'Edit Blog Post' : 'Create New Blog Post'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setOpenDialog(false)}
                size="small"
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSavePost}
                size="small"
              >
                {selectedPost ? 'Update Post' : 'Publish Post'}
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent sx={{
            overflow: 'auto',
            maxHeight: 'calc(95vh - 140px)',
            p: 3
          }}>
            <Grid container spacing={3}>
              {/* Left Column - Main Content */}
              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Post Content</Typography>

                  {/* Title */}
                  <TextField
                    label="Post Title"
                    fullWidth
                    variant="outlined"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({...formData, title: e.target.value});
                      if (!selectedPost) {
                        setFormData(prev => ({...prev, slug: generateSlug(e.target.value)}));
                      }
                    }}
                    sx={{ mb: 2 }}
                    required
                  />

                  {/* Slug */}
                  <TextField
                    label="URL Slug"
                    fullWidth
                    variant="outlined"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    sx={{ mb: 2 }}
                    helperText="URL-friendly version of the title"
                  />

                  {/* Excerpt */}
                  <TextField
                    label="Excerpt"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    sx={{ mb: 3 }}
                    helperText="Brief summary of the post (used in previews and search)"
                  />

                  {/* WYSIWYG Content Editor */}
                  <Typography variant="subtitle1" gutterBottom>Content</Typography>
                  <Box sx={{ border: '1px solid #ddd', borderRadius: 1, mb: 2 }}>
                    <ReactQuill
                      value={formData.content}
                      onChange={(content) => setFormData({...formData, content})}
                      modules={quillModules}
                      style={{ height: '400px' }}
                      placeholder="Write your blog post content here..."
                    />
                  </Box>

                  {/* Word Count and Reading Time */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, color: 'text.secondary' }}>
                    <Typography variant="caption">
                      Words: {wordCount}
                    </Typography>
                    <Typography variant="caption">
                      Reading time: {readingTime} min
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Right Column - Settings & Meta */}
              <Grid item xs={12} md={4}>
                {/* Publishing Settings */}
                <Paper sx={{ p: 2, mb: 2, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <Typography variant="h6" gutterBottom>Publishing</Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      label="Status"
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <MenuItem value="draft">Draft</MenuItem>
                      <MenuItem value="published">Published</MenuItem>
                      <MenuItem value="scheduled">Scheduled</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Visibility</InputLabel>
                    <Select
                      value={formData.visibility}
                      label="Visibility"
                      onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                    >
                      <MenuItem value="public">Public</MenuItem>
                      <MenuItem value="private">Private</MenuItem>
                      <MenuItem value="password">Password Protected</MenuItem>
                    </Select>
                  </FormControl>

                  {formData.visibility === 'password' && (
                    <TextField
                      label="Password"
                      fullWidth
                      variant="outlined"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      sx={{ mb: 2 }}
                    />
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                      />
                    }
                    label="Featured Post"
                    sx={{ mb: 1 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allow_comments}
                        onChange={(e) => setFormData({...formData, allow_comments: e.target.checked})}
                      />
                    }
                    label="Allow Comments"
                  />
                </Paper>

                {/* Featured Image */}
                <Paper sx={{ p: 2, mb: 2, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <Typography variant="h6" gutterBottom>Featured Image</Typography>
                  <TextField
                    label="Image URL"
                    fullWidth
                    variant="outlined"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                    sx={{ mb: 1 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    onClick={() => setOpenMediaDrawer(true)}
                    size="small"
                    fullWidth
                  >
                    Browse Media Library
                  </Button>
                  {formData.featured_image && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img
                        src={formData.featured_image}
                        alt="Featured"
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px' }}
                      />
                    </Box>
                  )}
                </Paper>

                {/* Categories & Tags */}
                <Paper sx={{ p: 2, mb: 2, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <Typography variant="h6" gutterBottom>Categories & Tags</Typography>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category_id}
                      label="Category"
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formData.tags}
                    onChange={(e, newValue) => setFormData({...formData, tags: newValue})}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder="Add tags..."
                        helperText="Press Enter to add tags"
                      />
                    )}
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
                  />
                </Paper>

                {/* SEO Settings */}
                <Paper sx={{ p: 2, backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <Typography variant="h6" gutterBottom>SEO Settings</Typography>

                  <TextField
                    label="Meta Title"
                    fullWidth
                    variant="outlined"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                    sx={{ mb: 2 }}
                    helperText={`${formData.meta_title?.length || 0}/60 characters`}
                  />

                  <TextField
                    label="Meta Description"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    sx={{ mb: 2 }}
                    helperText={`${formData.meta_description?.length || 0}/160 characters`}
                  />

                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={formData.meta_keywords}
                    onChange={(e, newValue) => setFormData({...formData, meta_keywords: newValue})}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Meta Keywords"
                        placeholder="Add keywords..."
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          key={index}
                          size="small"
                        />
                      ))
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>

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
            Preview: {previewPost?.title}
          </DialogTitle>
          <DialogContent sx={{ overflow: 'auto', maxHeight: 'calc(90vh - 140px)' }}>
            {previewPost && (
              <Box>
                <Typography variant="h4" gutterBottom>
                  {previewPost.title}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {previewPost.excerpt}
                </Typography>
                <Chip
                  label={previewPost.category?.name}
                  sx={{
                    backgroundColor: previewPost.category?.color,
                    color: 'white',
                    mb: 2
                  }}
                />
                <Box sx={{ mb: 2 }}>
                  {previewPost.tags?.map(tag => (
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
                    __html: previewPost.content || '<p>No content available</p>'
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
                handleEditPost(previewPost);
              }}
              variant="contained"
            >
              Edit Post
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </LocalizationProvider>
  );
};

export default BlogManager;