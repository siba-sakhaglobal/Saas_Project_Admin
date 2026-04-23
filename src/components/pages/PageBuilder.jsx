import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cms from '../../services/cms';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import {
  Save,
  Eye,
  Undo2,
  Redo2,
  Settings as SettingsIcon,
  Smartphone,
  Tablet,
  Monitor,
  ArrowLeft,
  Plus,
  Database,
  RefreshCw
} from 'lucide-react';

import ComponentLibrary from '../pagebuilder/ComponentLibrary';
import ComponentCanvas from '../pagebuilder/ComponentCanvas';
import ComponentPropertyPanel from '../pagebuilder/ComponentPropertyPanel';
import { buildPreviewUrl } from '../../utils/previewRoutes';

const PageBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Page builder state
  const [page, setPage] = useState(null);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load page data if editing existing page
  const { data: pageData, isLoading } = useQuery({
    queryKey: ['page', id],
    queryFn: async () => {
      const { data } = await cms.raw().get(`/pages/${id}`);
      return data;
    },
    enabled: !!id
  });

  // Save page components mutation
  const savePageComponents = useMutation({
    mutationFn: async (data) => {
      const pagePayload = {
        ...page,
        ...data.pageData
      };

      let savedPageRes;
      if (id) {
        savedPageRes = await cms.raw().put(`/pages/${id}`, pagePayload);
      } else {
        savedPageRes = await cms.raw().post('/pages', pagePayload);
      }
      const savedPage = savedPageRes.data;

      // Save components as page sections
      const sectionsToSave = data.components.map((component, index) => ({
        page_id: savedPage.id,
        section_type: component.type,
        section_order: index,
        content: JSON.stringify(component.content),
        settings: JSON.stringify(component.settings),
        is_active: component.isActive,
        data_source: component.dataSource,
        data_source_config: component.dataSource === 'database' ? JSON.stringify(component.dataSourceConfig) : null
      }));

      // Clear existing sections and add new ones
      if (sectionsToSave.length > 0) {
        await cms.raw().put(`/pages/${savedPage.id}/sections`, { sections: sectionsToSave });
      }

      return savedPage;
    },
    onSuccess: (data) => {
      toast.success('Page saved successfully!');
      if (!id) {
        navigate(`/pages/builder/${data.id}`);
      }
      queryClient.invalidateQueries(['pages']);
      queryClient.invalidateQueries(['page', data.id]);
    },
    onError: (error) => {
      toast.error('Failed to save page: ' + error.message);
    }
  });

  // Initialize page data
  useEffect(() => {
    if (pageData) {
      setPage(pageData);

      // Convert sections to components
      const pageComponents = (pageData.sections || []).map(section => {
        let content, settings, dataSourceConfig;

        try {
          content = typeof section.content === 'string' ? JSON.parse(section.content) : section.content;
        } catch (e) {
          content = section.content || {};
        }

        try {
          settings = typeof section.settings === 'string' ? JSON.parse(section.settings) : section.settings;
        } catch (e) {
          settings = section.settings || {};
        }

        try {
          dataSourceConfig = section.data_source_config
            ? (typeof section.data_source_config === 'string' ? JSON.parse(section.data_source_config) : section.data_source_config)
            : {};
        } catch (e) {
          dataSourceConfig = {};
        }

        return {
          id: section.id || `component-${Date.now()}-${Math.random()}`,
          type: section.section_type,
          name: getComponentDisplayName(section.section_type),
          content,
          settings,
          dataSource: section.data_source || 'static',
          dataSourceConfig,
          order: section.section_order || 0,
          isActive: section.is_active !== false
        };
      }).sort((a, b) => a.order - b.order);

      setComponents(pageComponents);
      addToHistory(pageComponents);
    } else if (!id) {
      // New page
      const newPage = {
        title: 'New Page',
        slug: '',
        status: 'draft',
        meta_title: '',
        meta_description: ''
      };
      setPage(newPage);
      setComponents([]);
      addToHistory([]);
    }
  }, [pageData, id]);

  const getComponentDisplayName = (type) => {
    const names = {
      'hero': 'Hero Section',
      'about': 'About Section',
      'stats': 'Statistics',
      'blog_list': 'Blog Posts',
      'events': 'Events Grid',
      'campaigns': 'Donation Campaigns',
      'team': 'Team Members',
      'testimonials': 'Testimonials',
      'newsletter_signup': 'Newsletter Signup',
      'media_gallery': 'Media Gallery',
      'rich_text': 'Rich Text Block',
      'two_column_text': 'Two Column Text',
      'achievements': 'Achievements',
      'environment': 'Environment Section',
      'initiatives': 'Initiatives',
      'community': 'Community Section',
      'volunteer': 'Volunteer Section',
      'get_involved': 'Get Involved',
      'partners': 'Partners Section',
      'products_shop': 'Products Shop',
      'footer_policy': 'Footer Policy'
    };
    return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // History management
  const addToHistory = (newComponents) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newComponents)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Component management
  const addComponent = (componentData) => {
    const newComponent = {
      ...componentData,
      id: `component-${Date.now()}-${Math.random()}`,
      order: components.length
    };

    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedComponent(newComponent);

    toast.success(`${componentData.name} added to page`);
  };

  const updateComponent = (updatedComponent) => {
    const newComponents = components.map(component =>
      component.id === updatedComponent.id ? updatedComponent : component
    );
    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedComponent(updatedComponent);
  };

  const deleteComponent = (componentId) => {
    const newComponents = components.filter(component => component.id !== componentId);
    setComponents(newComponents);
    addToHistory(newComponents);

    if (selectedComponent?.id === componentId) {
      setSelectedComponent(null);
    }

    toast.success('Component deleted');
  };

  const duplicateComponent = (component) => {
    const duplicatedComponent = {
      ...component,
      id: `component-${Date.now()}-${Math.random()}`,
      name: `${component.name} (Copy)`,
      order: component.order + 1
    };

    const componentIndex = components.findIndex(c => c.id === component.id);
    const newComponents = [
      ...components.slice(0, componentIndex + 1),
      duplicatedComponent,
      ...components.slice(componentIndex + 1)
    ];

    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedComponent(duplicatedComponent);

    toast.success('Component duplicated');
  };

  const moveComponent = (fromIndex, toIndex) => {
    const newComponents = [...components];
    const [movedComponent] = newComponents.splice(fromIndex, 1);
    newComponents.splice(toIndex, 0, movedComponent);

    // Update order
    newComponents.forEach((component, index) => {
      component.order = index;
    });

    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const toggleComponent = (componentId) => {
    const newComponents = components.map(component =>
      component.id === componentId
        ? { ...component, isActive: !component.isActive }
        : component
    );
    setComponents(newComponents);
    addToHistory(newComponents);
  };

  const selectComponent = (component) => {
    setSelectedComponent(component);
  };

  // Save handlers
  const handleSave = () => {
    if (!page?.title?.trim()) {
      toast.error('Please enter a page title');
      return;
    }

    if (!page?.slug?.trim()) {
      toast.error('Please enter a page slug');
      return;
    }

    setIsSaving(true);
    savePageComponents.mutate({
      pageData: page,
      components: components
    });
  };

  const handleQuickSave = () => {
    if (id && page) {
      handleSave();
    }
  };

  // Page metadata handlers
  const updatePageMetadata = (field, value) => {
    setPage(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = () => {
    if (id) {
      const previewUrl = buildPreviewUrl(page.slug);
      window.open(previewUrl, '_blank');
    } else {
      toast.info('Save the page first to preview');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/pages')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pages</span>
          </button>

          <div className="border-l border-gray-300 pl-4">
            <div className="flex items-center space-x-4">
              <div>
                <input
                  type="text"
                  value={page?.title || ''}
                  onChange={(e) => updatePageMetadata('title', e.target.value)}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                  placeholder="Page Title"
                />
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">Slug:</span>
                  <input
                    type="text"
                    value={page?.slug || ''}
                    onChange={(e) => updatePageMetadata('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="text-sm bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
                    placeholder="page-slug"
                  />
                  <select
                    value={page?.status || 'draft'}
                    onChange={(e) => updatePageMetadata('status', e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'desktop'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'tablet'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'mobile'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="border-l border-gray-300 pl-2 ml-2">
              <button
                onClick={handlePreview}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={!id}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || savePageComponents.isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isSaving || savePageComponents.isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Library */}
        <ComponentLibrary
          onAddComponent={addComponent}
        />

        {/* Main Canvas */}
        <ComponentCanvas
          components={components}
          selectedComponent={selectedComponent}
          onSelectComponent={selectComponent}
          onDeleteComponent={deleteComponent}
          onDuplicateComponent={duplicateComponent}
          onMoveComponent={moveComponent}
          onToggleComponent={toggleComponent}
          viewMode={viewMode}
        />

        {/* Property Panel */}
        <ComponentPropertyPanel
          component={selectedComponent}
          onUpdateComponent={updateComponent}
          onSaveComponent={handleQuickSave}
          isLoading={isSaving}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>{components.length} components</span>
          {selectedComponent && (
            <span>• Selected: {selectedComponent.name}</span>
          )}
          {components.filter(c => c.dataSource === 'database').length > 0 && (
            <span className="flex items-center space-x-1">
              <Database className="w-4 h-4 text-green-600" />
              <span>{components.filter(c => c.dataSource === 'database').length} dynamic components</span>
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>View: {viewMode}</span>
          {(isSaving || savePageComponents.isLoading) && (
            <span className="flex items-center space-x-1 text-blue-600">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;