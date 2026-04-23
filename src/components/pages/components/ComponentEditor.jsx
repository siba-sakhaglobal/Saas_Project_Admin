import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Settings,
  FileText,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';

// Import the DynamicSectionRenderer for preview
import DynamicSectionRenderer from '../../common/DynamicSectionRenderer';

const ComponentEditor = () => {
  const { componentType } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');
  const [componentData, setComponentData] = useState({
    content: '',
    settings: '',
    rawData: ''
  });
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Component templates with default data
  const componentTemplates = useMemo(() => ({
    hero: {
      content: JSON.stringify({
        title: "Empowering Communities for a Better Tomorrow",
        subtitle: "Join us in creating meaningful change through education, healthcare, and sustainable development initiatives that transform lives and build stronger communities.",
        buttonText: "Get Involved",
        slides: [
          {
            id: 1,
            title: "Empowering Communities",
            subtitle: "Creating sustainable change through education"
          },
          {
            id: 2,
            title: "Transforming Lives",
            subtitle: "Healthcare and development for all"
          }
        ]
      }, null, 2),
      settings: JSON.stringify({
        backgroundColor: "#1e40af",
        textColor: "#ffffff"
      }, null, 2)
    },
    about: {
      content: JSON.stringify({
        title: "About Aahwahan Foundation",
        content: "<p>Aahwahan Foundation is dedicated to creating sustainable change in communities across the globe. Our mission is to empower individuals and communities through education, healthcare, environmental conservation, and economic development programs.</p>",
        features: [
          "Community-driven development programs",
          "Sustainable environmental initiatives",
          "Educational empowerment projects",
          "Healthcare accessibility programs"
        ]
      }, null, 2),
      settings: JSON.stringify({}, null, 2)
    },
    stats: {
      content: JSON.stringify({
        title: "Our Impact in Numbers",
        stats: [
          { number: "10,000+", label: "Lives Transformed" },
          { number: "500+", label: "Projects Completed" },
          { number: "50+", label: "Communities Served" },
          { number: "1000+", label: "Volunteers" }
        ]
      }, null, 2),
      settings: JSON.stringify({
        backgroundColor: "#1f2937",
        textColor: "#ffffff"
      }, null, 2)
    },
    rich_text: {
      content: JSON.stringify({
        title: "Rich Text Content",
        content: "<p>This is a rich text block where you can add HTML content. You can include <strong>bold text</strong>, <em>italic text</em>, and even <a href='#'>links</a>.</p><p>Add multiple paragraphs, lists, and other HTML elements to create engaging content.</p>"
      }, null, 2),
      settings: JSON.stringify({
        backgroundColor: "#ffffff"
      }, null, 2)
    },
    two_column_text: {
      content: JSON.stringify({
        leftTitle: "Our Causes & Campaigns",
        leftContent: "We focus on addressing critical social issues through targeted campaigns. From providing clean water access to supporting education for underprivileged children, our causes are driven by community needs and sustainable impact.",
        rightTitle: "Join Our Mission",
        rightContent: "Every contribution, whether time or resources, helps us create meaningful change. Join thousands of volunteers and supporters who are making a difference in communities worldwide."
      }, null, 2),
      settings: JSON.stringify({}, null, 2)
    },
    testimonials: {
      content: JSON.stringify({
        title: "What People Say About Us",
        subtitle: "Real stories from the communities we serve",
        testimonials: [
          {
            name: "Sarah Johnson",
            role: "Community Leader",
            quote: "Aahwahan Foundation has transformed our community. Their education programs have given our children hope for a better future."
          },
          {
            name: "Rajesh Patel",
            role: "Healthcare Worker",
            quote: "The healthcare initiatives have saved countless lives in our village. We are forever grateful for their support."
          }
        ]
      }, null, 2),
      settings: JSON.stringify({}, null, 2)
    },
    newsletter_signup: {
      content: JSON.stringify({
        title: "Stay Connected",
        description: "Subscribe to our newsletter for the latest updates on our programs and impact stories",
        placeholder: "Enter your email address",
        buttonText: "Subscribe",
        features: [
          "Monthly impact reports",
          "Event invitations",
          "Volunteer opportunities",
          "Success stories"
        ],
        privacy: "We respect your privacy and will never share your information"
      }, null, 2),
      settings: JSON.stringify({
        backgroundColor: "#1e40af",
        textColor: "#ffffff"
      }, null, 2)
    }
    // Add more templates as needed
  }), []);

  useEffect(() => {
    // Load template data for the component type
    if (componentType && componentTemplates[componentType]) {
      const template = componentTemplates[componentType];
      setComponentData({
        content: template.content,
        settings: template.settings,
        rawData: JSON.stringify({
          section_type: componentType,
          content: JSON.parse(template.content),
          settings: JSON.parse(template.settings),
          is_active: true
        }, null, 2)
      });
    } else {
      // Default empty template
      setComponentData({
        content: JSON.stringify({}, null, 2),
        settings: JSON.stringify({}, null, 2),
        rawData: JSON.stringify({
          section_type: componentType,
          content: {},
          settings: {},
          is_active: true
        }, null, 2)
      });
    }
  }, [componentType]);

  const handleDataChange = (field, value) => {
    setComponentData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update raw data when content or settings change
    if (field === 'content' || field === 'settings') {
      try {
        const contentObj = field === 'content' ? JSON.parse(value) : JSON.parse(componentData.content);
        const settingsObj = field === 'settings' ? JSON.parse(value) : JSON.parse(componentData.settings);

        const newRawData = {
          section_type: componentType,
          content: contentObj,
          settings: settingsObj,
          is_active: true
        };

        setComponentData(prev => ({
          ...prev,
          rawData: JSON.stringify(newRawData, null, 2)
        }));
        setError('');
      } catch (e) {
        setError(`Invalid JSON in ${field}: ${e.message}`);
      }
    }
  };

  const handlePreview = () => {
    try {
      const rawDataObj = JSON.parse(componentData.rawData);
      setPreviewData(rawDataObj);
      setIsPreviewMode(true);
      setError('');
    } catch (e) {
      setError(`Invalid JSON data: ${e.message}`);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would save to your backend
      // For now, just simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError('');
      alert('Component saved successfully!');
    } catch (e) {
      setError('Failed to save component');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset to template? This will lose all your changes.')) {
      const template = componentTemplates[componentType];
      if (template) {
        setComponentData({
          content: template.content,
          settings: template.settings,
          rawData: JSON.stringify({
            section_type: componentType,
            content: JSON.parse(template.content),
            settings: JSON.parse(template.settings),
            is_active: true
          }, null, 2)
        });
      }
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(JSON.parse(componentData.rawData), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${componentType}-component.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setComponentData({
            content: JSON.stringify(importedData.content || {}, null, 2),
            settings: JSON.stringify(importedData.settings || {}, null, 2),
            rawData: JSON.stringify(importedData, null, 2)
          });
          setError('');
        } catch (error) {
          setError('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPreviewMode(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Editor</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                Preview: {componentType}
              </h1>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {previewData && <DynamicSectionRenderer section={previewData} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/components')}
            className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-800"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Components</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 font-display">
              Edit Component: {componentType}
            </h1>
            <p className="text-neutral-600 mt-1">
              Customize content, settings, and preview your component
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            id="import-file"
          />
          <label
            htmlFor="import-file"
            className="flex items-center space-x-2 px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </label>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            onClick={handlePreview}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Main Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-soft border border-neutral-200/50">
            <div className="border-b border-neutral-200">
              <nav className="flex space-x-1 p-1">
                {[
                  { id: 'content', label: 'Content', icon: FileText },
                  { id: 'settings', label: 'Settings', icon: Settings },
                  { id: 'raw', label: 'Raw Data', icon: Code }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'content' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Component Content (JSON)
                  </label>
                  <textarea
                    value={componentData.content}
                    onChange={(e) => handleDataChange('content', e.target.value)}
                    className="w-full h-96 p-4 border border-neutral-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter component content as JSON..."
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Define the component's content structure and data
                  </p>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Component Settings (JSON)
                  </label>
                  <textarea
                    value={componentData.settings}
                    onChange={(e) => handleDataChange('settings', e.target.value)}
                    className="w-full h-96 p-4 border border-neutral-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter component settings as JSON..."
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Configure styling, behavior, and other component settings
                  </p>
                </div>
              )}

              {activeTab === 'raw' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Raw Component Data (JSON)
                  </label>
                  <textarea
                    value={componentData.rawData}
                    onChange={(e) => handleDataChange('rawData', e.target.value)}
                    className="w-full h-96 p-4 border border-neutral-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Complete component data structure..."
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Complete component data as it would appear in the database
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Info & Help */}
        <div className="space-y-6">
          {/* Component Info */}
          <div className="bg-white rounded-xl shadow-soft border border-neutral-200/50 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Component Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-neutral-700">Type:</span>
                <span className="ml-2 text-neutral-600">{componentType}</span>
              </div>
              <div>
                <span className="font-medium text-neutral-700">Status:</span>
                <span className="ml-2 text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-soft border border-neutral-200/50 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handlePreview}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Component</span>
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Help */}
          <div className="bg-white rounded-xl shadow-soft border border-neutral-200/50 p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Help</h3>
            <div className="space-y-2 text-sm text-neutral-600">
              <p>• Use the Content tab to define component data</p>
              <p>• Use Settings tab for styling and configuration</p>
              <p>• Preview your changes before saving</p>
              <p>• Export/Import JSON data for backup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentEditor;