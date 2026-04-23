import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  IndianRupee,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  Tag,
  Grid,
  List,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import cms from '../../../services/cms';

const EnhancedProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });

  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, [pagination.current_page, searchTerm, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current_page,
        limit: pagination.per_page,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter
      };

      const response = await cms.products.list(params);
      const resData = response.data || {};
      const rawProducts = resData.products || (Array.isArray(resData) ? resData : []);
      const productsList = rawProducts.map(p => ({
        ...p,
        stock_quantity: p.stockQuantity ?? p.stock_quantity ?? 0,
        is_active: p.status === 'active',
        created_at: p.createdAt || p.created_at,
        mrp: p.compareAtPrice || p.compareAtPriceCents ? (p.compareAtPriceCents / 100).toString() : null,
        image_url: p.imageUrl || p.image_url,
      }));
      setProducts(productsList);
      const meta = response.meta || resData.meta || {};
      setPagination({
        current_page: meta.page || 1,
        per_page: meta.limit || 20,
        total: meta.total || productsList.length,
        total_pages: Math.ceil((meta.total || productsList.length) / (meta.limit || 20))
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
      setProducts([]);
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

  const fetchStats = async () => {
    try {
      const response = await cms.products.stats();
      const statsData = response.data || {};
      console.log('Stats response:', JSON.stringify(statsData));
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      try {
        await cms.products.delete(productId);
        fetchProducts();
        fetchStats();
        alert('Product deleted successfully');
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product');
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const PriceDisplay = ({ product }) => {
    const mrp = parseFloat(product.mrp || 0);
    const price = parseFloat(product.price || 0);
    const hasDiscount = mrp > price && mrp > 0;
    const discountPercent = hasDiscount ? Math.round(((mrp - price) / mrp) * 100) : 0;

    return (
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-slate-900 font-variant-numeric tabular-nums">{formatPrice(price)}</span>
          {hasDiscount && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </div>
        {hasDiscount && (
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-slate-500 line-through">{formatPrice(mrp)}</span>
            <span className="text-xs text-emerald-600 font-semibold">
              Save {formatPrice(mrp - price)}
            </span>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </span>
      );
    }
  };

  const getProductImageUrl = (product) => {
    return product.imageUrl || product.image_url || null;
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) {
      return { label: 'Out of Stock', color: 'text-red-700 bg-red-50' };
    } else if (quantity < 10) {
      return { label: 'Low Stock', color: 'text-amber-700 bg-amber-50' };
    }
    return { label: 'In Stock', color: 'text-emerald-700 bg-emerald-50' };
  };

  const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-600 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && (
            <p className="text-xs text-emerald-600 mt-2 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`${color} w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const imageUrl = getProductImageUrl(product);
        const stockStatus = getStockStatus(product.stock_quantity);

        return (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors group flex flex-col h-full"
          >
            {/* Product Image */}
            <div className="relative h-48 bg-slate-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-t-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4Ni43MzkgMTUwIDE3NS45NzggMTU1LjI2OCAxNjguMzIyIDE2Mi45MjlDMTYwLjY3OSAxNzAuNTc5IDE1NS4yNjggMTgxLjc4OSAxNTAgMTk1QzE1MCAyMDguMjYxIDE1NS4yNjggMjE5LjAyMSAxNjIuOTI5IDIyNi42NzhDMTcwLjU3OSAyMzQuMzIxIDE4MS43ODkgMjM5LjczMiAxOTUgMjQwSDIwNUMyMTguMjYxIDI0MCAyMjkuMDIxIDIzNC43MzIgMjM2LjY3OCAyMjcuMDcxQzI0NC4zMjEgMjE5LjQyMSAyNDkuNzMyIDIwOC4yMTEgMjUwIDE5NUMyNTAgMTgxLjczOSAyNDQuNzMyIDE3MC45NzkgMjM3LjA3MSAxNjMuMzIyQzIyOS40MjEgMTU1LjY3OSAyMTguMjExIDE1MC4yNjggMjA1IDE1MEgyMDBaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <Package className="h-16 w-16 text-slate-400" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {getStatusBadge(product.is_active)}
              </div>

              {/* Quick Actions - Show on Hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`edit/${product.id}`)}
                    className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="View"
                  >
                    <Eye className="h-4 w-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => navigate(`edit/${product.id}`)}
                    className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-grow">
              <div className="mb-3 flex-grow">
                <h3 className="font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-1 mt-1">{product.slug}</p>
              </div>

              {product.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 mb-3 w-fit">
                  <Tag className="h-3 w-3 mr-1" />
                  {product.category}
                </span>
              )}

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between">
                  <PriceDisplay product={product} />
                  <div className={`px-2 py-1 rounded text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.label}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Stock: {product.stock_quantity}</span>
                    <span>{formatDate(product.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {products.map((product) => {
              const imageUrl = getProductImageUrl(product);
              const stockStatus = getStockStatus(product.stock_quantity);

              return (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {imageUrl ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={imageUrl}
                            alt={product.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwQzE4Ni43MzkgMTUwIDE3NS45NzggMTU1LjI2OCAxNjguMzIyIDE2Mi45MjlDMTYwLjY3OSAxNzAuNTc5IDE1NS4yNjggMTgxLjc4OSAxNTAgMTk1QzE1MCAyMDguMjYxIDE1NS4yNjggMjE5LjAyMSAxNjIuOTI5IDIyNi42NzhDMTcwLjU3OSAyMzQuMzIxIDE4MS43ODkgMjM5LjczMiAxOTUgMjQwSDIwNUMyMTguMjYxIDI0MCAyMjkuMDIxIDIzNC43MzIgMjM2LjY3OCAyMjcuMDcxQzI0NC4zMjEgMjE5LjQyMSAyNDkuNzMyIDIwOC4yMTEgMjUwIDE5NUMyNTAgMTgxLjczOSAyNDQuNzMyIDE3MC45NzkgMjM3LjA3MSAxNjMuMzIyQzIyOS40MjEgMTU1LjY3OSAyMTguMjExIDE1MC4yNjggMjA1IDE1MEgyMDBaIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPg==';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.category ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                        <Tag className="h-3 w-3 mr-1" />
                        {product.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-variant-numeric">
                    <PriceDisplay product={product} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${stockStatus.color}`}>
                        {product.stock_quantity} units
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.is_active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => navigate(`edit/${product.id}`)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`edit/${product.id}`)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl border border-slate-200 p-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-600" />
        <h3 className="mt-3 text-sm font-semibold text-slate-900">Error</h3>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => navigate('categories')}
            className="inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Tag className="mr-2 h-4 w-4" />
            Manage Categories
          </button>

          <button
            onClick={() => navigate('new')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Products"
          value={stats.total_products || 0}
          icon={Package}
          color="bg-blue-600"
        />
        <StatsCard
          title="Active Products"
          value={stats.active_products || 0}
          icon={CheckCircle}
          color="bg-emerald-600"
        />
        <StatsCard
          title="Categories"
          value={stats.total_categories || 0}
          icon={Tag}
          color="bg-amber-600"
        />
        <StatsCard
          title="Average Price"
          value={stats.average_price ? formatPrice(stats.average_price) : '₹0'}
          icon={IndianRupee}
          color="bg-blue-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={handleCategoryFilter}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.filter(c => !c.parentId).map(category => (
              <option key={category.id || category} value={category.id || category}>
                {category.name || category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStatusFilter('');
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Products Display */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <Package className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No products found</h3>
          <p className="mt-2 text-sm text-slate-600">
            {searchTerm || categoryFilter || statusFilter
              ? 'Try adjusting your filters'
              : 'Get started by adding a new product'}
          </p>
          {!(searchTerm || categoryFilter || statusFilter) && (
            <button
              onClick={() => navigate('new')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? <GridView /> : <ListView />}

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.current_page - 1) * pagination.per_page + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    results
                  </p>
                </div>
                <div className="flex space-x-2">
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        page === pagination.current_page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedProductManager;