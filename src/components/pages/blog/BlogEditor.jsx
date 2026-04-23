import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Autocomplete,
  AppBar,
  Toolbar,
  IconButton,
  Container,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import cms from '../../../services/cms';
import ImageCropUpload from '../../common/ImageCropUpload';
import dayjs from 'dayjs';

const BlogEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  // State Management
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    featured_image_id: null,
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

  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  // Rich Text Editor Configuration
  const quillModules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false
    }
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'blockquote', 'code-block', 'link', 'image', 'video'
  ];

  // Mock Data Functions
  const getMockCategories = () => [
    { id: 1, name: 'Community Development', color: '#3b82f6' },
    { id: 2, name: 'Education', color: '#10b981' },
    { id: 3, name: 'Healthcare', color: '#84cc16' },
    { id: 4, name: 'Environment', color: '#8b5cf6' },
    { id: 5, name: 'Women Empowerment', color: '#f59e0b' },
    { id: 6, name: 'Youth Development', color: '#ef4444' },
    { id: 7, name: 'News & Updates', color: '#06b6d4' },
    { id: 8, name: 'Success Stories', color: '#a855f7' }
  ];

  const getMockPosts = () => [
    {
      id: 1,
      title: 'Empowering Communities Through Education',
      slug: 'empowering-communities-education',
      excerpt: 'Discover how our education initiatives are transforming lives in rural communities across India.',
      content: '<h2>Introduction</h2><p>Education is the cornerstone of development and the foundation upon which we build stronger communities.</p>',
      category: { id: 2, name: 'Education', color: '#10b981' },
      author: { id: 1, name: 'Administrator', avatar: '/images/avatar1.jpg', role: 'Editor' },
      featured_image: '/images/blog/education-1.jpg',
      featured_image_id: 1,
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
      seo_score: 92,
      meta_title: 'Empowering Communities Through Education - Aahwahan Foundation',
      meta_description: 'Discover how our education initiatives are transforming lives in rural communities across India.',
      meta_keywords: ['education', 'community development', 'rural education'],
      allow_comments: true,
      visibility: 'public'
    }
  ];

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

  // Fetch Post Data (if editing)
  const { data: postData, isLoading } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data } = await cms.blog.get(id);
        return data;
      } catch (error) {
        console.error('Error fetching post:', error);
        return getMockPosts().find(post => post.id === parseInt(id));
      }
    },
    enabled: Boolean(id)
  });

  // Load post data into form when editing
  useEffect(() => {
    if (postData && isEditing) {
      // Map category name to category ID from the categories list
      let categoryId = '';
      if (postData.category?.name && categories.length > 0) {
        const matchingCategory = categories.find(cat => cat.name === postData.category.name);
        categoryId = matchingCategory?.id || '';
      }

      setFormData({
        title: postData.title || '',
        slug: postData.slug || '',
        excerpt: postData.excerpt || '',
        content: postData.content || '',
        category_id: categoryId,
        featured_image: postData.featured_image || '',
        featured_image_id: postData.featured_image_id || null,
        status: postData.status || 'draft',
        is_featured: postData.is_featured || false,
        published_at: postData.published_at ? dayjs(postData.published_at) : null,
        tags: postData.tags || [],
        meta_title: postData.meta_title || '',
        meta_description: postData.meta_description || '',
        meta_keywords: postData.meta_keywords || [],
        allow_comments: postData.allow_comments !== false,
        visibility: postData.visibility || 'public',
        password: postData.password || '',
        author_id: postData.author?.id || postData.author_id || null
      });
    }
  }, [postData, isEditing, categories]);

  // Auto-generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Calculate word count and reading time
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

  // Handle form changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);

    // Auto-generate slug when title changes (only for new posts)
    if (field === 'title' && !isEditing) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
  };

  // Handle featured image upload
  const handleFeaturedImageChange = (imageUrl, mediaId) => {
    setFormData(prev => ({
      ...prev,
      featured_image: imageUrl,
      featured_image_id: mediaId
    }));
    setHasUnsavedChanges(true);
  };

  // Handle featured image error
  const handleFeaturedImageError = (error) => {
    toast.error(`Featured image upload failed: ${error}`);
  };

  // Save Post Mutation
  const savePostMutation = useMutation({
    mutationFn: async (data) => {
      // Convert category_id to category name for the backend
      const saveData = { ...data };
      if (data.category_id) {
        const selectedCategory = categories.find(cat => cat.id === data.category_id);
        if (selectedCategory) {
          saveData.category = selectedCategory.name;
        }
      }
      delete saveData.category_id;

      if (isEditing) {
        const { data } = await cms.blog.update(id, saveData);
        return data;
      } else {
        const { data } = await cms.blog.create(saveData);
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['blog-posts']);
      queryClient.invalidateQueries(['blog-post', id]);
      setHasUnsavedChanges(false);
      toast.success(isEditing ? 'Post updated successfully!' : 'Post created successfully!');

      if (!isEditing && data?.id) {
        navigate(`../edit/${data.id}`, { replace: true });
      }
    },
    onError: (error) => {
      console.error('Save post error:', error);
      toast.error('Failed to save post');
    }
  });

  const handleSave = () => {
    savePostMutation.mutate(formData);
  };

  const handlePublish = () => {
    const publishData = { ...formData, status: 'published' };
    savePostMutation.mutate(publishData);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('..');
      }
    } else {
      navigate('..');
    }
  };

  const handlePreview = () => {
    setOpenPreviewDialog(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <IconButton edge="start" onClick={handleBack} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
          </Typography>

          {hasUnsavedChanges && (
            <Alert severity="warning" sx={{ mr: 2, py: 0 }}>
              Unsaved changes
            </Alert>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={handlePreview}
              size="small"
            >
              Preview
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={savePostMutation.isPending}
              size="small"
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              startIcon={<PublishIcon />}
              onClick={handlePublish}
              disabled={savePostMutation.isPending}
              size="small"
            >
              Publish
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 4,
          '@media (max-width: 900px)': {
            flexDirection: 'column'
          }
        }}>
          {/* Main Content Column (Left) - Basic Info, Content Editor, SEO Settings */}
          <Box sx={{
            flex: '1 1 66%',
            minWidth: 0,
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            p: 3
          }}>
            <Stack spacing={3}>
              {/* Basic Info Card */}
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Basic Information
                  </Typography>

                  <Stack spacing={3}>
                    <TextField
                      label="Post Title"
                      fullWidth
                      variant="outlined"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter an engaging title for your blog post"
                      required
                    />

                    <TextField
                      label="URL Slug"
                      fullWidth
                      variant="outlined"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      helperText="URL-friendly version of the title (auto-generated)"
                    />

                    <TextField
                      label="Excerpt"
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Brief summary of the post (used in previews and search)"
                      helperText={`${formData.excerpt?.length || 0}/160 characters`}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Content Editor Card */}
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Content
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <ReactQuill
                      value={formData.content}
                      onChange={(content) => handleInputChange('content', content)}
                      modules={quillModules}
                      formats={quillFormats}
                      style={{
                        minHeight: '500px',
                        '.ql-editor': {
                          minHeight: '500px'
                        }
                      }}
                      placeholder="Write your blog post content here..."
                    />
                  </Box>

                  <Stack direction="row" spacing={3} sx={{ mt: 2, color: 'text.secondary' }}>
                    <Typography variant="caption">
                      Words: {wordCount}
                    </Typography>
                    <Typography variant="caption">
                      Reading time: {readingTime} min
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              {/* SEO Settings Card */}
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    SEO Settings
                  </Typography>

                  <Stack spacing={3}>
                    <TextField
                      label="Meta Title"
                      fullWidth
                      variant="outlined"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      helperText={`${formData.meta_title?.length || 0}/60 characters`}
                      placeholder="SEO title for search engines"
                    />

                    <TextField
                      label="Meta Description"
                      fullWidth
                      multiline
                      rows={3}
                      variant="outlined"
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      helperText={`${formData.meta_description?.length || 0}/160 characters`}
                      placeholder="Description for search engines"
                    />

                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={formData.meta_keywords}
                      onChange={(e, newValue) => handleInputChange('meta_keywords', newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Meta Keywords"
                          placeholder="Add SEO keywords..."
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
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          {/* Right Sidebar - Featured Image, Categories & Tags, Publishing Settings */}
          <Box sx={{
            flex: '0 0 33%',
            minWidth: '300px',
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            p: 3,
            height: 'fit-content'
          }}>
            <Stack spacing={3}>
              {/* Featured Image */}
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Featured Image
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Upload a featured image for your blog post. This image will be displayed as the preview image.
                  </Typography>

                  <ImageCropUpload
                    value={formData.featured_image}
                    onChange={handleFeaturedImageChange}
                    onError={handleFeaturedImageError}
                    folder="blog"
                    altText={`Featured image for ${formData.title || 'blog post'}`}
                    maxSize={10}
                    width={280}
                    height={175}
                    cropAspectRatio={16/9}
                    label="Upload Featured Image"
                    allowDelete={true}
                  />

                  {formData.featured_image && (
                    <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                      ✓ Featured image uploaded successfully
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Categories & Tags */}
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Categories & Tags
                  </Typography>

                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category_id}
                        label="Category"
                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                        sx={{
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }
                        }}
                        renderValue={(selected) => {
                          if (!selected) return '';
                          const cat = categories.find(c => c.id === selected);
                          return cat ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: cat.color,
                                  flexShrink: 0
                                }}
                              />
                              <Typography>{cat.name}</Typography>
                            </Stack>
                          ) : '';
                        }}
                      >
                        <MenuItem value="">
                          <Typography>Select a category</Typography>
                        </MenuItem>
                        {categories.map(cat => (
                          <MenuItem key={cat.id} value={cat.id}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: cat.color
                                }}
                              />
                              <Typography>{cat.name}</Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Autocomplete
                      multiple
                      freeSolo
                      options={[]}
                      value={formData.tags}
                      onChange={(e, newValue) => handleInputChange('tags', newValue)}
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
                            size="small"
                          />
                        ))
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Publishing Settings */}
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Publishing Settings
                  </Typography>

                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        <MenuItem value="draft">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                            <Typography>Draft</Typography>
                          </Stack>
                        </MenuItem>
                        <MenuItem value="published">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
                            <Typography>Published</Typography>
                          </Stack>
                        </MenuItem>
                        <MenuItem value="scheduled">
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                            <Typography>Scheduled</Typography>
                          </Stack>
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Visibility</InputLabel>
                      <Select
                        value={formData.visibility}
                        label="Visibility"
                        onChange={(e) => handleInputChange('visibility', e.target.value)}
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
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter password for protected post"
                      />
                    )}

                    <Stack spacing={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.is_featured}
                            onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Featured Post"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.allow_comments}
                            onChange={(e) => handleInputChange('allow_comments', e.target.checked)}
                            color="primary"
                          />
                        }
                        label="Allow Comments"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* Preview Dialog */}
      <Dialog
        open={openPreviewDialog}
        onClose={() => setOpenPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PreviewIcon />
          Preview: {formData.title || 'Untitled Post'}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {formData.title || 'Untitled Post'}
              </Typography>
              {formData.excerpt && (
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {formData.excerpt}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                <Chip
                  label={formData.status}
                  color={formData.status === 'published' ? 'success' : 'default'}
                  size="small"
                />
                {formData.is_featured && (
                  <Chip label="Featured" color="primary" size="small" />
                )}
                <Typography variant="caption" color="text.secondary">
                  {readingTime} min read • {wordCount} words
                </Typography>
              </Box>
            </Box>

            {formData.featured_image && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <img
                  src={formData.featured_image}
                  alt="Featured"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            )}

            <Box
              sx={{
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontWeight: 'bold',
                  mb: 2,
                  mt: 3,
                  '&:first-of-type': { mt: 0 }
                },
                '& p': {
                  mb: 2,
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  color: '#444'
                },
                '& ul, & ol': { mb: 2, pl: 4 },
                '& li': { mb: 1, lineHeight: 1.6 },
                '& blockquote': {
                  borderLeft: '4px solid #667eea',
                  pl: 3,
                  pr: 2,
                  py: 2,
                  fontStyle: 'italic',
                  mb: 2,
                  backgroundColor: '#f8f9ff',
                  borderRadius: '0 8px 8px 0'
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 1,
                  my: 2
                },
                '& a': {
                  color: '#667eea',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }
              }}
              dangerouslySetInnerHTML={{
                __html: formData.content || '<p><em>No content to preview...</em></p>'
              }}
            />

            {formData.tags && formData.tags.length > 0 && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip key={index} label={tag} variant="outlined" size="small" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewDialog(false)}>
            Close Preview
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogEditor;