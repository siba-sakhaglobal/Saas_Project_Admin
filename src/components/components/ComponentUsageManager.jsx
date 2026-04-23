import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Copy,
  Edit,
  Eye,
  BarChart3,
  Grid,
  List,
  ChevronDown,
  Package,
  FileText,
  Users,
  Star
} from 'lucide-react';

const ComponentUsageManager = () => {
  const [componentUsage, setComponentUsage] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [reusableComponents, setReusableComponents] = useState([]);
  const [pageInventory, setPageInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'stats'

  // Filter states
  const [filters, setFilters] = useState({
    pageSlug: '',
    componentType: '',
    searchTerm: '',
    showOnlyReusable: false
  });

  const [filterOptions, setFilterOptions] = useState({
    pages: [],
    componentTypes: []
  });

  useEffect(() => {
    fetchComponentUsageData();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [componentUsage, filters]);

  const fetchComponentUsageData = async () => {
    try {
      setLoading(true);

      const [usageResponse, reusableResponse, inventoryResponse] = await Promise.all([
        fetch('/api/component-usage'),
        fetch('/api/component-usage/reusable'),
        fetch('/api/component-usage/inventory')
      ]);

      if (!usageResponse.ok || !reusableResponse.ok || !inventoryResponse.ok) {
        throw new Error('Failed to fetch component usage data');
      }

      const [usageData, reusableData, inventoryData] = await Promise.all([
        usageResponse.json(),
        reusableResponse.json(),
        inventoryResponse.json()
      ]);

      setComponentUsage(usageData.data || []);
      setReusableComponents(reusableData.data || []);
      setPageInventory(inventoryData.data || []);

    } catch (err) {
      console.error('Error fetching component usage data:', err);
      setError('Failed to load component usage data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/component-usage/filters');
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data.data);
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...componentUsage];

    // Filter by page
    if (filters.pageSlug) {
      filtered = filtered.filter(comp => comp.page_slug === filters.pageSlug);
    }

    // Filter by component type
    if (filters.componentType) {
      filtered = filtered.filter(comp => comp.component_type === filters.componentType);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(comp =>
        comp.component_name.toLowerCase().includes(searchLower) ||
        comp.page_title.toLowerCase().includes(searchLower)
      );
    }

    // Filter to show only reusable components
    if (filters.showOnlyReusable) {
      const reusableTypes = new Set(reusableComponents.map(rc => rc.component_type));
      filtered = filtered.filter(comp => reusableTypes.has(comp.component_type));
    }

    setFilteredComponents(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const duplicateComponent = async (sectionId, targetPageId, customizationNotes) => {
    try {
      const response = await fetch(`/api/component-usage/duplicate/${sectionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetPageId,
          customizationNotes
        })
      });

      if (response.ok) {
        await fetchComponentUsageData(); // Refresh data
        alert('Component duplicated successfully!');
      } else {
        throw new Error('Failed to duplicate component');
      }
    } catch (err) {
      console.error('Error duplicating component:', err);
      alert('Failed to duplicate component');
    }
  };

  const updateCustomization = async (usageId, isCustomized, customizationNotes) => {
    try {
      const response = await fetch(`/api/component-usage/customization/${usageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isCustomized,
          customizationNotes
        })
      });

      if (response.ok) {
        await fetchComponentUsageData(); // Refresh data
      } else {
        throw new Error('Failed to update customization');
      }
    } catch (err) {
      console.error('Error updating customization:', err);
      alert('Failed to update customization');
    }
  };

  const getComponentIcon = (componentType) => {
    const iconMap = {
      hero: Star,
      rich_text: FileText,
      testimonials: Users,
      stats: BarChart3,
      default: Package
    };
    return iconMap[componentType] || iconMap.default;
  };

  const ComponentCard = ({ component }) => {
    const IconComponent = getComponentIcon(component.component_type);

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <IconComponent className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">{component.component_name}</h3>
              <p className="text-sm text-gray-500">{component.component_type}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-green-600"
              title="Duplicate"
              onClick={() => {
                const targetPageId = prompt('Enter target page ID:');
                const notes = prompt('Customization notes (optional):');
                if (targetPageId) {
                  duplicateComponent(component.section_id, targetPageId, notes);
                }
              }}
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              className="p-1 text-gray-400 hover:text-purple-600"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Page:</span>
            <span className="font-medium">{component.page_title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Order:</span>
            <span className="font-medium">#{component.section_order}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Data Source:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              component.data_source === 'database'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {component.data_source || 'static'}
            </span>
          </div>
          {component.is_customized && (
            <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
              Customized: {component.customization_notes}
            </div>
          )}
        </div>
      </div>
    );
  };

  const StatsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Most Reused Components</h3>
        <div className="space-y-3">
          {reusableComponents.slice(0, 5).map((comp, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{comp.component_name}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {comp.used_in_pages} pages
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Page Component Count</h3>
        <div className="space-y-3">
          {pageInventory.slice(0, 5).map((page, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{page.page_title}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                {page.component_count} components
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Components</span>
            <span className="font-semibold">{componentUsage.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Reusable Components</span>
            <span className="font-semibold">{reusableComponents.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Pages</span>
            <span className="font-semibold">{pageInventory.length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading component usage data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchComponentUsageData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Component Usage Manager</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('stats')}
            className={`px-3 py-2 rounded ${viewMode === 'stats' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Components
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Search components..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Page
            </label>
            <select
              value={filters.pageSlug}
              onChange={(e) => handleFilterChange('pageSlug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Pages</option>
              {filterOptions.pages.map(page => (
                <option key={page.page_slug} value={page.page_slug}>
                  {page.page_title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Component Type
            </label>
            <select
              value={filters.componentType}
              onChange={(e) => handleFilterChange('componentType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {filterOptions.componentTypes.map(type => (
                <option key={type.component_type} value={type.component_type}>
                  {type.component_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showOnlyReusable}
                onChange={(e) => handleFilterChange('showOnlyReusable', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show only reusable</span>
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'stats' ? (
        <StatsView />
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {filteredComponents.map((component) => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      )}

      {filteredComponents.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No components match your current filters.</p>
        </div>
      )}
    </div>
  );
};

export default ComponentUsageManager;