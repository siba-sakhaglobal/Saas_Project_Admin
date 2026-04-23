import React from 'react';
import { 
  CurrencyDollarIcon, 
  UserPlusIcon, 
  DocumentTextIcon, 
  MegaphoneIcon,
  HeartIcon 
} from '@heroicons/react/24/outline';

const ActivityFeed = ({ data }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'donation':
        return <CurrencyDollarIcon className="w-5 h-5 text-green-600" />;
      case 'volunteer':
        return <UserPlusIcon className="w-5 h-5 text-blue-600" />;
      case 'content':
        return <DocumentTextIcon className="w-5 h-5 text-purple-600" />;
      case 'event':
        return <MegaphoneIcon className="w-5 h-5 text-orange-600" />;
      case 'campaign':
        return <HeartIcon className="w-5 h-5 text-pink-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const activities = data || [
    {
      type: 'donation',
      description: '₹250 donation received from John Smith',
      activity_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'success',
      item_id: 1
    },
    {
      type: 'volunteer',
      description: 'Sarah Johnson applied as volunteer',
      activity_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'warning',
      item_id: 2
    },
    {
      type: 'campaign',
      description: 'New campaign: Education Fund 2025',
      activity_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'info',
      item_id: 3
    },
    {
      type: 'content',
      description: 'New blog post: Community Impact Report',
      activity_date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'info',
      item_id: 4
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-900 font-medium">
                  {activity.description}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formatTimeAgo(activity.activity_date)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Donations</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Applications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">Content</span>
            </div>
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;