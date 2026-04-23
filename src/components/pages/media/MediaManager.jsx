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
  InputAdornment,
  Switch,
  FormControlLabel,
  Avatar,
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
  Menu,
  MenuItem as MenuItemComponent,
  Skeleton,
  Checkbox,
  Fab,
  Container,
  LinearProgress,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Description as DocumentIcon,
  Folder as FolderIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  Info as InfoIcon,
  FileUpload as FileUploadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import dayjs from 'dayjs';
import cms from '../../../services/cms';

const MediaManager = () => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewFile, setViewFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPurpose, setFilterPurpose] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [tabValue, setTabValue] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [categories, setCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextFile, setContextFile] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, files: [] });
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    images: 0,
    videos: 0,
    documents: 0
  });

  // Form state
  const [fileForm, setFileForm] = useState({
    filename: '',
    alt_text: '',
    description: '',
    tags: []
  });

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    purpose: 'general',
    alt_text: '',
    description: ''
  });

  const fileTypes = [
    { value: 'all', label: 'All Files', icon: <DocumentIcon /> },
    { value: 'image', label: 'Images', icon: <ImageIcon /> },
    { value: 'video', label: 'Videos', icon: <VideoIcon /> },
    { value: 'document', label: 'Documents', icon: <DocumentIcon /> }
  ];

  const tabTypeMap = ['all', 'image', 'video', 'document'];

  useEffect(() => {
    fetchMediaFiles();
  }, [tabValue, filterType, filterPurpose, searchTerm]);

  const fetchMediaFiles = async (page = 1) => {
    setLoading(true);
    try {
      const activeType = tabTypeMap[tabValue] || filterType;
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        type: activeType !== 'all' ? activeType : undefined,
        category: filterPurpose !== 'all' ? filterPurpose : undefined,
      };

      const response = await cms.media.list(params);
      const resData = response?.data || response || [];
      const files = Array.isArray(resData) ? resData : (resData.files || resData.media || []);
      const meta = response?.meta || {};

      const transformedMedia = files.map(item => ({
        ...item,
        id: item.id,
        filename: item.fileName || item.filename,
        original_name: item.fileName || item.original_name,
        mimetype: item.mimeType || item.mimetype || 'application/octet-stream',
        size: item.sizeBytes || item.size || 0,
        url: item.url || '',
        type: item.fileType || (item.mimeType?.startsWith('image/') ? 'image' :
              item.mimeType?.startsWith('video/') ? 'video' : 'document'),
        uploaded_by: { id: 'system', name: 'System' },
        tags: [],
        description: '',
        created_at: item.createdAt || item.created_at,
      }));

      setMediaFiles(transformedMedia);
      setPagination({
        page: meta.page || page,
        limit: meta.limit || pagination.limit,
        total: meta.total || files.length,
        pages: Math.ceil((meta.total || files.length) / (meta.limit || pagination.limit)),
      });

      // Fetch stats + sidebar counts in one call
      try {
        const statsRes = await cms.media.stats();
        const s = statsRes?.data || statsRes || {};
        const bc = s.byCategory || {};
        setStats({ totalFiles: s.total || 0, totalSize: s.totalSize || 0, images: s.images || 0, videos: s.videos || 0, documents: s.documents || 0 });
        setCategories([
          { value: 'all', label: 'All Files', count: s.total || 0, icon: <FolderIcon />, color: '#667eea' },
          { value: 'assets', label: 'Site Assets', count: bc.assets || 0, icon: <ImageIcon />, color: '#06b6d4' },
          { value: 'blog', label: 'Blog Media', count: bc.blog || 0, icon: <ImageIcon />, color: '#8b5cf6' },
          { value: 'events', label: 'Events', count: bc.events || 0, icon: <ImageIcon />, color: '#ef4444' },
          { value: 'team', label: 'Team Photos', count: bc.team || 0, icon: <ImageIcon />, color: '#22c55e' },
          { value: 'products', label: 'Products', count: bc.products || 0, icon: <ImageIcon />, color: '#f59e0b' },
          { value: 'donations', label: 'Donations', count: bc.donations || 0, icon: <ImageIcon />, color: '#ec4899' },
        ]);
      } catch {
        const imageCount = transformedMedia.filter(f => f.type === 'image').length;
        const videoCount = transformedMedia.filter(f => f.type === 'video').length;
        const docCount = transformedMedia.filter(f => f.type === 'document').length;
        const totalSize = transformedMedia.reduce((sum, f) => sum + (typeof f.size === 'number' ? f.size : 0), 0);
        setStats({ totalFiles: meta.total || files.length, totalSize, images: imageCount, videos: videoCount, documents: docCount });
      }

    } catch (error) {
      console.error('Failed to fetch media files:', error);
      showSnackbar('Failed to fetch media files', 'error');
    } finally {
      setLoading(false);
    }
  };


  const onDrop = useCallback((acceptedFiles) => {
    const withPreviews = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setPendingFiles(prev => [...prev, ...withPreviews]);
    if (!openUploadDialog) setOpenUploadDialog(true);
  }, [openUploadDialog]);

  const removePendingFile = (index) => {
    setPendingFiles(prev => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const startUpload = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    for (const pf of pendingFiles) {
      const file = pf.file;
      setUploadProgress(prev => ({ ...prev, [file.name]: 10 }));
      try {
        const presignRes = await cms.media.presignUpload({
          filename: file.name,
          contentType: file.type,
        });
        const presignData = presignRes.data?.data || presignRes.data;
        setUploadProgress(prev => ({ ...prev, [file.name]: 30 }));

        await fetch(presignData.url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });
        setUploadProgress(prev => ({ ...prev, [file.name]: 70 }));

        const s3Key = presignData.key;
        const bucket = 'your-s3-bucket-name';
        const region = 'ap-south-2';
        const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
        const fileType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';

        await cms.media.register({
          fileName: file.name,
          fileType,
          mimeType: file.type,
          sizeBytes: file.size,
          s3Key,
          url: publicUrl,
        });
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[file.name];
            return next;
          });
        }, 500);
        showSnackbar(`${file.name} uploaded successfully`, 'success');
      } catch (err) {
        console.error('Upload failed:', err);
        showSnackbar(`Failed to upload ${file.name}`, 'error');
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
      }
    }
    pendingFiles.forEach(pf => { if (pf.preview) URL.revokeObjectURL(pf.preview); });
    setPendingFiles([]);
    setUploading(false);
    setOpenUploadDialog(false);
    fetchMediaFiles();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleFileSelect = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const handleDeleteFiles = () => {
    const filesToDelete = filteredFiles.filter(file => selectedFiles.includes(file.id));
    setDeleteConfirmDialog({ open: true, files: filesToDelete });
  };

  const confirmDeleteFiles = async () => {
    try {
      // Get file IDs to delete from dialog files
      const filesToDelete = deleteConfirmDialog.files.map(file => file.id);

      // Use bulk delete API - works for single or multiple files
      const response = await cms.media.bulkDelete(filesToDelete);

      showSnackbar(response.message || `${filesToDelete.length} file(s) deleted successfully`, 'success');
      setSelectedFiles([]);
      setDeleteConfirmDialog({ open: false, files: [] });
      fetchMediaFiles();
    } catch (error) {
      console.error('Failed to delete files:', error);
      showSnackbar(error.response?.data?.error || 'Failed to delete files', 'error');
    }
  };

  const handleContextMenu = (event, file) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setContextFile(file);
  };

  const handleCloseContextMenu = () => {
    setAnchorEl(null);
    setContextFile(null);
  };

  const handleViewFile = (file) => {
    setViewFile(file);
    setOpenViewDialog(true);
  };

  const handleEditFile = (file) => {
    setSelectedFile(file);
    setFileForm({
      filename: file.filename,
      alt_text: file.alt_text || '',
      description: file.description || '',
      tags: file.tags || []
    });
    setOpenDialog(true);
    handleCloseContextMenu();
  };

  const handleSaveFile = async () => {
    try {
      showSnackbar('File updated successfully', 'success');
      setOpenDialog(false);
      fetchMediaFiles();
    } catch (error) {
      showSnackbar('Failed to update file', 'error');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    showSnackbar('URL copied to clipboard', 'success');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <ImageIcon />;
      case 'video': return <VideoIcon />;
      case 'document': return <DocumentIcon />;
      default: return <DocumentIcon />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper functions for file type styling
  const getFileTypeColor = (type) => {
    switch (type) {
      case 'image': return '#22c55e';
      case 'video': return '#ef4444';
      case 'document': return '#8b5cf6';
      default: return '#667eea';
    }
  };

  const getFileTypeGradient = (type) => {
    switch (type) {
      case 'image': return '#ECFDF5';
      case 'video': return '#FEF3C7';
      case 'document': return '#EFF6FF';
      case 'audio': return '#F3E8FF';
      default: return '#F8FAFC';
    }
  };

  const filteredFiles = mediaFiles;

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex' }}>
      {/* Google Drive-like Sidebar */}
      {sidebarOpen && (
        <Paper
          sx={{
            width: 140,
            minHeight: '100vh',
            borderRadius: 0,
            borderRight: '1px solid #e2e8f0',
            backgroundColor: 'white'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" fontWeight="bold" color="primary.main" sx={{ fontSize: '0.9rem' }}>
              📁 Media
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.7rem' }}>
              Organize files
            </Typography>
          </Box>

          <List sx={{ py: 1 }}>
            {categories.map((category) => (
              <ListItem
                key={category.value}
                button
                selected={filterPurpose === category.value}
                onClick={() => setFilterPurpose(category.value)}
                sx={{
                  mx: 0.5,
                  mb: 0.3,
                  py: 0.5,
                  borderRadius: 1.5,
                  '&.Mui-selected': {
                    backgroundColor: `${category.color}15`,
                    '&:hover': {
                      backgroundColor: `${category.color}20`
                    }
                  },
                  '&:hover': {
                    backgroundColor: `${category.color}10`
                  }
                }}
              >
                <ListItemText
                  primary={category.label}
                  primaryTypographyProps={{
                    fontWeight: filterPurpose === category.value ? 'bold' : 'medium',
                    fontSize: '0.75rem',
                    color: filterPurpose === category.value ? category.color : 'text.primary'
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom sx={{ fontSize: '0.7rem' }}>
              Quick Actions
            </Typography>
            <Stack spacing={0.5}>
              <Button
                size="small"
                startIcon={<UploadIcon sx={{ fontSize: 14 }} />}
                onClick={() => setOpenUploadDialog(true)}
                sx={{
                  justifyContent: 'flex-start',
                  fontSize: '0.7rem',
                  py: 0.5,
                  minHeight: 'auto'
                }}
              >
                Upload
              </Button>
              <Button
                size="small"
                startIcon={<FilterIcon sx={{ fontSize: 14 }} />}
                onClick={() => setSidebarOpen(false)}
                sx={{
                  justifyContent: 'flex-start',
                  fontSize: '0.7rem',
                  py: 0.5,
                  minHeight: 'auto'
                }}
              >
                Hide
              </Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, minHeight: '100vh' }}>
      {/* Action Buttons Container */}
      <Box
        sx={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          mb: 2
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Stack direction="row" spacing={2}>
                {!sidebarOpen && (
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => setSidebarOpen(true)}
                    sx={{
                      color: '#2563EB',
                      borderColor: '#E2E8F0',
                      '&:hover': {
                        backgroundColor: '#F8FAFC',
                        borderColor: '#CBD5E1'
                      }
                    }}
                  >
                    Show Folders
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setOpenUploadDialog(true)}
                  sx={{
                    backgroundColor: '#2563EB',
                    color: 'white',
                    borderRadius: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#1D4ED8'
                    }
                  }}
                >
                  Upload Files
                </Button>
                {selectedFiles.length > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteFiles}
                    sx={{
                      backgroundColor: '#DC2626',
                      color: 'white',
                      borderRadius: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#B91C1C'
                      }
                    }}
                  >
                    Delete ({selectedFiles.length})
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">

        {/* Enhanced Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <Paper sx={{ p: 3, mb: 4, borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF' }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#1E293B', fontWeight: 'bold' }}>
              📤 Uploading Files
            </Typography>
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <Box key={filename} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 'medium' }}>{filename}</Typography>
                  <Typography variant="body2" color="#2563EB" sx={{ fontWeight: 'bold' }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      backgroundColor: '#2563EB'
                    }
                  }}
                />
              </Box>
            ))}
          </Paper>
        )}

        {/* Enhanced Tabs */}
        <Paper sx={{ mb: 4, borderRadius: 1.5, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF' }}>
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
                color: '#475569'
              },
              '& .Mui-selected': {
                color: '#2563EB'
              }
            }}
          >
            <Tab label={`All Files (${stats.totalFiles})`} />
            <Tab label={`Images (${stats.images})`} />
            <Tab label={`Videos (${stats.videos})`} />
            <Tab label={`Documents (${stats.documents})`} />
          </Tabs>
        </Paper>

        {/* Enhanced Filters and Controls */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search files by name, description, or tags..."
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
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>File Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="File Type"
                  sx={{ borderRadius: 2 }}
                >
                  {fileTypes.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterPurpose}
                  onChange={(e) => setFilterPurpose(e.target.value)}
                  label="Category"
                  sx={{ borderRadius: 2 }}
                >
                  {categories.map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: category.color, fontSize: 16 }}>
                            {category.icon}
                          </Box>
                          {category.label}
                        </Box>
                        <Chip
                          label={category.count}
                          size="small"
                          sx={{
                            backgroundColor: `${category.color}20`,
                            color: category.color,
                            fontSize: '0.7rem',
                            height: '18px',
                            minWidth: '18px',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
                <Tooltip title="Grid View">
                  <Button
                    variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setViewMode('grid')}
                    startIcon={<GridViewIcon />}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      ...(viewMode === 'grid' && {
                        backgroundColor: '#2563EB',
                        color: 'white',
                        '&:hover': { backgroundColor: '#1D4ED8' }
                      }),
                      ...( viewMode !== 'grid' && {
                        color: '#475569',
                        borderColor: '#E2E8F0',
                        '&:hover': { backgroundColor: '#F8FAFC' }
                      })
                    }}
                  >
                    Grid
                  </Button>
                </Tooltip>
                <Tooltip title="List View">
                  <Button
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setViewMode('list')}
                    startIcon={<ListViewIcon />}
                    sx={{
                      borderRadius: 1,
                      fontWeight: 600,
                      textTransform: 'none',
                      ...(viewMode === 'list' && {
                        backgroundColor: '#2563EB',
                        color: 'white',
                        '&:hover': { backgroundColor: '#1D4ED8' }
                      }),
                      ...(viewMode !== 'list' && {
                        color: '#475569',
                        borderColor: '#E2E8F0',
                        '&:hover': { backgroundColor: '#F8FAFC' }
                      })
                    }}
                  >
                    List
                  </Button>
                </Tooltip>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: 'center' }}>
                <Checkbox
                  checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                  indeterminate={selectedFiles.length > 0 && selectedFiles.length < filteredFiles.length}
                  onChange={handleSelectAll}
                />
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  Select All ({selectedFiles.length})
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Enhanced Media Grid/List */}
        {viewMode === 'grid' ? (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(6, 1fr)',
              xl: 'repeat(8, 1fr)'
            },
            gap: 2,
            mb: 4
          }}>
            {loading ? (
              Array.from(new Array(16)).map((_, index) => (
                <Card key={index} sx={{ aspectRatio: '1', height: 120 }}>
                  <Skeleton variant="rectangular" height="100%" />
                </Card>
              ))
            ) : (
              filteredFiles.map(file => (
                <Fade in={true} timeout={500} key={file.id}>
                  <Card
                    sx={{
                      aspectRatio: '1',
                      height: 120,
                      cursor: 'pointer',
                      border: selectedFiles.includes(file.id) ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      borderRadius: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        borderColor: '#2563EB'
                      },
                      backgroundColor: selectedFiles.includes(file.id) ? '#EFF6FF' : '#FFFFFF',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onContextMenu={(e) => handleContextMenu(e, file)}
                    onClick={() => handleFileSelect(file.id)}
                    onDoubleClick={() => handleViewFile(file)}
                  >
                    {/* Thumbnail Image/Icon */}
                    {file.type === 'image' ? (
                      <CardMedia
                        component="img"
                        height="100%"
                        image={file.url}
                        alt={file.fileName || file.alt_text}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div style="height:100%;display:flex;align-items:center;justify-content:center;background:#F1F5F9;color:#94A3B8;font-size:13px;flex-direction:column"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span style="margin-top:4px">' + (file.fileName || 'Image') + '</span></div>';
                        }}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: getFileTypeGradient(file.type),
                          color: file.type === 'image' ? '#059669' : file.type === 'video' ? '#D97706' : file.type === 'document' ? '#2563EB' : '#8B5CF6'
                        }}
                      >
                        <Box sx={{ fontSize: 32 }}>
                          {getFileIcon(file.type)}
                        </Box>
                      </Box>
                    )}

                    {/* Selection Checkbox */}
                    <Box sx={{ position: 'absolute', top: 4, left: 4 }}>
                      <Checkbox
                        checked={selectedFiles.includes(file.id)}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.9)',
                          borderRadius: '50%',
                          padding: '2px',
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                        }}
                      />
                    </Box>

                    {/* File Type Badge */}
                    <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                      <Chip
                        label={file.type.charAt(0).toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: file.type === 'image' ? '#059669' : file.type === 'video' ? '#D97706' : file.type === 'document' ? '#2563EB' : '#2563EB',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          height: '18px',
                          minWidth: '18px',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    </Box>

                    {/* File Size */}
                    <Box sx={{ position: 'absolute', bottom: 4, left: 4 }}>
                      <Chip
                        label={formatFileSize(file.size)}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          fontSize: '0.6rem',
                          height: '18px',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    </Box>

                    {/* Quick Actions on Hover */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        display: 'flex',
                        gap: 0.5,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        '.MuiCard-root:hover &': { opacity: 1 }
                      }}
                    >
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFile(file);
                          }}
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: 'primary.main',
                            width: 28,
                            height: 28,
                            '&:hover': { backgroundColor: 'white' }
                          }}
                        >
                          <ViewIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete File">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Set this file for deletion
                            setDeleteConfirmDialog({
                              open: true,
                              files: [file]
                            });
                          }}
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            color: 'error.main',
                            width: 28,
                            height: 28,
                            '&:hover': {
                              backgroundColor: 'white',
                              color: 'error.dark'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Card>
                </Fade>
              ))
            )}
          </Box>
      ) : (
        <Paper sx={{ borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF' }}>
          <List>
            {filteredFiles.map(file => (
              <ListItem key={file.id} divider>
                <ListItemAvatar>
                  <Avatar variant="rounded">
                    {getFileIcon(file.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{file.original_name}</Typography>
                      <Chip label={file.type} size="small" />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {formatFileSize(file.size)} • Uploaded by {file.uploaded_by.name} • {dayjs(file.created_at).format('MMM DD, YYYY')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {file.description}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Stack direction="row" spacing={1}>
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => handleFileSelect(file.id)}
                    />
                    <IconButton size="small">
                      <DownloadIcon />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => handleContextMenu(e, file)}>
                      <MoreIcon />
                    </IconButton>
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid #E2E8F0'
        }}>
          <UploadIcon />
          Upload Files to Media Library
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Category Selection */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Select Category</InputLabel>
                <Select
                  value={uploadForm.purpose}
                  onChange={(e) => setUploadForm({ ...uploadForm, purpose: e.target.value })}
                  label="Select Category"
                >
                  {categories.filter(cat => cat.value !== 'all').map(category => (
                    <MenuItem key={category.value} value={category.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: category.color, fontSize: 16 }}>
                          {category.icon}
                        </Box>
                        {category.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                label="Alt Text (Optional)"
                value={uploadForm.alt_text}
                onChange={(e) => setUploadForm({ ...uploadForm, alt_text: e.target.value })}
                placeholder="Brief description for accessibility"
              />
            </Grid>
          </Grid>

          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'primary.50' : 'grey.50',
              mb: 3,
              transition: 'all 0.3s ease'
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here, or click to select'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Files will be uploaded to: <strong>{categories.find(c => c.value === uploadForm.purpose)?.label}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports images, videos, and documents up to 10MB each
            </Typography>
          </Box>

          {/* Pending Files Preview */}
          {pendingFiles.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#1E293B' }}>
                {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''} selected
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1.5 }}>
                {pendingFiles.map((pf, idx) => (
                  <Paper key={idx} variant="outlined" sx={{ p: 1, position: 'relative', borderRadius: 1.5 }}>
                    <IconButton size="small" onClick={() => removePendingFile(idx)}
                      sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.9)', width: 22, height: 22, zIndex: 1, '&:hover': { bgcolor: '#FEE2E2' } }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    {pf.preview ? (
                      <Box component="img" src={pf.preview} alt={pf.name}
                        sx={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 1, mb: 0.5 }} />
                    ) : (
                      <Box sx={{ width: '100%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F1F5F9', borderRadius: 1, mb: 0.5 }}>
                        <DocumentIcon sx={{ fontSize: 32, color: '#94A3B8' }} />
                      </Box>
                    )}
                    <Typography sx={{ fontSize: '0.6875rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pf.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.625rem', color: '#94A3B8' }}>
                      {(pf.size / 1024).toFixed(0)} KB
                    </Typography>
                    {uploadProgress[pf.name] !== undefined && (
                      <LinearProgress variant="determinate" value={uploadProgress[pf.name]} sx={{ mt: 0.5, borderRadius: 1 }} />
                    )}
                  </Paper>
                ))}
              </Box>
            </Box>
          )}

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Supported formats:</strong> JPEG, PNG, GIF, WebP, MP4, AVI, MOV, PDF, DOC, DOCX
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => { setPendingFiles([]); setOpenUploadDialog(false); }} disabled={uploading}>Close</Button>
          <Button
            variant="contained"
            startIcon={uploading ? null : <UploadIcon />}
            onClick={startUpload}
            disabled={pendingFiles.length === 0 || uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${pendingFiles.length} File${pendingFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1E293B' }}>
            {viewFile && getFileIcon(viewFile.type)}
            File Details
          </Box>
          <IconButton
            size="small"
            onClick={() => setOpenViewDialog(false)}
            sx={{ color: '#1E293B' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {viewFile && (
            <Box>
              {/* File Preview */}
              {viewFile.type === 'image' ? (
                <Box sx={{ height: 400, overflow: 'hidden' }}>
                  <img
                    src={viewFile.url}
                    alt={viewFile.alt_text}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#f5f5f5' }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: getFileTypeGradient(viewFile.type),
                    color: viewFile.type === 'image' ? '#059669' : viewFile.type === 'video' ? '#D97706' : viewFile.type === 'document' ? '#2563EB' : '#8B5CF6'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ fontSize: 80, mb: 2 }}>
                      {getFileIcon(viewFile.type)}
                    </Box>
                    <Typography variant="h5" fontWeight="bold">
                      {viewFile.type.toUpperCase()} File
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* File Information */}
              <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#1E293B' }}>
                      {viewFile.original_name}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="#94A3B8" gutterBottom>
                      File Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ color: '#1E293B' }}>
                      {viewFile.filename}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="#94A3B8" gutterBottom>
                      File Type
                    </Typography>
                    <Chip
                      label={viewFile.type}
                      sx={{
                        backgroundColor: viewFile.type === 'image' ? '#ECFDF5' : viewFile.type === 'video' ? '#FEF3C7' : viewFile.type === 'document' ? '#EFF6FF' : '#F3E8FF',
                        color: viewFile.type === 'image' ? '#059669' : viewFile.type === 'video' ? '#D97706' : viewFile.type === 'document' ? '#2563EB' : '#8B5CF6',
                        fontWeight: 'bold',
                        textTransform: 'capitalize'
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="#94A3B8" gutterBottom>
                      File Size
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ color: '#1E293B' }}>
                      {formatFileSize(viewFile.size)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="#94A3B8" gutterBottom>
                      Upload Date
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ color: '#1E293B' }}>
                      {dayjs(viewFile.created_at).format('MMMM DD, YYYY [at] HH:mm')}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="#94A3B8" gutterBottom>
                      Uploaded By
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ color: '#1E293B' }}>
                      {viewFile.uploaded_by?.name || 'Unknown'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="#94A3B8" gutterBottom>
                      MIME Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ color: '#1E293B' }}>
                      {viewFile.mimetype}
                    </Typography>
                  </Grid>

                  {viewFile.alt_text && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#94A3B8" gutterBottom>
                        Alt Text
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#475569' }}>
                        {viewFile.alt_text}
                      </Typography>
                    </Grid>
                  )}

                  {viewFile.description && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="#94A3B8" gutterBottom>
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#475569' }}>
                        {viewFile.description}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="body2" color="#94A3B8" gutterBottom>
                      File URL
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={viewFile.url}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(viewFile.url)}
                              sx={{ ml: 1 }}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          )
                        }}
                      />
                    </Box>
                  </Grid>

                  {viewFile.tags && viewFile.tags.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {viewFile.tags.map(tag => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              backgroundColor: viewFile.type === 'image' ? '#ECFDF5' : viewFile.type === 'video' ? '#FEF3C7' : viewFile.type === 'document' ? '#EFF6FF' : '#F3E8FF',
                              color: viewFile.type === 'image' ? '#059669' : viewFile.type === 'video' ? '#D97706' : viewFile.type === 'document' ? '#2563EB' : '#8B5CF6'
                            }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            startIcon={<EditIcon />}
            onClick={() => {
              setOpenViewDialog(false);
              handleEditFile(viewFile);
            }}
          >
            Edit Details
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
          >
            Download
          </Button>
          <Button
            startIcon={<CopyIcon />}
            variant="outlined"
            onClick={() => copyToClipboard(viewFile?.url)}
          >
            Copy URL
          </Button>
          <Button onClick={() => setOpenViewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit File Details</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Filename"
                value={fileForm.filename}
                onChange={(e) => setFileForm({ ...fileForm, filename: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alt Text"
                value={fileForm.alt_text}
                onChange={(e) => setFileForm({ ...fileForm, alt_text: e.target.value })}
                helperText="Brief description for screen readers and SEO"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={fileForm.description}
                onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                value={fileForm.tags.join(', ')}
                onChange={(e) => setFileForm({ 
                  ...fileForm, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                })}
                helperText="Comma-separated tags for better organization"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveFile} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseContextMenu}
      >
        <MenuItemComponent onClick={() => handleEditFile(contextFile)}>
          <EditIcon sx={{ mr: 1 }} /> Edit Details
        </MenuItemComponent>
        <MenuItemComponent onClick={() => copyToClipboard(contextFile?.url)}>
          <CopyIcon sx={{ mr: 1 }} /> Copy URL
        </MenuItemComponent>
        <MenuItemComponent>
          <DownloadIcon sx={{ mr: 1 }} /> Download
        </MenuItemComponent>
        <Divider />
        <MenuItemComponent sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItemComponent>
      </Menu>

        {/* Enhanced Empty State */}
        {filteredFiles.length === 0 && !loading && (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 1.5, border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', backgroundColor: '#FFFFFF' }}>
            <FolderIcon sx={{ fontSize: 80, color: '#94A3B8', mb: 3 }} />
            <Typography variant="h5" color="#475569" gutterBottom fontWeight="600">
              No media files found
            </Typography>
            <Typography variant="body1" color="#94A3B8" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                : 'Start building your media library by uploading your first files.'}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<UploadIcon />}
              onClick={() => setOpenUploadDialog(true)}
              sx={{
                borderRadius: 1,
                px: 4,
                py: 1.5,
                backgroundColor: '#2563EB',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#1D4ED8'
                }
              }}
            >
              Upload Files
            </Button>
          </Paper>
        )}
      </Container>

      {/* Enhanced Floating Action Button for Upload */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#2563EB',
          color: 'white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          '&:hover': {
            backgroundColor: '#1D4ED8',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.3s ease'
        }}
        onClick={() => setOpenUploadDialog(true)}
      >
        <UploadIcon />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={() => setDeleteConfirmDialog({ open: false, files: [] })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          backgroundColor: '#FFFFFF',
          color: '#1E293B',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: '1px solid #E2E8F0'
        }}>
          <DeleteIcon sx={{ color: '#DC2626' }} />
          Confirm Deletion
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight="bold">
              This action cannot be undone!
            </Typography>
          </Alert>

          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete the following {deleteConfirmDialog.files.length} file(s)?
          </Typography>

          <Box sx={{ maxHeight: 200, overflow: 'auto', mt: 2, border: '1px solid #e2e8f0', borderRadius: 1 }}>
            {deleteConfirmDialog.files.map(file => (
              <Box key={file.id} sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderBottom: '1px solid #f1f5f9',
                '&:last-child': { borderBottom: 'none' }
              }}>
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.alt_text}
                    style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                  />
                ) : (
                  <Box sx={{
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: getFileTypeColor(file.type),
                    color: 'white',
                    borderRadius: 1
                  }}>
                    {getFileIcon(file.type)}
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {file.original_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(file.size)} • {file.type}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setDeleteConfirmDialog({ open: false, files: [] })}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteFiles}
            variant="contained"
            startIcon={<DeleteIcon />}
            sx={{
              backgroundColor: '#DC2626',
              color: 'white',
              borderRadius: 1,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#B91C1C'
              }
            }}
          >
            Delete {deleteConfirmDialog.files.length} File(s)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {/* Floating Action Button for Bulk Delete */}
      {selectedFiles.length > 0 && (
        <Fade in={true}>
          <Fab
            sx={{
              position: 'fixed',
              bottom: 100,
              right: 32,
              zIndex: 1000,
              backgroundColor: '#DC2626',
              color: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: '#B91C1C',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              // Convert selectedFiles (array of IDs) to file objects for the dialog
              const selectedFileObjects = mediaFiles.filter(file => selectedFiles.includes(file.id));
              setDeleteConfirmDialog({ open: true, files: selectedFileObjects });
            }}
            size="large"
          >
            <Badge
              badgeContent={selectedFiles.length}
              color="default"
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: 'white',
                  color: 'error.main',
                  fontWeight: 'bold',
                  minWidth: '24px',
                  height: '24px',
                  fontSize: '12px'
                }
              }}
            >
              <DeleteIcon sx={{ fontSize: 28 }} />
            </Badge>
          </Fab>
        </Fade>
      )}

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
    </Box>
  );
};

export default MediaManager;