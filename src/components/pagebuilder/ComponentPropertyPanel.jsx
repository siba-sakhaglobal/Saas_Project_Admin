import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Palette,
  Type,
  Image,
  Link,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Code,
  Sliders
} from 'lucide-react';

const ComponentPropertyPanel = ({
  component,
  onUpdateComponent,
  onSaveComponent,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('content');
  const [formData, setFormData] = useState({
    content: {},
    settings: {},
    dataSourceConfig: {}
  });
  const [isDirty, setIsDirty] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (component) {
      setFormData({
        content: component.content || {},
        settings: component.settings || {},
        dataSourceConfig: component.dataSourceConfig || {}
      });
      setIsDirty(false);
    }
  }, [component]);

  const handleFieldChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  const handleNestedFieldChange = (section, parentField, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value
        }
      }
    }));
    setIsDirty(true);
  };

  const handleArrayFieldChange = (section, field, index, value) => {
    setFormData(prev => {
      const newArray = [...(prev[section][field] || [])];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
    setIsDirty(true);
  };

  const handleAddArrayItem = (section, field, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...(prev[section][field] || []), defaultItem]
      }
    }));
    setIsDirty(true);
  };

  const handleRemoveArrayItem = (section, field, index) => {
    setFormData(prev => {
      const newArray = [...(prev[section][field] || [])];
      newArray.splice(index, 1);
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray
        }
      };
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    const updatedComponent = {
      ...component,
      content: formData.content,
      settings: formData.settings,
      dataSourceConfig: formData.dataSourceConfig
    };

    onUpdateComponent(updatedComponent);
    if (onSaveComponent) {
      onSaveComponent(updatedComponent);
    }
    setIsDirty(false);
  };

  const handlePreviewData = async () => {
    if (component.dataSource === 'database' && component.dataSourceConfig?.endpoint) {
      // TODO: Fetch preview data from API
      setPreviewData({ loading: true });
    }
  };

  const renderContentFields = () => {
    if (!component) return null;

    const { type } = component;
    const content = formData.content;

    switch (type) {
      case 'hero':
      case 'about_hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleFieldChange('content', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter hero title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={content.subtitle || ''}
                onChange={(e) => handleFieldChange('content', 'subtitle', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter hero subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={content.buttonText || ''}
                onChange={(e) => handleFieldChange('content', 'buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Get Started"
              />
            </div>
            {type === 'hero' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slides</label>
                {(content.slides || []).map((slide, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Slide {index + 1}</span>
                      <button
                        onClick={() => handleRemoveArrayItem('content', 'slides', index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={(e) => handleArrayFieldChange('content', 'slides', index, { ...slide, title: e.target.value })}
                      placeholder="Slide title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                    />
                    <input
                      type="text"
                      value={slide.subtitle || ''}
                      onChange={(e) => handleArrayFieldChange('content', 'slides', index, { ...slide, subtitle: e.target.value })}
                      placeholder="Slide subtitle"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
                <button
                  onClick={() => handleAddArrayItem('content', 'slides', { id: Date.now(), title: '', subtitle: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Add Slide
                </button>
              </div>
            )}
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleFieldChange('content', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Our Impact in Numbers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statistics</label>
              {(content.stats || []).map((stat, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Stat {index + 1}</span>
                    <button
                      onClick={() => handleRemoveArrayItem('content', 'stats', index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={stat.number || ''}
                      onChange={(e) => handleArrayFieldChange('content', 'stats', index, { ...stat, number: e.target.value })}
                      placeholder="1000+"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={stat.label || ''}
                      onChange={(e) => handleArrayFieldChange('content', 'stats', index, { ...stat, label: e.target.value })}
                      placeholder="Lives Transformed"
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={() => handleAddArrayItem('content', 'stats', { number: '', label: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Add Statistic
              </button>
            </div>
          </div>
        );

      case 'blog_list':
      case 'events':
      case 'campaigns':
      case 'team':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleFieldChange('content', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
              <input
                type="text"
                value={content.subtitle || ''}
                onChange={(e) => handleFieldChange('content', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Items to Show</label>
              <input
                type="number"
                value={content.showCount || 6}
                onChange={(e) => handleFieldChange('content', 'showCount', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
              <input
                type="text"
                value={content.buttonText || ''}
                onChange={(e) => handleFieldChange('content', 'buttonText', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="View All"
              />
            </div>
            {type === 'team' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <select
                  value={content.filterByCategory || ''}
                  onChange={(e) => handleFieldChange('content', 'filterByCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="executive">Executive Team</option>
                  <option value="advisory">Advisory Board</option>
                  <option value="volunteers">Volunteers</option>
                </select>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={content.title || ''}
                onChange={(e) => handleFieldChange('content', 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={content.description || ''}
                onChange={(e) => handleFieldChange('content', 'description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        );
    }
  };

  const renderSettingsFields = () => {
    const settings = formData.settings;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={settings.backgroundColor || '#ffffff'}
              onChange={(e) => handleFieldChange('settings', 'backgroundColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.backgroundColor || '#ffffff'}
              onChange={(e) => handleFieldChange('settings', 'backgroundColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="#ffffff"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
          <div className="flex space-x-2">
            <input
              type="color"
              value={settings.textColor || '#333333'}
              onChange={(e) => handleFieldChange('settings', 'textColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.textColor || '#333333'}
              onChange={(e) => handleFieldChange('settings', 'textColor', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="#333333"
            />
          </div>
        </div>

        {component?.type === 'hero' && (
          <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoPlay"
                checked={settings.autoPlay || false}
                onChange={(e) => handleFieldChange('settings', 'autoPlay', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="autoPlay" className="text-sm font-medium text-gray-700">
                Auto-play slides
              </label>
            </div>
            {settings.autoPlay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slide Interval (seconds)
                </label>
                <input
                  type="number"
                  value={(settings.slideInterval || 5000) / 1000}
                  onChange={(e) => handleFieldChange('settings', 'slideInterval', parseInt(e.target.value) * 1000)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>
            )}
          </>
        )}

        {component?.type === 'stats' && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="animateCounters"
              checked={settings.animateCounters || false}
              onChange={(e) => handleFieldChange('settings', 'animateCounters', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="animateCounters" className="text-sm font-medium text-gray-700">
              Animate counters
            </label>
          </div>
        )}
      </div>
    );
  };

  const renderDataSourceFields = () => {
    if (component?.dataSource !== 'database') {
      return (
        <div className="text-center py-8">
          <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">This component uses static data</p>
        </div>
      );
    }

    const config = formData.dataSourceConfig;

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-800">Database Configuration</h4>
          </div>
          <p className="text-sm text-blue-700">
            This component automatically loads data from your database.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data Source Table</label>
          <input
            type="text"
            value={config.table || ''}
            onChange={(e) => handleFieldChange('dataSourceConfig', 'table', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            disabled
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={config.endpoint || ''}
              onChange={(e) => handleFieldChange('dataSourceConfig', 'endpoint', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={handlePreviewData}
              className="px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100"
              title="Test API"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
            <input
              type="number"
              value={config.limit || 6}
              onChange={(e) => handleFieldChange('dataSourceConfig', 'limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min="1"
              max="50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order By</label>
            <input
              type="text"
              value={config.orderBy || ''}
              onChange={(e) => handleFieldChange('dataSourceConfig', 'orderBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="created_at"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filters</label>
          {(config.filters || []).map((filter, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={filter}
                onChange={(e) => handleArrayFieldChange('dataSourceConfig', 'filters', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="status=published"
              />
              <button
                onClick={() => handleRemoveArrayItem('dataSourceConfig', 'filters', index)}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => handleAddArrayItem('dataSourceConfig', 'filters', '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Add Filter
          </button>
        </div>

        {previewData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">API Preview</h4>
            {previewData.loading ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!component) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'content', name: 'Content', icon: Type },
    { id: 'settings', name: 'Settings', icon: Sliders },
    ...(component.dataSource === 'database' ? [{ id: 'data', name: 'Data Source', icon: Database }] : [])
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Component Properties</h3>
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-800">{component.name}</h4>
          <p className="text-sm text-gray-600">{component.type}</p>
          {component.dataSource === 'database' && (
            <div className="flex items-center space-x-1 mt-2">
              <Database className="w-4 h-4 text-green-600" />
              <span className="text-xs text-green-600 font-medium">Dynamic Component</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && renderContentFields()}
        {activeTab === 'settings' && renderSettingsFields()}
        {activeTab === 'data' && renderDataSourceFields()}
      </div>

      {/* Footer */}
      {isDirty && (
        <div className="p-4 border-t border-gray-200 bg-yellow-50">
          <div className="flex items-center space-x-2 text-sm text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span>You have unsaved changes</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentPropertyPanel;