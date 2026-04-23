import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit3, 
  Eye, 
  Trash2, 
  Copy,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import LoadingSpinner from '../../common/LoadingSpinner';
import cms from '../../../services/cms';
import { toast } from 'react-toastify';
import { buildPreviewUrl } from '../../../utils/previewRoutes';

const PagesManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const queryClient = useQueryClient();

  // Load pages from API
  const { data: pages, isLoading, error } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const response = await cms.raw().get('/pages');
      return response.data;
    }
  });

  // Delete page mutation
  const deletePage = useMutation({
    mutationFn: (id) => cms.raw().delete(`/pages/${id}`),
    onSuccess: () => {
      toast.success('Page deleted successfully');
      queryClient.invalidateQueries(['pages']);
    },
    onError: (error) => {
      toast.error('Failed to delete page: ' + error.message);
    }
  });

  // Duplicate page mutation
  const duplicatePage = useMutation({
    mutationFn: ({ id, data }) => cms.raw().post(`/pages/${id}/duplicate`, data),
    onSuccess: () => {
      toast.success('Page duplicated successfully');
      queryClient.invalidateQueries(['pages']);
    },
    onError: (error) => {
      toast.error('Failed to duplicate page: ' + error.message);
    }
  });

  const filteredPages = pages?.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <MoreVertical className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load pages</h3>
        <p className="text-gray-500 mb-4">
          {error.message || 'An error occurred while loading pages.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pages</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your website pages and build new ones with the page builder.
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/pages/builder"
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Page
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {filteredPages.length} page{filteredPages.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Pages List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {page.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      /{page.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      page.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {page.sections?.length || page.sections_count || 0} sections
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {formatDate(page.updated_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {/* Preview */}
                      <button
                        onClick={() => {
                          const previewUrl = buildPreviewUrl(page.slug);
                          window.open(previewUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Preview page"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Edit */}
                      <Link
                        to={`/pages/builder/${page.id}`}
                        className="p-1 text-gray-500 hover:text-gray-700"
                        title="Edit page"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Link>

                      {/* Duplicate */}
                      <button
                        onClick={() => {
                          const newTitle = `${page.title} (Copy)`;
                          const newSlug = `${page.slug}-copy-${Date.now()}`;
                          duplicatePage.mutate({
                            id: page.id,
                            data: { title: newTitle, slug: newSlug }
                          });
                        }}
                        disabled={duplicatePage.isPending}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        title="Duplicate page"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${page.title}"? This action cannot be undone.`)) {
                            deletePage.mutate(page.id);
                          }
                        }}
                        disabled={deletePage.isPending}
                        className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Delete page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MoreVertical className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first page.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Link
                  to="/pages/builder"
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Page
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PagesManager;
