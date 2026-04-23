import React, { useState } from 'react';
import { 
  Type, 
  Image, 
  Video, 
  Layout, 
  Grid3X3, 
  Users, 
  Calendar, 
  Heart, 
  Mail, 
  MapPin,
  Star,
  Quote,
  BarChart3,
  FileText,
  Plus,
  Search
} from 'lucide-react';

const SectionLibrary = ({ onAddSection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const sectionTemplates = {
    headers: [
      {
        name: 'Hero Section',
        icon: Layout,
        description: 'Full-width hero with background image and call-to-action',
        template: {
          html: `<section class="hero-section relative bg-cover bg-center min-h-screen flex items-center justify-center text-white" style="background-image: url('https://via.placeholder.com/1920x1080');">
            <div class="absolute inset-0 bg-black bg-opacity-50"></div>
            <div class="relative z-10 text-center max-w-4xl mx-auto px-4">
              <h1 class="text-5xl md:text-6xl font-bold mb-6">Welcome to Our Foundation</h1>
              <p class="text-xl md:text-2xl mb-8">Making a difference in communities worldwide</p>
              <button class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
                Get Involved
              </button>
            </div>
          </section>`,
          css: `.hero-section { transition: all 0.3s ease; }`,
          settings: { backgroundImage: 'https://via.placeholder.com/1920x1080', overlay: true, overlayOpacity: 0.5 },
          content: { title: 'Welcome to Our Foundation', subtitle: 'Making a difference in communities worldwide', buttonText: 'Get Involved' }
        }
      },
      {
        name: 'Header Banner',
        icon: Type,
        description: 'Simple header with title and subtitle',
        template: {
          html: `<section class="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
            <div class="container mx-auto px-4 text-center">
              <h1 class="text-4xl md:text-5xl font-bold mb-4">Page Title</h1>
              <p class="text-xl text-primary-100">Page description goes here</p>
            </div>
          </section>`,
          css: '',
          settings: { backgroundColor: '#primary-600', textColor: '#ffffff' },
          content: { title: 'Page Title', description: 'Page description goes here' }
        }
      }
    ],
    content: [
      {
        name: 'Rich Text Block',
        icon: Type,
        description: 'Formatted text content with headings and paragraphs',
        template: {
          html: `<section class="py-16 bg-white">
            <div class="container mx-auto px-4">
              <div class="max-w-4xl mx-auto prose prose-lg">
                <h2>Section Title</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { textAlign: 'left', maxWidth: '4xl' },
          content: { title: 'Section Title', content: '<p>Lorem ipsum dolor sit amet...</p>' }
        }
      },
      {
        name: 'Two Column Text',
        icon: Grid3X3,
        description: 'Side-by-side text columns',
        template: {
          html: `<section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
              <div class="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div>
                  <h3 class="text-2xl font-bold mb-4">Left Column</h3>
                  <p class="text-gray-600">Content for the left column goes here.</p>
                </div>
                <div>
                  <h3 class="text-2xl font-bold mb-4">Right Column</h3>
                  <p class="text-gray-600">Content for the right column goes here.</p>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { gap: 12 },
          content: { leftTitle: 'Left Column', leftContent: 'Content for the left column goes here.', rightTitle: 'Right Column', rightContent: 'Content for the right column goes here.' }
        }
      }
    ],
    media: [
      {
        name: 'Image Gallery',
        icon: Image,
        description: 'Responsive image gallery with lightbox',
        template: {
          html: `<section class="py-16 bg-white">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12">Our Gallery</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img src="https://via.placeholder.com/400x400" alt="Gallery Image 1" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img src="https://via.placeholder.com/400x400" alt="Gallery Image 2" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  <img src="https://via.placeholder.com/400x400" alt="Gallery Image 3" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
              </div>
            </div>
          </section>`,
          css: '.gallery img:hover { transform: scale(1.05); }',
          settings: { columns: { mobile: 1, tablet: 2, desktop: 3 }, aspectRatio: 'square' },
          content: { title: 'Our Gallery', images: [] }
        }
      },
      {
        name: 'Video Section',
        icon: Video,
        description: 'Embedded video with overlay text',
        template: {
          html: `<section class="py-16 bg-gray-900 text-white">
            <div class="container mx-auto px-4">
              <div class="max-w-4xl mx-auto">
                <h2 class="text-3xl font-bold text-center mb-8">Watch Our Story</h2>
                <div class="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" class="w-full h-full"></iframe>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', autoplay: false },
          content: { title: 'Watch Our Story', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
        }
      }
    ],
    interactive: [
      {
        name: 'Contact Form',
        icon: Mail,
        description: 'Contact form with validation',
        template: {
          html: `<section class="py-16 bg-white">
            <div class="container mx-auto px-4">
              <div class="max-w-2xl mx-auto">
                <h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2>
                <form class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
                  </div>
                  <button type="submit" class="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { emailTo: 'info@foundation.org', showFields: ['name', 'email', 'message'] },
          content: { title: 'Contact Us', submitText: 'Send Message' }
        }
      },
      {
        name: 'Newsletter Signup',
        icon: Mail,
        description: 'Email newsletter subscription form',
        template: {
          html: `<section class="py-16 bg-primary-600 text-white">
            <div class="container mx-auto px-4">
              <div class="max-w-2xl mx-auto text-center">
                <h2 class="text-3xl font-bold mb-4">Stay Updated</h2>
                <p class="text-primary-100 mb-8">Subscribe to our newsletter for the latest updates</p>
                <form class="flex flex-col md:flex-row gap-4">
                  <input type="email" placeholder="Your email address" class="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <button type="submit" class="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { backgroundColor: '#primary-600', textColor: '#ffffff' },
          content: { title: 'Stay Updated', description: 'Subscribe to our newsletter for the latest updates', buttonText: 'Subscribe' }
        }
      }
    ],
    features: [
      {
        name: 'Feature Grid',
        icon: Grid3X3,
        description: 'Grid of features with icons',
        template: {
          html: `<section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12">Our Features</h2>
              <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div class="text-center">
                  <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path></svg>
                  </div>
                  <h3 class="text-xl font-bold mb-2">Community</h3>
                  <p class="text-gray-600">Building stronger communities together</p>
                </div>
                <div class="text-center">
                  <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path></svg>
                  </div>
                  <h3 class="text-xl font-bold mb-2">Support</h3>
                  <p class="text-gray-600">Providing support to those in need</p>
                </div>
                <div class="text-center">
                  <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 class="text-xl font-bold mb-2">Impact</h3>
                  <p class="text-gray-600">Creating lasting positive change</p>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { columns: 3, iconStyle: 'rounded' },
          content: { title: 'Our Features', features: [] }
        }
      },
      {
        name: 'Team Section',
        icon: Users,
        description: 'Team member cards with photos',
        template: {
          html: `<section class="py-16 bg-white">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
              <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div class="text-center">
                  <img src="https://via.placeholder.com/300x300" alt="Team Member" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                  <h3 class="text-xl font-bold mb-1">John Doe</h3>
                  <p class="text-gray-600 mb-2">Executive Director</p>
                  <p class="text-sm text-gray-500">Leading our mission with passion and dedication</p>
                </div>
                <div class="text-center">
                  <img src="https://via.placeholder.com/300x300" alt="Team Member" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                  <h3 class="text-xl font-bold mb-1">Jane Smith</h3>
                  <p class="text-gray-600 mb-2">Program Manager</p>
                  <p class="text-sm text-gray-500">Coordinating our community programs</p>
                </div>
                <div class="text-center">
                  <img src="https://via.placeholder.com/300x300" alt="Team Member" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
                  <h3 class="text-xl font-bold mb-1">Mike Johnson</h3>
                  <p class="text-gray-600 mb-2">Volunteer Coordinator</p>
                  <p class="text-sm text-gray-500">Organizing our volunteer efforts</p>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { columns: 3, imageStyle: 'rounded' },
          content: { title: 'Meet Our Team', members: [] }
        }
      }
    ],
    testimonials: [
      {
        name: 'Testimonial Cards',
        icon: Quote,
        description: 'Customer testimonials with ratings',
        template: {
          html: `<section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12">What People Say</h2>
              <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="flex text-yellow-400 mb-4">
                    <span>★★★★★</span>
                  </div>
                  <p class="text-gray-600 mb-4">"This organization has made a tremendous impact in our community. Their dedication is truly inspiring."</p>
                  <div class="flex items-center">
                    <img src="https://via.placeholder.com/50x50" alt="Testimonial" class="w-12 h-12 rounded-full mr-4">
                    <div>
                      <p class="font-semibold">Sarah Wilson</p>
                      <p class="text-sm text-gray-500">Community Volunteer</p>
                    </div>
                  </div>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md">
                  <div class="flex text-yellow-400 mb-4">
                    <span>★★★★★</span>
                  </div>
                  <p class="text-gray-600 mb-4">"Amazing work and wonderful people. I'm proud to support their mission."</p>
                  <div class="flex items-center">
                    <img src="https://via.placeholder.com/50x50" alt="Testimonial" class="w-12 h-12 rounded-full mr-4">
                    <div>
                      <p class="font-semibold">David Chen</p>
                      <p class="text-sm text-gray-500">Monthly Donor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { showRatings: true, columns: 2 },
          content: { title: 'What People Say', testimonials: [] }
        }
      }
    ],
    specialized: [
      {
        name: 'Donation Campaign Card',
        icon: Heart,
        description: 'Single donation campaign with progress bar',
        template: {
          html: `<section class="py-16 bg-white">
            <div class="container mx-auto px-4">
              <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="md:flex">
                  <div class="md:w-1/2">
                    <img src="https://via.placeholder.com/600x400" alt="Campaign" class="h-64 w-full object-cover md:h-full">
                  </div>
                  <div class="p-8 md:w-1/2">
                    <h3 class="text-2xl font-bold mb-4">Help Build Clean Water Wells</h3>
                    <p class="text-gray-600 mb-6">Provide clean, safe drinking water to rural communities in need.</p>
                    <div class="mb-6">
                      <div class="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>₹15,00,000 of ₹25,00,000</span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="bg-primary-600 h-3 rounded-full" style="width: 60%"></div>
                      </div>
                    </div>
                    <button class="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      Donate Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { campaignId: null, showProgress: true },
          content: { title: 'Help Build Clean Water Wells', description: 'Provide clean, safe drinking water to rural communities in need.', goal: 25000, raised: 15000 }
        }
      },
      {
        name: 'Event Listing',
        icon: Calendar,
        description: 'Upcoming events with date and location',
        template: {
          html: `<section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12">Upcoming Events</h2>
              <div class="max-w-4xl mx-auto space-y-6">
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                  <div class="md:flex">
                    <div class="md:w-1/3">
                      <img src="https://via.placeholder.com/400x300" alt="Event" class="h-48 w-full object-cover md:h-full">
                    </div>
                    <div class="p-6 md:w-2/3">
                      <div class="flex items-center text-primary-600 text-sm font-semibold mb-2">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"/>
                        </svg>
                        March 15, 2024
                      </div>
                      <h3 class="text-xl font-bold mb-2">Community Clean-Up Drive</h3>
                      <p class="text-gray-600 mb-4">Join us for a neighborhood clean-up initiative to make our community more beautiful.</p>
                      <div class="flex items-center text-gray-500 text-sm mb-4">
                        <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
                        </svg>
                        Community Center, Downtown
                      </div>
                      <button class="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { showRegistration: true, maxEvents: 3 },
          content: { title: 'Upcoming Events', events: [] }
        }
      },
      {
        name: 'Blog Post Grid',
        icon: FileText,
        description: 'Latest blog posts with excerpts',
        template: {
          html: `<section class="py-16 bg-white">
            <div class="container mx-auto px-4">
              <h2 class="text-3xl font-bold text-center mb-12">Latest News & Stories</h2>
              <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <article class="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src="https://via.placeholder.com/400x250" alt="Blog post" class="w-full h-48 object-cover">
                  <div class="p-6">
                    <div class="text-primary-600 text-sm font-semibold mb-2">March 10, 2024</div>
                    <h3 class="text-xl font-bold mb-3">Making a Difference in Rural Education</h3>
                    <p class="text-gray-600 mb-4">Discover how our education programs are transforming lives in remote communities...</p>
                    <a href="#" class="text-primary-600 font-semibold hover:text-primary-700">Read More →</a>
                  </div>
                </article>
                <article class="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src="https://via.placeholder.com/400x250" alt="Blog post" class="w-full h-48 object-cover">
                  <div class="p-6">
                    <div class="text-primary-600 text-sm font-semibold mb-2">March 8, 2024</div>
                    <h3 class="text-xl font-bold mb-3">Clean Water Initiative Success Story</h3>
                    <p class="text-gray-600 mb-4">See the impact of our clean water projects in rural villages across the region...</p>
                    <a href="#" class="text-primary-600 font-semibold hover:text-primary-700">Read More →</a>
                  </div>
                </article>
                <article class="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src="https://via.placeholder.com/400x250" alt="Blog post" class="w-full h-48 object-cover">
                  <div class="p-6">
                    <div class="text-primary-600 text-sm font-semibold mb-2">March 5, 2024</div>
                    <h3 class="text-xl font-bold mb-3">Volunteer Spotlight: Sarah's Journey</h3>
                    <p class="text-gray-600 mb-4">Meet Sarah, one of our dedicated volunteers who has been making a difference for over 3 years...</p>
                    <a href="#" class="text-primary-600 font-semibold hover:text-primary-700">Read More →</a>
                  </div>
                </article>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { postsCount: 3, showExcerpt: true, showDate: true },
          content: { title: 'Latest News & Stories', posts: [] }
        }
      },
      {
        name: 'Statistics Counter',
        icon: BarChart3,
        description: 'Impact statistics with animated counters',
        template: {
          html: `<section class="py-16 bg-primary-600 text-white">
            <div class="container mx-auto px-4">
              <div class="text-center mb-12">
                <h2 class="text-3xl font-bold mb-4">Our Impact</h2>
                <p class="text-primary-100 max-w-2xl mx-auto">See the difference we're making in communities worldwide</p>
              </div>
              <div class="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
                <div>
                  <div class="text-4xl font-bold mb-2">50,000+</div>
                  <div class="text-primary-100">Lives Touched</div>
                </div>
                <div>
                  <div class="text-4xl font-bold mb-2">100+</div>
                  <div class="text-primary-100">Communities Served</div>
                </div>
                <div>
                  <div class="text-4xl font-bold mb-2">25</div>
                  <div class="text-primary-100">Countries Reached</div>
                </div>
                <div>
                  <div class="text-4xl font-bold mb-2">1,000+</div>
                  <div class="text-primary-100">Active Volunteers</div>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { backgroundColor: '#primary-600', textColor: '#ffffff', animated: true },
          content: { title: 'Our Impact', stats: [
            { number: '50,000+', label: 'Lives Touched' },
            { number: '100+', label: 'Communities Served' },
            { number: '25', label: 'Countries Reached' },
            { number: '1,000+', label: 'Active Volunteers' }
          ]}
        }
      },
      {
        name: 'Program Card',
        icon: Grid3X3,
        description: 'Individual program showcase with details',
        template: {
          html: `<section class="py-16 bg-gray-50">
            <div class="container mx-auto px-4">
              <div class="max-w-4xl mx-auto">
                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div class="md:flex">
                    <div class="md:w-1/2">
                      <img src="https://via.placeholder.com/600x400" alt="Program" class="h-64 w-full object-cover md:h-full">
                    </div>
                    <div class="p-8 md:w-1/2">
                      <div class="text-primary-600 text-sm font-semibold mb-2">Education Program</div>
                      <h3 class="text-2xl font-bold mb-4">Rural School Development</h3>
                      <p class="text-gray-600 mb-6">Building and supporting educational infrastructure in underserved rural communities, providing quality education to children who need it most.</p>
                      <div class="space-y-3 mb-6">
                        <div class="flex items-center text-gray-600">
                          <svg class="w-5 h-5 mr-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          School infrastructure development
                        </div>
                        <div class="flex items-center text-gray-600">
                          <svg class="w-5 h-5 mr-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Teacher training programs
                        </div>
                        <div class="flex items-center text-gray-600">
                          <svg class="w-5 h-5 mr-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Educational materials and supplies
                        </div>
                      </div>
                      <button class="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>`,
          css: '',
          settings: { programType: 'education', showFeatures: true },
          content: { 
            category: 'Education Program',
            title: 'Rural School Development', 
            description: 'Building and supporting educational infrastructure in underserved rural communities.',
            features: [
              'School infrastructure development',
              'Teacher training programs', 
              'Educational materials and supplies'
            ]
          }
        }
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Sections', icon: Layout },
    { id: 'headers', name: 'Headers', icon: Type },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'media', name: 'Media', icon: Image },
    { id: 'interactive', name: 'Forms', icon: Mail },
    { id: 'features', name: 'Features', icon: Grid3X3 },
    { id: 'testimonials', name: 'Testimonials', icon: Quote },
    { id: 'specialized', name: 'Specialized', icon: Star }
  ];

  const filteredSections = () => {
    let sections = [];
    
    if (activeCategory === 'all') {
      sections = Object.values(sectionTemplates).flat();
    } else {
      sections = sectionTemplates[activeCategory] || [];
    }

    if (searchTerm) {
      sections = sections.filter(section =>
        section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return sections;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-gray-200">
        <div className="space-y-1">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Templates */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredSections().map((section, index) => {
            const Icon = section.icon;
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                onClick={() => {
                  const sectionType = section.name.toLowerCase().replace(/\s+/g, '_');
                  onAddSection(sectionType, section.template);
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{section.name}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                    <button className="mt-2 flex items-center text-xs text-primary-600 hover:text-primary-700 font-medium">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Section
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSections().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Layout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No sections found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-primary-600 hover:text-primary-700 text-sm mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionLibrary;