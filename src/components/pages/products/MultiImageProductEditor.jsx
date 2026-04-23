import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  CircularProgress,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Paper,
  Grid,
  Breadcrumbs,
  Link,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
  Inventory2 as PackageIcon,
  Image as ImageIcon,
  Tag as TagIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  Star as FeaturedIcon,
  Public as PublicIcon,
  Lock as PrivateIcon,
  CloudUpload as UploadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import ImageCropUpload from '../../common/ImageCropUpload';
import cms from '../../../services/cms';

const sectionStyle = {
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: 2,
  padding: 3,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

const labelStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: '#1E293B',
  marginBottom: 2,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

const ProductEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    description: '',
    priceCents: 0,
    compareAtPriceCents: 0,
    costPriceCents: 0,
    currency: 'INR',
    status: 'draft',
    featured: false,
    trackInventory: true,
    stockQuantity: 0,
    lowStockThreshold: 10,
    allowBackorder: false,
    weight: '',
    length: '',
    width: '',
    height: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    categoryIds: [],
    tagIds: [],
    attributes: {},
    images: [],
    variants: [],
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    seo: false,
    shipping: false,
  });
  const [imageDialog, setImageDialog] = useState({ open: false, editIndex: null });
  const [variantDialog, setVariantDialog] = useState({ open: false, editIndex: null, data: {} });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load product data
  const { data: product } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await cms.products.get(id);
        return res.data;
      } catch (err) {
        console.error('Error fetching product:', err);
        return null;
      }
    },
    enabled: !!id && isEditing,
  });

  // Load categories
  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const res = await cms.products.getCategoryTree();
        return res.data || [];
      } catch (err) {
        console.error('Error fetching categories:', err);
        return [];
      }
    },
  });

  // Load attribute definitions
  const { data: attributesData = [] } = useQuery({
    queryKey: ['attributes'],
    queryFn: async () => {
      try {
        const res = await cms.raw().get('/api/products/attributes');
        return res.data || [];
      } catch (err) {
        console.error('Error fetching attributes:', err);
        return [];
      }
    },
  });

  // Load tags
  const { data: tagsData = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      try {
        const res = await cms.raw().get('/api/products/tags');
        return res.data || [];
      } catch (err) {
        console.error('Error fetching tags:', err);
        return [];
      }
    },
  });

  // Populate form when product loads
  useEffect(() => {
    if (product && isEditing) {
      const attrObj = {};
      if (product.attributes && Array.isArray(product.attributes)) {
        product.attributes.forEach(attr => {
          attrObj[attr.key] = attr.value;
        });
      }

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        shortDescription: product.shortDescription || '',
        description: product.description || '',
        priceCents: product.priceCents || 0,
        compareAtPriceCents: product.compareAtPriceCents || 0,
        costPriceCents: product.costPriceCents || 0,
        currency: product.currency || 'INR',
        status: product.status || 'draft',
        featured: product.featured || false,
        trackInventory: product.trackInventory ?? true,
        stockQuantity: product.stockQuantity || 0,
        lowStockThreshold: product.lowStockThreshold || 10,
        allowBackorder: product.allowBackorder || false,
        weight: product.weight || '',
        length: product.length || '',
        width: product.width || '',
        height: product.height || '',
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        seoKeywords: product.seoKeywords || '',
        categoryIds: product.categoryIds || [],
        tagIds: product.tagIds || [],
        attributes: attrObj,
        images: product.images || [],
        variants: product.variants || [],
      });
      setSlugManuallyEdited(true);
    }
  }, [product, isEditing]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, slugManuallyEdited]);

  // Calculate discount percentage
  const discountPercent = formData.compareAtPriceCents > 0
    ? Math.round(((formData.compareAtPriceCents - formData.priceCents) / formData.compareAtPriceCents) * 100)
    : 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => cms.products.create(data),
    onSuccess: (res) => {
      const newProduct = res.data;
      toast.success('Product created successfully!');
      queryClient.invalidateQueries(['products']);
      navigate(`../edit/${newProduct.id}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to create product';
      toast.error(msg);
      setErrors({ form: msg });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => cms.products.update(id, data),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries(['products']);
      queryClient.invalidateQueries(['product', id]);
      navigate('..');
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Failed to update product';
      toast.error(msg);
      setErrors({ form: msg });
    },
  });

  // Helpers
  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (formData.priceCents <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.categoryIds.length === 0) newErrors.categories = 'At least one category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
      attributes: Object.entries(formData.attributes).map(([key, value]) => ({ key, value })),
      priceCents: parseInt(formData.priceCents) || 0,
      compareAtPriceCents: parseInt(formData.compareAtPriceCents) || 0,
      costPriceCents: parseInt(formData.costPriceCents) || 0,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
    };

    isEditing ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  // Image handlers
  const handleImageAdd = (url) => {
    const newImage = {
      id: `temp-${Date.now()}`,
      url,
      altText: formData.name,
      isPrimary: formData.images.length === 0,
    };
    set('images', [...formData.images, newImage]);
  };

  const handleImageRemove = (index) => {
    set('images', formData.images.filter((_, i) => i !== index));
  };

  const handleImageSetPrimary = (index) => {
    const updated = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    set('images', updated);
  };

  // Category checkbox rendering (recursive)
  const CategoryTree = ({ categories, selectedIds, onToggle }) => {
    return (
      <Box sx={{ pl: 0 }}>
        {categories.map(cat => (
          <Box key={cat.id}>
            <FormControlLabel
              control={
                <Switch
                  checked={selectedIds.includes(cat.id)}
                  onChange={() => onToggle(cat.id)}
                  size="small"
                />
              }
              label={cat.name}
            />
            {cat.children && cat.children.length > 0 && (
              <Box sx={{ pl: 2 }}>
                <CategoryTree
                  categories={cat.children}
                  selectedIds={selectedIds}
                  onToggle={onToggle}
                />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // Variant dialog handlers
  const openVariantDialog = (index = null) => {
    if (index !== null) {
      setVariantDialog({
        open: true,
        editIndex: index,
        data: { ...formData.variants[index] },
      });
    } else {
      setVariantDialog({
        open: true,
        editIndex: null,
        data: { title: '', sku: '', priceCents: 0, stockQuantity: 0, active: true, image: '', options: [] },
      });
    }
  };

  const closeVariantDialog = () => {
    setVariantDialog({ open: false, editIndex: null, data: {} });
  };

  const saveVariant = () => {
    if (!variantDialog.data.title || !variantDialog.data.sku) {
      toast.error('Variant title and SKU are required');
      return;
    }

    const updated = [...formData.variants];
    if (variantDialog.editIndex !== null) {
      updated[variantDialog.editIndex] = variantDialog.data;
    } else {
      updated.push({ ...variantDialog.data, id: `temp-${Date.now()}` });
    }
    set('variants', updated);
    closeVariantDialog();
  };

  const deleteVariant = (index) => {
    set('variants', formData.variants.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <Box sx={{
        px: 3,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #E2E8F0',
        bgcolor: '#fff',
      }}>
        <Box>
          <Breadcrumbs sx={{ mb: 1 }}>
            <Link component="button" onClick={() => navigate('..')} sx={{ cursor: 'pointer', color: '#2563EB' }}>
              Products
            </Link>
            <Typography color="text.secondary">{isEditing ? 'Edit' : 'New'}</Typography>
          </Breadcrumbs>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#1E293B' }}>
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            {isEditing ? 'Update product details' : 'Fill in the product details below'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('..')}
            sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#475569', fontSize: 13 }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving || !formData.name}
            sx={{ textTransform: 'none', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }, fontSize: 13 }}
          >
            {saving ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
          </Button>
        </Stack>
      </Box>

      {/* Error Alert */}
      {errors.form && (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
          <Alert severity="error" onClose={() => setErrors(prev => ({ ...prev, form: null }))}>
            <AlertTitle>Error</AlertTitle>
            {errors.form}
          </Alert>
        </Box>
      )}

      {/* Form Body */}
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Basic Info */}
            <Box sx={sectionStyle}>
              <Box sx={labelStyle}>
                <InfoIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                Basic Information
              </Box>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => set('name', e.target.value)}
                  size="small"
                  placeholder="Enter product name"
                  error={!!errors.name}
                  helperText={errors.name}
                  required
                />
                <TextField
                  fullWidth
                  label="URL Slug"
                  value={formData.slug}
                  onChange={(e) => {
                    set('slug', e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                  size="small"
                  placeholder="product-url-slug"
                  error={!!errors.slug}
                  helperText={errors.slug || 'Auto-generated from name'}
                />
                <TextField
                  fullWidth
                  label="SKU"
                  value={formData.sku}
                  onChange={(e) => set('sku', e.target.value)}
                  size="small"
                  placeholder="SKU-001"
                />
                <TextField
                  fullWidth
                  label="Short Description"
                  value={formData.shortDescription}
                  onChange={(e) => set('shortDescription', e.target.value)}
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Brief product summary"
                />
                <TextField
                  fullWidth
                  label="Full Description"
                  value={formData.description}
                  onChange={(e) => set('description', e.target.value)}
                  size="small"
                  multiline
                  rows={4}
                  placeholder="Detailed product description"
                />
              </Stack>
            </Box>

            {/* Pricing */}
            <Box sx={sectionStyle}>
              <Box sx={labelStyle}>
                <MoneyIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                Pricing
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    type="number"
                    value={formData.priceCents / 100}
                    onChange={(e) => set('priceCents', Math.round(parseFloat(e.target.value) * 100) || 0)}
                    size="small"
                    placeholder="0.00"
                    step="0.01"
                    error={!!errors.price}
                    helperText={errors.price}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Compare at Price (₹)"
                    type="number"
                    value={formData.compareAtPriceCents / 100}
                    onChange={(e) => set('compareAtPriceCents', Math.round(parseFloat(e.target.value) * 100) || 0)}
                    size="small"
                    placeholder="0.00"
                    step="0.01"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Cost Price (₹)"
                    type="number"
                    value={formData.costPriceCents / 100}
                    onChange={(e) => set('costPriceCents', Math.round(parseFloat(e.target.value) * 100) || 0)}
                    size="small"
                    placeholder="0.00"
                    step="0.01"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Currency</InputLabel>
                    <Select value={formData.currency} onChange={(e) => set('currency', e.target.value)} label="Currency">
                      <MenuItem value="INR">₹ INR</MenuItem>
                      <MenuItem value="USD">$ USD</MenuItem>
                      <MenuItem value="EUR">€ EUR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {discountPercent > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Discount:</strong> {discountPercent}% off
                    ({' ₹'}{((formData.compareAtPriceCents - formData.priceCents) / 100).toFixed(2)} saved)
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Inventory */}
            <Box sx={sectionStyle}>
              <Box sx={labelStyle}>
                <InventoryIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                Inventory
              </Box>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.trackInventory}
                      onChange={(e) => set('trackInventory', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Track Inventory"
                />
                {formData.trackInventory && (
                  <>
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={(e) => set('stockQuantity', parseInt(e.target.value) || 0)}
                      size="small"
                      placeholder="0"
                      min="0"
                    />
                    <TextField
                      fullWidth
                      label="Low Stock Threshold"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => set('lowStockThreshold', parseInt(e.target.value) || 0)}
                      size="small"
                      placeholder="10"
                      min="0"
                    />
                  </>
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allowBackorder}
                      onChange={(e) => set('allowBackorder', e.target.checked)}
                      size="small"
                    />
                  }
                  label="Allow Backorder"
                />
              </Stack>
            </Box>

            {/* Product Images */}
            <Box sx={sectionStyle}>
              <Box sx={labelStyle}>
                <ImageIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                Product Images
              </Box>
              <Stack spacing={3}>
                <Typography variant="body2" fontWeight={600}>
                  Main Image
                </Typography>
                {formData.images.length > 0 && formData.images[0] && (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img
                      src={formData.images[0].url}
                      alt="Main"
                      style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Chip
                      label="Primary"
                      icon={<FeaturedIcon />}
                      sx={{ position: 'absolute', top: 8, right: 8 }}
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}
                <ImageCropUpload
                  value={formData.images.length > 0 ? formData.images[0].url : ''}
                  onChange={handleImageAdd}
                  folder="products"
                  cropAspectRatio={1}
                  width={300}
                  height={300}
                  label={formData.images.length > 0 ? 'Change Main Image' : 'Add Main Image'}
                />

                {/* Gallery */}
                {formData.images.length > 1 && (
                  <>
                    <Typography variant="body2" fontWeight={600} sx={{ mt: 2 }}>
                      Gallery Images ({formData.images.length - 1}/10)
                    </Typography>
                    <Grid container spacing={1}>
                      {formData.images.slice(1).map((img, idx) => (
                        <Grid item xs={4} key={idx + 1}>
                          <Box sx={{ position: 'relative' }}>
                            <img
                              src={img.url}
                              alt={`Gallery ${idx + 1}`}
                              style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4 }}
                            />
                            <Box sx={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleImageSetPrimary(idx + 1)}
                                sx={{ bgcolor: 'rgba(255,255,255,0.8)', p: 0.5 }}
                              >
                                <FeaturedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleImageRemove(idx + 1)}
                                sx={{ bgcolor: 'rgba(255,255,255,0.8)', p: 0.5 }}
                              >
                                <DeleteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {formData.images.length < 11 && (
                  <ImageCropUpload
                    value=""
                    onChange={handleImageAdd}
                    folder="products"
                    cropAspectRatio={1}
                    width={200}
                    height={200}
                    label={`Add Gallery Image (${Math.max(0, formData.images.length - 1)}/10)`}
                  />
                )}
              </Stack>
            </Box>

            {/* Dynamic Attributes */}
            {attributesData.length > 0 && (
              <Box sx={sectionStyle}>
                <Box sx={labelStyle}>
                  <TagIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  Attributes
                </Box>
                <Stack spacing={2}>
                  {attributesData.map(attr => (
                    <Box key={attr.id}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        {attr.label}
                        {attr.required && <span style={{ color: '#EF4444' }}>*</span>}
                      </Typography>
                      {attr.type === 'text' && (
                        <TextField
                          fullWidth
                          size="small"
                          value={formData.attributes[attr.key] || ''}
                          onChange={(e) => set('attributes', { ...formData.attributes, [attr.key]: e.target.value })}
                          placeholder={`Enter ${attr.label.toLowerCase()}`}
                        />
                      )}
                      {attr.type === 'textarea' && (
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={3}
                          value={formData.attributes[attr.key] || ''}
                          onChange={(e) => set('attributes', { ...formData.attributes, [attr.key]: e.target.value })}
                          placeholder={`Enter ${attr.label.toLowerCase()}`}
                        />
                      )}
                      {attr.type === 'select' && (
                        <FormControl fullWidth size="small">
                          <Select
                            value={formData.attributes[attr.key] || ''}
                            onChange={(e) => set('attributes', { ...formData.attributes, [attr.key]: e.target.value })}
                          >
                            {attr.options?.map(opt => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      {attr.type === 'multiselect' && (
                        <FormControl fullWidth size="small">
                          <Select
                            multiple
                            value={formData.attributes[attr.key] ? (Array.isArray(formData.attributes[attr.key]) ? formData.attributes[attr.key] : []) : []}
                            onChange={(e) => set('attributes', { ...formData.attributes, [attr.key]: e.target.value })}
                          >
                            {attr.options?.map(opt => (
                              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      {attr.type === 'number' && (
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          value={formData.attributes[attr.key] || ''}
                          onChange={(e) => set('attributes', { ...formData.attributes, [attr.key]: e.target.value })}
                          placeholder={`Enter ${attr.label.toLowerCase()}`}
                        />
                      )}
                      {attr.type === 'color' && (
                        <TextField
                          fullWidth
                          size="small"
                          type="color"
                          value={formData.attributes[attr.key] || '#000000'}
                          onChange={(e) => set('attributes', { ...formData.attributes, [attr.key]: e.target.value })}
                        />
                      )}
                      {attr.type === 'boolean' && (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.attributes[attr.key] === true}
                              onChange={(e) => set('attributes', { ...formData.attributes, [attr.key]: e.target.checked })}
                            />
                          }
                          label={attr.label}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {/* SEO Section */}
            <Box sx={sectionStyle}>
              <Box
                onClick={() => toggleSection('seo')}
                sx={{
                  ...labelStyle,
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  SEO Settings
                </Box>
                {expandedSections.seo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Collapse in={expandedSections.seo}>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    value={formData.seoTitle}
                    onChange={(e) => set('seoTitle', e.target.value)}
                    size="small"
                    placeholder="SEO title (60 chars)"
                    helperText={`${formData.seoTitle.length}/60`}
                  />
                  <TextField
                    fullWidth
                    label="Meta Description"
                    value={formData.seoDescription}
                    onChange={(e) => set('seoDescription', e.target.value)}
                    size="small"
                    multiline
                    rows={2}
                    placeholder="SEO description (160 chars)"
                    helperText={`${formData.seoDescription.length}/160`}
                  />
                  <TextField
                    fullWidth
                    label="Meta Keywords"
                    value={formData.seoKeywords}
                    onChange={(e) => set('seoKeywords', e.target.value)}
                    size="small"
                    placeholder="comma, separated, keywords"
                  />
                </Stack>
              </Collapse>
            </Box>

            {/* Shipping Section */}
            <Box sx={sectionStyle}>
              <Box
                onClick={() => toggleSection('shipping')}
                sx={{
                  ...labelStyle,
                  cursor: 'pointer',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PackageIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  Shipping
                </Box>
                {expandedSections.shipping ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Box>
              <Collapse in={expandedSections.shipping}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => set('weight', e.target.value)}
                      size="small"
                      step="0.1"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Length (cm)"
                      type="number"
                      value={formData.length}
                      onChange={(e) => set('length', e.target.value)}
                      size="small"
                      step="0.1"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Width (cm)"
                      type="number"
                      value={formData.width}
                      onChange={(e) => set('width', e.target.value)}
                      size="small"
                      step="0.1"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Height (cm)"
                      type="number"
                      value={formData.height}
                      onChange={(e) => set('height', e.target.value)}
                      size="small"
                      step="0.1"
                    />
                  </Grid>
                </Grid>
              </Collapse>
            </Box>

            {/* Variants Section */}
            {formData.variants.length > 0 && (
              <Box sx={sectionStyle}>
                <Box sx={labelStyle}>
                  <TagIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  Variants ({formData.variants.length})
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                        <TableCell>Title</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell>Price (₹)</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.variants.map((variant, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{variant.title}</TableCell>
                          <TableCell>{variant.sku}</TableCell>
                          <TableCell>{(variant.priceCents / 100).toFixed(2)}</TableCell>
                          <TableCell>{variant.stockQuantity}</TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={() => openVariantDialog(idx)}>
                              <EditIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton size="small" onClick={() => deleteVariant(idx)}>
                              <DeleteIcon sx={{ fontSize: 16, color: 'error.main' }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => openVariantDialog()}
                  sx={{ mt: 2 }}
                  size="small"
                >
                  Add Variant
                </Button>
              </Box>
            )}
          </div>

          {/* Right Column Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Status & Visibility */}
            <Box sx={sectionStyle}>
              <Box sx={labelStyle}>
                <VisibilityIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                Publishing
              </Box>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} onChange={(e) => set('status', e.target.value)} label="Status">
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.featured}
                      onChange={(e) => set('featured', e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><FeaturedIcon sx={{ fontSize: 16, color: '#F59E0B' }} /><Typography variant="body2">Featured</Typography></Box>}
                />
              </Stack>
            </Box>

            {/* Categories */}
            <Box sx={sectionStyle}>
              <Box sx={labelStyle}>
                <PackageIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                Categories
              </Box>
              {errors.categories && <Alert severity="error" sx={{ mb: 1 }}>{errors.categories}</Alert>}
              <CategoryTree
                categories={categoriesData}
                selectedIds={formData.categoryIds}
                onToggle={(catId) => {
                  const updated = formData.categoryIds.includes(catId)
                    ? formData.categoryIds.filter(id => id !== catId)
                    : [...formData.categoryIds, catId];
                  set('categoryIds', updated);
                }}
              />
            </Box>

            {/* Tags */}
            <Box sx={sectionStyle}>
              <Box sx={labelStyle}>
                <TagIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                Tags
              </Box>
              <Stack spacing={2}>
                {tagsData.map(tag => (
                  <FormControlLabel
                    key={tag.id}
                    control={
                      <Switch
                        checked={formData.tagIds.includes(tag.id)}
                        onChange={() => {
                          const updated = formData.tagIds.includes(tag.id)
                            ? formData.tagIds.filter(id => id !== tag.id)
                            : [...formData.tagIds, tag.id];
                          set('tagIds', updated);
                        }}
                        size="small"
                      />
                    }
                    label={<Chip label={tag.name} size="small" sx={{ bgcolor: tag.color || '#EFF6FF', color: '#2563EB' }} />}
                  />
                ))}
              </Stack>
            </Box>
          </div>
        </div>
      </Box>

      {/* Variant Dialog */}
      <Dialog open={variantDialog.open} onClose={closeVariantDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{variantDialog.editIndex !== null ? 'Edit Variant' : 'Add Variant'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Variant Title"
              value={variantDialog.data.title || ''}
              onChange={(e) => setVariantDialog(prev => ({ ...prev, data: { ...prev.data, title: e.target.value } }))}
              size="small"
              placeholder="e.g., Red / Large"
            />
            <TextField
              fullWidth
              label="SKU"
              value={variantDialog.data.sku || ''}
              onChange={(e) => setVariantDialog(prev => ({ ...prev, data: { ...prev.data, sku: e.target.value } }))}
              size="small"
              placeholder="SKU-VARIANT-001"
            />
            <TextField
              fullWidth
              label="Price (₹)"
              type="number"
              value={(variantDialog.data.priceCents || 0) / 100}
              onChange={(e) => setVariantDialog(prev => ({ ...prev, data: { ...prev.data, priceCents: Math.round(parseFloat(e.target.value) * 100) } }))}
              size="small"
              step="0.01"
            />
            <TextField
              fullWidth
              label="Stock Quantity"
              type="number"
              value={variantDialog.data.stockQuantity || 0}
              onChange={(e) => setVariantDialog(prev => ({ ...prev, data: { ...prev.data, stockQuantity: parseInt(e.target.value) || 0 } }))}
              size="small"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={variantDialog.data.active !== false}
                  onChange={(e) => setVariantDialog(prev => ({ ...prev, data: { ...prev.data, active: e.target.checked } }))}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeVariantDialog}>Cancel</Button>
          <Button onClick={saveVariant} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductEditor;
