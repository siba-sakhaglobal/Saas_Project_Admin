import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Settings,
  Code
} from 'lucide-react';

// Import the DynamicSectionRenderer for preview
import DynamicSectionRenderer from '../../common/DynamicSectionRenderer';

const ComponentPreview = () => {
  const { componentType } = useParams();
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState('desktop');
  const [componentData, setComponentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sample data for different component types
  const sampleData = useMemo(() => ({
    hero: {
      section_type: 'hero',
      content: {
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
      },
      settings: {
        backgroundColor: "#1e40af",
        textColor: "#ffffff"
      },
      is_active: true
    },
    about: {
      section_type: 'about',
      content: {
        title: "About Aahwahan Foundation",
        content: "<p>Aahwahan Foundation is dedicated to creating sustainable change in communities across the globe. Our mission is to empower individuals and communities through education, healthcare, environmental conservation, and economic development programs.</p>",
        features: [
          "Community-driven development programs",
          "Sustainable environmental initiatives",
          "Educational empowerment projects",
          "Healthcare accessibility programs"
        ]
      },
      settings: {},
      is_active: true
    },
    stats: {
      section_type: 'stats',
      content: {
        title: "Our Impact in Numbers",
        stats: [
          { number: "10,000+", label: "Lives Transformed" },
          { number: "500+", label: "Projects Completed" },
          { number: "50+", label: "Communities Served" },
          { number: "1000+", label: "Volunteers" }
        ]
      },
      settings: {
        backgroundColor: "#1f2937",
        textColor: "#ffffff"
      },
      is_active: true
    },
    rich_text: {
      section_type: 'rich_text',
      content: {
        title: "Our Mission and Vision",
        content: "<p>This is a rich text block where you can add comprehensive content about your organization. You can include <strong>bold text</strong>, <em>italic text</em>, and even <a href='#'>links</a>.</p><p>Add multiple paragraphs, lists, and other HTML elements to create engaging content that tells your story effectively.</p><ul><li>Community empowerment programs</li><li>Educational initiatives</li><li>Healthcare access projects</li><li>Environmental conservation efforts</li></ul>"
      },
      settings: {
        backgroundColor: "#ffffff"
      },
      is_active: true
    },
    testimonials: {
      section_type: 'testimonials',
      content: {
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
          },
          {
            name: "Maria Garcia",
            role: "Environmental Activist",
            quote: "Their environmental programs have helped us create a sustainable future for our children and grandchildren."
          }
        ]
      },
      settings: {},
      is_active: true
    },
    newsletter_signup: {
      section_type: 'newsletter_signup',
      content: {
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
      },
      settings: {
        backgroundColor: "#1e40af",
        textColor: "#ffffff"
      },
      is_active: true
    },
    two_column_text: {
      section_type: 'two_column_text',
      content: {
        leftTitle: "Our Causes & Campaigns",
        leftContent: "We focus on addressing critical social issues through targeted campaigns. From providing clean water access to supporting education for underprivileged children, our causes are driven by community needs and sustainable impact.",
        rightTitle: "Join Our Mission",
        rightContent: "Every contribution, whether time or resources, helps us create meaningful change. Join thousands of volunteers and supporters who are making a difference in communities worldwide."
      },
      settings: {},
      is_active: true
    }
  }), []);

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading component data
    setTimeout(() => {
      if (sampleData[componentType]) {
        setComponentData(sampleData[componentType]);
      } else {
        // Default fallback data
        setComponentData({
          section_type: componentType,
          content: {
            title: `${componentType} Component`,
            description: "This is a preview of the component with sample data."
          },
          settings: {},
          is_active: true
        });
      }
      setIsLoading(false);
    }, 500);
  }, [componentType]);

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      default:
        return 'max-w-full';
    }
  };

  const handleEdit = () => {
    navigate(`/components/edit/${componentType}`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading component preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
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
              <h1 className="text-xl font-semibold text-neutral-800">
                Preview: {componentType}
              </h1>
              <p className="text-sm text-neutral-600">
                Live preview of your component with sample data
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Device Toggle */}
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded-md transition-colors ${
                  previewMode === 'desktop'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded-md transition-colors ${
                  previewMode === 'tablet'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded-md transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-800'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Component</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="p-6">
        <div className={`mx-auto transition-all duration-300 ${getPreviewWidth()}`}>
          {/* Preview Frame */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Preview Toolbar */}
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-600 ml-4">
                  {componentType} Component Preview
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="capitalize">{previewMode}</span>
                <span>•</span>
                <span>Live Preview</span>
              </div>
            </div>

            {/* Component Preview */}
            <div className="preview-container">
              {componentData && (
                <DynamicSectionRenderer section={componentData} />
              )}
            </div>
          </div>

          {/* Component Info */}
          <div className="mt-6 bg-white rounded-lg shadow-soft border border-neutral-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Component Details</h3>
              <div className="flex space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
                  Active
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
                  {componentType}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Component Type</h4>
                <p className="text-neutral-600">{componentData?.section_type}</p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Content Keys</h4>
                <p className="text-neutral-600">
                  {componentData?.content ? Object.keys(componentData.content).length : 0} properties
                </p>
              </div>
              <div>
                <h4 className="font-medium text-neutral-700 mb-2">Settings</h4>
                <p className="text-neutral-600">
                  {componentData?.settings ? Object.keys(componentData.settings).length : 0} properties
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Content</span>
                </button>
                <button
                  onClick={() => navigate(`/components/edit/${componentType}?tab=settings`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-neutral-50 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Edit Settings</span>
                </button>
                <button
                  onClick={() => navigate(`/components/edit/${componentType}?tab=raw`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-neutral-50 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Code className="w-4 h-4" />
                  <span>View Raw Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentPreview;