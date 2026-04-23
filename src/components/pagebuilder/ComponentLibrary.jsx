import React, { useState } from 'react';
import {
  Layout,
  BarChart3,
  Users,
  Calendar,
  Heart,
  Mail,
  Quote,
  FileText,
  Image,
  Grid3X3,
  Plus,
  Search,
  Star,
  MapPin,
  Leaf,
  HelpingHand,
  GraduationCap,
  Hospital,
  TreePine,
  Award
} from 'lucide-react';

const ComponentLibrary = ({ onAddComponent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const componentTemplates = {
    hero: [
      {
        type: 'hero',
        name: 'Hero Slider',
        icon: Layout,
        description: 'Hero section with slides and call-to-action',
        category: 'hero',
        dataSource: 'static', // static, database, api
        previewImage: '/images/components/hero-slider.jpg'
      },
      {
        type: 'about_hero',
        name: 'About Hero',
        icon: Layout,
        description: 'Hero section specifically for about pages',
        category: 'hero',
        dataSource: 'static',
        previewImage: '/images/components/about-hero.jpg'
      },
      {
        type: 'header_banner',
        name: 'Header Banner',
        icon: Layout,
        description: 'Simple header banner with title and subtitle',
        category: 'hero',
        dataSource: 'static',
        previewImage: '/images/components/header-banner.jpg'
      }
    ],
    content: [
      {
        type: 'about',
        name: 'About Section',
        icon: FileText,
        description: 'About us content with text and features',
        category: 'content',
        dataSource: 'static',
        previewImage: '/images/components/about-section.jpg'
      },
      {
        type: 'rich_text',
        name: 'Rich Text Block',
        icon: FileText,
        description: 'Rich text content with HTML support',
        category: 'content',
        dataSource: 'static',
        previewImage: '/images/components/rich-text.jpg'
      },
      {
        type: 'two_column_text',
        name: 'Two Column Text',
        icon: Grid3X3,
        description: 'Two column text layout',
        category: 'content',
        dataSource: 'static',
        previewImage: '/images/components/two-column.jpg'
      },
      {
        type: 'building_future',
        name: 'Building Future',
        icon: Users,
        description: 'Section about building unity and equality',
        category: 'content',
        dataSource: 'static',
        previewImage: '/images/components/building-future.jpg'
      },
      {
        type: 'empowering',
        name: 'Empowering Communities',
        icon: Users,
        description: 'Community empowerment content with statistics',
        category: 'content',
        dataSource: 'static',
        previewImage: '/images/components/empowering.jpg'
      },
      {
        type: 'message_from_director',
        name: 'Director Message',
        icon: Quote,
        description: 'Message from director or leadership',
        category: 'content',
        dataSource: 'static',
        previewImage: '/images/components/director-message.jpg'
      }
    ],
    stats: [
      {
        type: 'stats',
        name: 'Statistics Section',
        icon: BarChart3,
        description: 'Number counters and statistics display',
        category: 'stats',
        dataSource: 'static',
        previewImage: '/images/components/stats.jpg'
      },
      {
        type: 'achievements',
        name: 'Achievements',
        icon: Award,
        description: 'Display achievements and awards',
        category: 'stats',
        dataSource: 'static',
        previewImage: '/images/components/achievements.jpg'
      },
      {
        type: 'about_stats',
        name: 'About Statistics',
        icon: BarChart3,
        description: 'Statistics display for about pages',
        category: 'stats',
        dataSource: 'static',
        previewImage: '/images/components/about-stats.jpg'
      }
    ],
    dynamic: [
      {
        type: 'blog_list',
        name: 'Blog Posts',
        icon: FileText,
        description: 'Display latest blog posts from database',
        category: 'dynamic',
        dataSource: 'database',
        dataSourceConfig: {
          table: 'blog_posts',
          endpoint: '/api/blog/posts',
          limit: 6,
          orderBy: 'created_at',
          filters: ['status=published']
        },
        previewImage: '/images/components/blog-list.jpg'
      },
      {
        type: 'events',
        name: 'Events Grid',
        icon: Calendar,
        description: 'Display upcoming events from database',
        category: 'dynamic',
        dataSource: 'database',
        dataSourceConfig: {
          table: 'events',
          endpoint: '/api/events',
          limit: 6,
          orderBy: 'event_date',
          filters: ['status=published', 'event_date>=NOW()']
        },
        previewImage: '/images/components/events.jpg'
      },
      {
        type: 'campaigns',
        name: 'Donation Campaigns',
        icon: Heart,
        description: 'Display active donation campaigns',
        category: 'dynamic',
        dataSource: 'database',
        dataSourceConfig: {
          table: 'donations',
          endpoint: '/api/donations/campaigns',
          limit: 3,
          orderBy: 'created_at',
          filters: ['status=active']
        },
        previewImage: '/images/components/campaigns.jpg'
      },
      {
        type: 'team',
        name: 'Team Members',
        icon: Users,
        description: 'Display team members from database',
        category: 'dynamic',
        dataSource: 'database',
        dataSourceConfig: {
          table: 'team_members',
          endpoint: '/api/team/members',
          limit: 8,
          orderBy: 'display_order',
          filters: ['status=active']
        },
        previewImage: '/images/components/team.jpg'
      },
      {
        type: 'media_gallery',
        name: 'Media Gallery',
        icon: Image,
        description: 'Photo and video gallery from media database',
        category: 'dynamic',
        dataSource: 'database',
        dataSourceConfig: {
          table: 'media',
          endpoint: '/api/media/gallery',
          limit: 12,
          orderBy: 'created_at',
          filters: ['type=image', 'status=published']
        },
        previewImage: '/images/components/gallery.jpg'
      }
    ],
    interactive: [
      {
        type: 'testimonials',
        name: 'Testimonials',
        icon: Quote,
        description: 'User testimonials and reviews',
        category: 'interactive',
        dataSource: 'static',
        previewImage: '/images/components/testimonials.jpg'
      },
      {
        type: 'newsletter_signup',
        name: 'Newsletter Signup',
        icon: Mail,
        description: 'Email newsletter subscription form',
        category: 'interactive',
        dataSource: 'static',
        previewImage: '/images/components/newsletter.jpg'
      },
      {
        type: 'volunteer',
        name: 'Volunteer Section',
        icon: HelpingHand,
        description: 'Volunteer recruitment and information',
        category: 'interactive',
        dataSource: 'static',
        previewImage: '/images/components/volunteer.jpg'
      },
      {
        type: 'get_involved',
        name: 'Get Involved',
        icon: Plus,
        description: 'Ways to get involved with the organization',
        category: 'interactive',
        dataSource: 'static',
        previewImage: '/images/components/get-involved.jpg'
      },
      {
        type: 'contact_form',
        name: 'Contact Form',
        icon: Mail,
        description: 'Contact form for user inquiries',
        category: 'interactive',
        dataSource: 'static',
        previewImage: '/images/components/contact-form.jpg'
      }
    ],
    specialized: [
      {
        type: 'environment',
        name: 'Environment Section',
        icon: TreePine,
        description: 'Environmental conservation content',
        category: 'specialized',
        dataSource: 'static',
        previewImage: '/images/components/environment.jpg'
      },
      {
        type: 'initiatives',
        name: 'Initiatives',
        icon: Leaf,
        description: 'Organization initiatives and programs',
        category: 'specialized',
        dataSource: 'static',
        previewImage: '/images/components/initiatives.jpg'
      },
      {
        type: 'community',
        name: 'Community Section',
        icon: Users,
        description: 'Community engagement content',
        category: 'specialized',
        dataSource: 'static',
        previewImage: '/images/components/community.jpg'
      },
      {
        type: 'partners',
        name: 'Partners Section',
        icon: HelpingHand,
        description: 'Partner organizations and sponsors',
        category: 'specialized',
        dataSource: 'static',
        previewImage: '/images/components/partners.jpg'
      },
      {
        type: 'products_shop',
        name: 'Products Shop',
        icon: Star,
        description: 'Products and merchandise display',
        category: 'specialized',
        dataSource: 'static',
        previewImage: '/images/components/products-shop.jpg'
      },
      {
        type: 'footer_policy',
        name: 'Footer Policy',
        icon: FileText,
        description: 'Footer with policies and contact info',
        category: 'specialized',
        dataSource: 'static',
        previewImage: '/images/components/footer-policy.jpg'
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Components', icon: Grid3X3 },
    { id: 'hero', name: 'Hero Sections', icon: Layout },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'stats', name: 'Statistics', icon: BarChart3 },
    { id: 'dynamic', name: 'Dynamic Data', icon: Calendar },
    { id: 'interactive', name: 'Interactive', icon: Users },
    { id: 'specialized', name: 'Specialized', icon: Star }
  ];

  // Flatten all components
  const allComponents = Object.values(componentTemplates).flat();

  // Filter components
  const filteredComponents = allComponents.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || component.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddComponent = (component) => {
    // Create default component data based on type
    const defaultData = {
      id: Date.now(),
      type: component.type,
      name: component.name,
      dataSource: component.dataSource,
      dataSourceConfig: component.dataSourceConfig || {},
      content: getDefaultContent(component.type),
      settings: getDefaultSettings(component.type),
      order: 0,
      isActive: true
    };

    onAddComponent(defaultData);
  };

  const getDefaultContent = (type) => {
    const defaults = {
      hero: {
        title: "Your Hero Title",
        subtitle: "Your compelling subtitle",
        buttonText: "Get Started",
        slides: [
          { id: 1, title: "Slide 1", subtitle: "Subtitle 1" },
          { id: 2, title: "Slide 2", subtitle: "Subtitle 2" }
        ]
      },
      stats: {
        title: "Our Impact in Numbers",
        stats: [
          { number: "1000+", label: "Lives Transformed" },
          { number: "50+", label: "Projects Completed" },
          { number: "25+", label: "Communities Served" },
          { number: "500+", label: "Volunteers" }
        ]
      },
      blog_list: {
        title: "Latest from Our Blog",
        subtitle: "Stay updated with our latest news and insights",
        showCount: 3,
        buttonText: "View All Posts"
      },
      events: {
        title: "Upcoming Events",
        subtitle: "Join us in making a difference",
        showCount: 6,
        buttonText: "View All Events"
      },
      campaigns: {
        title: "Support Our Campaigns",
        subtitle: "Your donation makes a difference",
        showCount: 3,
        buttonText: "View All Campaigns"
      },
      team: {
        title: "Meet Our Team",
        subtitle: "Dedicated professionals working to make a difference",
        showCount: 8,
        filterByCategory: "",
        buttonText: "View All Team Members"
      },
      about_hero: {
        title: "Give Donation. Touch a Life. Make a Difference.",
        subtitle: "We champion collective action for a better tomorrow",
        primaryButtonText: "Donate Now",
        secondaryButtonText: "Discover More"
      },
      about_stats: {
        title: "Our Impact in Numbers",
        stats: [
          { number: "1000+", label: "Lives Impacted" },
          { number: "250,000+", label: "Donations Raised" },
          { number: "120,000,000", label: "People Supported" },
          { number: "5,000", label: "Volunteers" }
        ]
      },
      building_future: {
        title: "Building a Future of Unity and Equality",
        paragraph1: "We champion collective action for a better tomorrow. Aahwahan Foundation brings together passionate individuals to create meaningful change in communities across the globe.",
        paragraph2: "Our commitment to social justice, environmental sustainability, and human empowerment drives everything we do. Through innovative programs and grassroots initiatives, we are building bridges between communities and creating lasting impact.",
        buttonText: "Learn More",
        image1: "/images/about/unity-1.jpg",
        image2: "/images/about/unity-2.jpg"
      },
      empowering: {
        title: "Empowering Communities for a Sustainable Future",
        yearsStat: "18+",
        yearsLabel: "Year Journey",
        partnersStat: "840",
        partnersLabel: "Global Partners",
        description: "Through our comprehensive approach to community development, we focus on education, healthcare, environmental conservation, and economic empowerment.",
        buttonText: "Join Our Mission",
        mainImage: "/images/about/empowering-main.jpg"
      },
      message_from_director: {
        title: "MESSAGE FROM OUR DIRECTOR",
        message1: "At Aahwahan Foundation, we believe that every individual has the power to create positive change. Our journey began with a simple vision: to build a world where communities thrive together, where sustainability is not just a goal but a way of life.",
        message2: "Through our collective efforts, we have witnessed the transformative power of unity. Every project we undertake, every life we touch, brings us closer to our mission of creating lasting impact. Together, we are not just changing communities – we are changing the world.",
        directorName: "Rajesh Kumar Sharma",
        directorTitle: "Executive Director",
        directorImage: "/images/about/director.jpg"
      },
      contact_form: {
        title: "Send us a Message",
        subtitle: "Fill out the form below and we'll get back to you soon",
        fields: [
          { name: "name", label: "Full Name", type: "text", required: true },
          { name: "email", label: "Email Address", type: "email", required: true },
          { name: "subject", label: "Subject", type: "text", required: true },
          { name: "message", label: "Message", type: "textarea", required: true }
        ],
        buttonText: "Send Message"
      },
      footer_policy: {
        title: "Our Commitment",
        policies: [
          { title: "Privacy Policy", description: "We protect your personal information and respect your privacy", link: "/privacy" },
          { title: "Terms of Service", description: "Guidelines for using our website and services", link: "/terms" }
        ],
        contactInfo: {
          address: "123 Foundation Street, City, State 12345",
          phone: "+1 (555) 123-4567",
          email: "info@aahwahan.org"
        }
      },
      products_shop: {
        title: "Support Our Cause Through Shopping",
        subtitle: "Purchase merchandise and support our mission",
        products: [
          { id: 1, name: "Aahwahan T-Shirt", price: "$25", image: "/images/products/tshirt.jpg", description: "Comfortable cotton t-shirt with our logo" },
          { id: 2, name: "Support Badge", price: "$10", image: "/images/products/badge.jpg", description: "Metal badge to show your support" }
        ],
        buttonText: "Visit Shop"
      },
      header_banner: {
        title: "Page Title",
        subtitle: "Page subtitle or description"
      },
      default: {
        title: "Component Title",
        description: "Component description"
      }
    };

    return defaults[type] || defaults.default;
  };

  const getDefaultSettings = (type) => {
    const defaults = {
      hero: {
        backgroundColor: "#1e40af",
        textColor: "#ffffff",
        autoPlay: true,
        slideInterval: 5000
      },
      stats: {
        backgroundColor: "#1f2937",
        textColor: "#ffffff",
        animateCounters: true
      },
      default: {
        backgroundColor: "#ffffff",
        textColor: "#333333"
      }
    };

    return defaults[type] || defaults.default;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Component Library</h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Categories */}
        <div className="space-y-1">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredComponents.map((component, index) => {
            const Icon = component.icon;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => handleAddComponent(component)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {component.name}
                      </h4>
                      {component.dataSource === 'database' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Dynamic
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {component.description}
                    </p>
                    {component.dataSource === 'database' && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        Data: {component.dataSourceConfig?.table}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Component</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-800 mb-1">No components found</h3>
            <p className="text-xs text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentLibrary;