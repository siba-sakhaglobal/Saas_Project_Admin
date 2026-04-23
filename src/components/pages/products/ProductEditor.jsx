import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  Image as ImageIcon,
  Package
} from 'lucide-react';
import cms from '../../../services/cms';
import ImageCropUpload from '../../common/ImageCropUpload';

const ProductEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    image_id: '',
    image_url: '',
    gallery_images: [],
    stock_quantity: 0,
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchCategories();

    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEdit && formData.name && !formData.slug) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isEdit]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await cms.products.get(id);
      const product = response.data?.data || response.data;

      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        image_id: product.image_id || '',
        image_url: product.image_url || '',
        gallery_images: product.gallery_images || [],
        stock_quantity: product.stock_quantity || 0,
        is_active: product.is_active
      });

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
      // Ensure categories is always an array
      const categoriesData = response.data?.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]); // Set empty array on error
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
    } else if (formData.name.length > 200) {
      errors.name = 'Product name must be less than 200 characters';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    } else if (formData.slug.length > 200) {
      errors.slug = 'Slug must be less than 200 characters';
    }

    if (!formData.price) {
      errors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      errors.price = 'Price must be a positive number';
    }

    if (formData.description && formData.description.length > 10000) {
      errors.description = 'Description must be less than 10000 characters';
    }

    if (formData.category && formData.category.length > 100) {
      errors.category = 'Category must be less than 100 characters';
    }

    if (formData.stock_quantity < 0) {
      errors.stock_quantity = 'Stock quantity must be a non-negative number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        gallery_images: formData.gallery_images || []
      };

      let response;
      if (isEdit) {
        response = await cms.products.update(id, submitData);
      } else {
        response = await cms.products.create(submitData);
      }

      alert(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/products');
    } catch (err) {
      console.error('Error saving product:', err);
      if (err.response?.data?.details) {
        const backendErrors = {};
        err.response.data.details.forEach(detail => {
          backendErrors[detail.path] = detail.msg;
        });
        setValidationErrors(backendErrors);
      } else {
        setError(err.response?.data?.error || `Failed to ${isEdit ? 'update' : 'create'} product`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
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


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
                maxLength={200}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.slug ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="product-slug"
                maxLength={200}
              />
              {validationErrors.slug && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.slug}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                URL-friendly version of the name (lowercase, hyphens only)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (INR) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.price ? 'border-red-300' : 'border-gray-300'
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.stock_quantity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
              />
              {validationErrors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.stock_quantity}</p>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                list="categories"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter or select category"
                maxLength={100}
              />
              <datalist id="categories">
                {categories && categories.length > 0 && categories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active (visible to customers)
              </label>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter product description"
              maxLength={10000}
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/10000 characters
            </p>
          </div>
        </div>

        {/* Product Image */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Product Image</h2>

          <ImageCropUpload
            value={formData.image_url}
            onChange={handleImageChange}
            folder="products"
            cropAspectRatio={1}
            width={400}
            placeholder="Upload Product Image"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </form>
    </div>
  );
};

export default ProductEditor;