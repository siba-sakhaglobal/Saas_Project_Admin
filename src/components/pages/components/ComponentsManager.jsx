import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code,
  Eye,
  Edit3,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import cms from '../../../services/cms';

const ComponentsManager = () => {
  const [components, setComponents] = useState([]);
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPage, setSelectedPage] = useState('all');
  const [pages, setPages] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Component categories for filtering
  const categories = [
    { value: 'all', label: 'All Components' },
    { value: 'hero', label: 'Hero Sections' },
    { value: 'about', label: 'About Sections' },
    { value: 'stats', label: 'Statistics' },
    { value: 'blog', label: 'Blog Components' },
    { value: 'events', label: 'Event Components' },
    { value: 'donations', label: 'Donation Components' },
    { value: 'team', label: 'Team Components' },
    { value: 'media', label: 'Media Components' },
    { value: 'form', label: 'Forms' },
    { value: 'layout', label: 'Layout Components' },
    { value: 'other', label: 'Other' }
  ];

  // Available component types with their display names and descriptions
  const componentTypes = [
    {
      type: 'hero',
      name: 'Hero Section',
      description: 'Main banner/hero sections with slides and call-to-actions',
      category: 'hero',
      icon: '🎯'
    },
    {
      type: 'about',
      name: 'About Section',
      description: 'About us content with text and images',
      category: 'about',
      icon: '📖'
    },
    {
      type: 'stats',
      name: 'Statistics Section',
      description: 'Number counters and statistics display',
      category: 'stats',
      icon: '📊'
    },
    {
      type: 'about_hero',
      name: 'About Hero',
      description: 'Hero section specifically for about pages',
      category: 'about',
      icon: '🎯'
    },
    {
      type: 'about_stats',
      name: 'About Statistics',
      description: 'Statistics display for about pages',
      category: 'about',
      icon: '📊'
    },
    {
      type: 'building_future',
      name: 'Building Future',
      description: 'Section about building unity and equality',
      category: 'about',
      icon: '🏗️'
    },
    {
      type: 'empowering',
      name: 'Empowering Communities',
      description: 'Community empowerment content',
      category: 'about',
      icon: '💪'
    },
    {
      type: 'team',
      name: 'Team Section',
      description: 'Display team members and staff',
      category: 'team',
      icon: '👥'
    },
    {
      type: 'message_from_director',
      name: 'Director Message',
      description: 'Message from director or leadership',
      category: 'team',
      icon: '💬'
    },
    {
      type: 'blog_list',
      name: 'Blog List',
      description: 'Display list of blog posts',
      category: 'blog',
      icon: '📝'
    },
    {
      type: 'campaigns',
      name: 'Campaigns',
      description: 'Donation campaigns display',
      category: 'donations',
      icon: '❤️'
    },
    {
      type: 'events',
      name: 'Events Grid',
      description: 'Display upcoming events',
      category: 'events',
      icon: '📅'
    },
    {
      type: 'rich_text',
      name: 'Rich Text Block',
      description: 'Rich text content with HTML support',
      category: 'layout',
      icon: '📄'
    },
    {
      type: 'two_column_text',
      name: 'Two Column Text',
      description: 'Two column text layout',
      category: 'layout',
      icon: '📑'
    },
    {
      type: 'achievements',
      name: 'Achievements',
      description: 'Display achievements and awards',
      category: 'about',
      icon: '🏆'
    },
    {
      type: 'environment',
      name: 'Environment Section',
      description: 'Environmental conservation content',
      category: 'other',
      icon: '🌱'
    },
    {
      type: 'initiatives',
      name: 'Initiatives',
      description: 'Organization initiatives and programs',
      category: 'other',
      icon: '🚀'
    },
    {
      type: 'community',
      name: 'Community Section',
      description: 'Community engagement content',
      category: 'other',
      icon: '🤝'
    },
    {
      type: 'testimonials',
      name: 'Testimonials',
      description: 'User testimonials and reviews',
      category: 'other',
      icon: '⭐'
    },
    {
      type: 'volunteer',
      name: 'Volunteer Section',
      description: 'Volunteer recruitment and information',
      category: 'other',
      icon: '🙋'
    },
    {
      type: 'get_involved',
      name: 'Get Involved',
      description: 'Ways to get involved with the organization',
      category: 'other',
      icon: '🤲'
    },
    {
      type: 'media_gallery',
      name: 'Media Gallery',
      description: 'Photo and video gallery',
      category: 'media',
      icon: '🖼️'
    },
    {
      type: 'products_shop',
      name: 'Products Shop',
      description: 'Products and merchandise display',
      category: 'other',
      icon: '🛍️'
    },
    {
      type: 'partners',
      name: 'Partners Section',
      description: 'Partner organizations and sponsors',
      category: 'other',
      icon: '🤝'
    },
    {
      type: 'newsletter_signup',
      name: 'Newsletter Signup',
      description: 'Email newsletter subscription form',
      category: 'form',
      icon: '📧'
    },
    {
      type: 'contact_form',
      name: 'Contact Form',
      description: 'Contact form for user inquiries',
      category: 'form',
      icon: '📞'
    },
    {
      type: 'footer_policy',
      name: 'Footer Policy',
      description: 'Footer with policies and contact info',
      category: 'layout',
      icon: '📋'
    }
  ];

  const fetchComponentsAndPages = async () => {
    try {
      setLoading(true);

      // Fetch component usage data and page filters
      const [componentUsageResponse, filtersResponse] = await Promise.all([
        cms.raw().get('/component-usage'),
        cms.raw().get('/component-usage/filters')
      ]);

      const { data: componentUsageData } = componentUsageResponse;
      const { data: filtersData } = filtersResponse;

      // Set pages for filter dropdown
      setPages(filtersData.data.pages || []);

      // Group components by type and get their usage info
      const componentUsageMap = {};
      componentUsageData.data.forEach(usage => {
          if (!componentUsageMap[usage.component_type]) {
            componentUsageMap[usage.component_type] = {
              type: usage.component_type,
              name: usage.component_name,
              usageCount: 0,
              pages: []
            };
          }
          componentUsageMap[usage.component_type].usageCount++;
          componentUsageMap[usage.component_type].pages.push({
            slug: usage.page_slug,
            title: usage.page_title
          });
        });

        // Enhance component types with usage data
        const enhancedComponents = componentTypes.map(comp => {
          const usage = componentUsageMap[comp.type];
          return {
            ...comp,
            usageCount: usage?.usageCount || 0,
            usedInPages: usage?.pages || [],
            description: usage ?
              `${comp.description} (Used in ${usage.usageCount} places across ${new Set(usage.pages.map(p => p.slug)).size} pages)` :
              comp.description
          };
        });

      setComponents(enhancedComponents);
      setFilteredComponents(enhancedComponents);
    } catch (error) {
      console.error('Error fetching components and pages:', error);
      // Fallback to original component types
      setComponents(componentTypes);
      setFilteredComponents(componentTypes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponentsAndPages();
  }, []);

  useEffect(() => {
    let filtered = components;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component => component.category === selectedCategory);
    }

    // Filter by page
    if (selectedPage !== 'all') {
      filtered = filtered.filter(component =>
        component.usedInPages && component.usedInPages.some(page => page.slug === selectedPage)
      );
    }

    setFilteredComponents(filtered);
  }, [searchTerm, selectedCategory, selectedPage, components]);

  const handleEditComponent = (componentType) => {
    navigate(`/components/edit/${componentType}`);
  };

  const handlePreviewComponent = (componentType) => {
    navigate(`/components/preview/${componentType}`);
  };

  const ComponentCard = ({ component }) => (
    <div className="bg-white rounded-xl shadow-soft hover:shadow-material-4 transition-all duration-300 p-6 border border-neutral-200/50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl">
            {component.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">{component.name}</h3>
            <p className="text-sm text-neutral-600">{component.type}</p>
            {component.usageCount > 0 && (
              <p className="text-xs text-green-600 font-medium">
                Used {component.usageCount} times in {new Set(component.usedInPages?.map(p => p.slug)).size} pages
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
            {categories.find(cat => cat.value === component.category)?.label || component.category}
          </span>
          {component.usageCount > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
              {component.usageCount} uses
            </span>
          )}
        </div>
      </div>

      <p className="text-neutral-600 text-sm mb-6 line-clamp-2">
        {component.description}
      </p>

      <div className="flex space-x-2">
        <button
          onClick={() => handleEditComponent(component.type)}
          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => handlePreviewComponent(component.type)}
          className="flex-1 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>
    </div>
  );

  const ComponentRow = ({ component }) => (
    <div className="bg-white rounded-lg shadow-soft border border-neutral-200/50 p-4 flex items-center justify-between hover:shadow-material-2 transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-lg">
          {component.icon}
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800">{component.name}</h3>
          <p className="text-sm text-neutral-600">{component.type}</p>
          {component.usageCount > 0 && (
            <p className="text-xs text-green-600 font-medium">
              Used {component.usageCount} times in {new Set(component.usedInPages?.map(p => p.slug)).size} pages
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 mx-6">
        <p className="text-neutral-600 text-sm">{component.description}</p>
      </div>

      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-lg">
          {categories.find(cat => cat.value === component.category)?.label || component.category}
        </span>
        {component.usageCount > 0 && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
            {component.usageCount} uses
          </span>
        )}
        <button
          onClick={() => handlePreviewComponent(component.type)}
          className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleEditComponent(component.type)}
          className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 font-display">Component Editor</h1>
          <p className="text-neutral-600 mt-2">Edit and preview individual components with custom data sources</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft border border-neutral-200/50 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Pages</option>
                {pages.map(page => (
                  <option key={page.page_slug} value={page.page_slug}>
                    {page.page_title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Components Grid/List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-800">
            Available Components ({filteredComponents.length})
          </h2>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-soft border border-neutral-200/50 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">Loading components...</h3>
            <p className="text-neutral-600">Fetching component usage data from the database.</p>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-soft border border-neutral-200/50 p-12 text-center">
            <Code className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No components found</h3>
            <p className="text-neutral-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-3"
          }>
            {filteredComponents.map((component) => (
              viewMode === 'grid' ? (
                <ComponentCard key={component.type} component={component} />
              ) : (
                <ComponentRow key={component.type} component={component} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentsManager;