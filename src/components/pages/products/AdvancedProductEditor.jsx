import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  X,
  AlertCircle,
  Package,
  Plus,
  Tag,
  IndianRupee,
  BarChart3,
  CheckCircle,
  Info,
  Sparkles,
  ShoppingCart
} from 'lucide-react';
import cms from '../../../services/cms';
import ImageCropUpload from '../../common/ImageCropUpload';

const AdvancedProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    image_id: null,
    image_url: '',
    stock_quantity: 0,
    is_active: true,
    meta_title: '',
    meta_description: '',
    tags: [],
    discount_percentage: 0,
    sku: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, slugManuallyEdited]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await cms.products.get(id);
      const product = response.data;

      // Build image URL if image exists
      let imageUrl = '';
      if (product.image_filename) {
        imageUrl = `/uploads/${product.image_filename}`;
      }

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        image_id: product.image_id || null,
        image_url: imageUrl,
        stock_quantity: product.stock_quantity || 0,
        is_active: product.is_active !== undefined ? product.is_active : true,
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        tags: product.tags ? (typeof product.tags === 'string' ? JSON.parse(product.tags) : product.tags) : [],
        discount_percentage: product.discount_percentage || 0,
        sku: product.sku || ''
      });

      // Mark slug as manually edited if editing existing product
      setSlugManuallyEdited(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await cms.products.listCategories();
      const categoriesData = response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const handleImageChange = (imageUrl, mediaId) => {
    setFormData(prev => ({
      ...prev,
      image_url: imageUrl,
      image_id: mediaId
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errors.price = 'Price must be a positive number';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (formData.discount_percentage < 0 || formData.discount_percentage > 100) {
      errors.discount_percentage = 'Discount must be between 0 and 100';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        tags: JSON.stringify(formData.tags || [])
      };

      let response;
      if (isEdit) {
        response = await cms.products.update(id, submitData);
      } else {
        response = await cms.products.create(submitData);
      }

      setSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      setTimeout(() => {
        navigate('/products');
      }, 1500);
    } catch (err) {
      console.error('Error saving product:', err);
      if (err.response?.data?.details) {
        const backendErrors = {};
        err.response.data.details.forEach(detail => {
          backendErrors[detail.path] = detail.msg;
        });
        setValidationErrors(backendErrors);
        setError('Please fix the validation errors');
      } else {
        setError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} product`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Mark slug as manually edited if user changes it
    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      return;
    }

    const trimmedCategory = newCategoryName.trim();
    if (!categories.includes(trimmedCategory)) {
      setCategories(prev => [...prev, trimmedCategory].sort());
      setFormData(prev => ({ ...prev, category: trimmedCategory }));
    }

    setNewCategoryName('');
    setShowNewCategoryInput(false);
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

  const calculateDiscountedPrice = () => {
    if (formData.price && formData.discount_percentage) {
      const discounted = formData.price * (1 - formData.discount_percentage / 100);
      return discounted.toFixed(2);
    }
    return formData.price;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/products')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Package className="mr-2 h-6 w-6 text-blue-600" />
                  {isEdit ? 'Edit Product' : 'Create New Product'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isEdit ? 'Update product information' : 'Add a new product to your catalog'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                Basic Information
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Enter product name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.slug ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="product-url-slug"
                    />
                    {validationErrors.slug && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Auto-generated from name (can be edited)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="Describe your product..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="PRD-001"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-green-600" />
                Pricing & Inventory
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (INR) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {validationErrors.price && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount_percentage"
                      value={formData.discount_percentage}
                      onChange={handleInputChange}
                      className={`w-full pr-8 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.discount_percentage ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="0"
                      min="0"
                      max="100"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  {formData.discount_percentage > 0 && (
                    <p className="mt-1 text-sm text-green-600">
                      Final Price: ₹{calculateDiscountedPrice()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center mt-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition"
                    />
                    <label className="ml-3 text-sm text-gray-700">
                      Product is active and visible to customers
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-purple-600" />
                Tags
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Category */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                Category *
              </h2>

              <div className="space-y-3">
                {!showNewCategoryInput ? (
                  <>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        validationErrors.category ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category && (
                      <p className="text-sm text-red-600">{validationErrors.category}</p>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Category
                    </button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewCategory())}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New category name..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryName('');
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Image */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-yellow-600" />
                Product Image
              </h2>

              <ImageCropUpload
                value={formData.image_url}
                onChange={handleImageChange}
                folder="products"
                cropAspectRatio={1}
                width={400}
                placeholder="Upload Product Image"
              />
            </div>

            {/* SEO */}
            <div className="bg-white shadow-sm rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
                SEO Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="SEO optimized title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="SEO meta description..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.meta_description.length}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdvancedProductEditor;