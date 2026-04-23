import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Type, 
  Image, 
  Palette, 
  Layout, 
  Eye,
  Code2,
  ChevronDown,
  ChevronRight,
  X,
  Plus
} from 'lucide-react';

const PropertyPanel = ({ page, selectedSection, onPageUpdate, onSectionUpdate }) => {
  const [activeTab, setActiveTab] = useState('settings');
  const [expandedGroups, setExpandedGroups] = useState({
    content: true,
    styling: true,
    layout: true,
    advanced: false
  });

  useEffect(() => {
    if (selectedSection) {
      setActiveTab('settings');
    } else {
      setActiveTab('page');
    }
  }, [selectedSection]);

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const updatePageField = (field, value) => {
    onPageUpdate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateSectionContent = (field, value) => {
    if (!selectedSection) return;
    
    const newContent = {
      ...selectedSection.content,
      [field]: value
    };
    
    onSectionUpdate(selectedSection.id, { content: newContent });
  };

  const updateSectionSettings = (field, value) => {
    if (!selectedSection) return;
    
    const newSettings = {
      ...selectedSection.settings,
      [field]: value
    };
    
    onSectionUpdate(selectedSection.id, { settings: newSettings });
  };

  const renderPageSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Page Title *
        </label>
        <input
          type="text"
          value={page?.title || ''}
          onChange={(e) => updatePageField('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter page title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Slug *
        </label>
        <input
          type="text"
          value={page?.slug || ''}
          onChange={(e) => updatePageField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="page-url-slug"
        />
        <p className="text-xs text-gray-500 mt-1">
          URL: /pages/{page?.slug || 'page-url-slug'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={page?.status || 'draft'}
          onChange={(e) => updatePageField('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Title
        </label>
        <input
          type="text"
          value={page?.meta_title || ''}
          onChange={(e) => updatePageField('meta_title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="SEO title"
          maxLength={60}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(page?.meta_title || '').length}/60 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Meta Description
        </label>
        <textarea
          value={page?.meta_description || ''}
          onChange={(e) => updatePageField('meta_description', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="SEO description"
          rows={3}
          maxLength={160}
        />
        <p className="text-xs text-gray-500 mt-1">
          {(page?.meta_description || '').length}/160 characters
        </p>
      </div>
    </div>
  );

  const renderSectionSettings = () => {
    if (!selectedSection) return null;

    return (
      <div className="space-y-6">
        {/* Content Group */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleGroup('content')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Type className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Content</span>
            </div>
            {expandedGroups.content ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedGroups.content && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {selectedSection.content && Object.keys(selectedSection.content).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  {key.includes('content') || key.includes('description') || key.includes('message') ? (
                    <textarea
                      value={selectedSection.content[key] || ''}
                      onChange={(e) => updateSectionContent(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      rows={3}
                    />
                  ) : (
                    <input
                      type="text"
                      value={selectedSection.content[key] || ''}
                      onChange={(e) => updateSectionContent(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Styling Group */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleGroup('styling')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Palette className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Styling</span>
            </div>
            {expandedGroups.styling ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedGroups.styling && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={selectedSection.settings?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateSectionSettings('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedSection.settings?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateSectionSettings('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={selectedSection.settings?.textColor || '#000000'}
                    onChange={(e) => updateSectionSettings('textColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedSection.settings?.textColor || '#000000'}
                    onChange={(e) => updateSectionSettings('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Alignment
                </label>
                <select
                  value={selectedSection.settings?.textAlign || 'left'}
                  onChange={(e) => updateSectionSettings('textAlign', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Layout Group */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleGroup('layout')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Layout className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Layout</span>
            </div>
            {expandedGroups.layout ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedGroups.layout && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding Top
                  </label>
                  <select
                    value={selectedSection.settings?.paddingTop || 'py-16'}
                    onChange={(e) => updateSectionSettings('paddingTop', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="py-0">None</option>
                    <option value="py-4">Small</option>
                    <option value="py-8">Medium</option>
                    <option value="py-16">Large</option>
                    <option value="py-24">Extra Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Padding Bottom
                  </label>
                  <select
                    value={selectedSection.settings?.paddingBottom || 'py-16'}
                    onChange={(e) => updateSectionSettings('paddingBottom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="py-0">None</option>
                    <option value="py-4">Small</option>
                    <option value="py-8">Medium</option>
                    <option value="py-16">Large</option>
                    <option value="py-24">Extra Large</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Container Width
                </label>
                <select
                  value={selectedSection.settings?.containerWidth || 'container'}
                  onChange={(e) => updateSectionSettings('containerWidth', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="container">Default Container</option>
                  <option value="max-w-2xl">Small (2XL)</option>
                  <option value="max-w-4xl">Medium (4XL)</option>
                  <option value="max-w-6xl">Large (6XL)</option>
                  <option value="max-w-full">Full Width</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Advanced Group */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleGroup('advanced')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Code2 className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium">Advanced</span>
            </div>
            {expandedGroups.advanced ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
          
          {expandedGroups.advanced && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSS Classes
                </label>
                <input
                  type="text"
                  value={selectedSection.settings?.cssClasses || ''}
                  onChange={(e) => updateSectionSettings('cssClasses', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional CSS classes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section ID
                </label>
                <input
                  type="text"
                  value={selectedSection.settings?.sectionId || ''}
                  onChange={(e) => updateSectionSettings('sectionId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Unique section ID"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lazyLoad"
                  checked={selectedSection.settings?.lazyLoad || false}
                  onChange={(e) => updateSectionSettings('lazyLoad', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="lazyLoad" className="ml-2 text-sm text-gray-700">
                  Enable lazy loading
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const tabs = selectedSection ? [
    { id: 'settings', name: 'Section Settings', icon: SettingsIcon },
  ] : [
    { id: 'page', name: 'Page Settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            {selectedSection ? 'Section Properties' : 'Page Properties'}
          </h2>
          {selectedSection && (
            <button
              onClick={() => onSectionUpdate(selectedSection.id, null)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Close section editor"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {selectedSection && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              {selectedSection.type}
            </span>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'page' && renderPageSettings()}
        {activeTab === 'settings' && renderSectionSettings()}
      </div>

      {/* Footer */}
      {selectedSection && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Section ID: {selectedSection.id}</div>
            <div>Type: {selectedSection.type}</div>
            <div>Order: {selectedSection.order}</div>
            <div>Status: {selectedSection.is_active ? 'Visible' : 'Hidden'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;