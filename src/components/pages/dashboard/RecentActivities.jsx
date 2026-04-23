import React from 'react';
import { 
  FileText, 
  Calendar, 
  Users, 
  Heart, 
  Image, 
  Settings as SettingsIcon,
  Clock
} from 'lucide-react';

const RecentActivities = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Recent Activities</h3>
        </div>
        <div className="card-body">
          <p className="text-gray-500 text-center py-4">No recent activities</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    const icons = {
      page: FileText,
      blog: FileText,
      event: Calendar,
      team: Users,
      donation: Heart,
      media: Image,
      user: Users,
      setting: SettingsIcon
    };
    return icons[type] || FileText;
  };

  const getActivityColor = (type) => {
    const colors = {
      page: 'text-blue-600 bg-blue-100',
      blog: 'text-green-600 bg-green-100',
      event: 'text-purple-600 bg-purple-100',
      team: 'text-indigo-600 bg-indigo-100',
      donation: 'text-red-600 bg-red-100',
      media: 'text-yellow-600 bg-yellow-100',
      user: 'text-gray-600 bg-gray-100',
      setting: 'text-orange-600 bg-orange-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getActionText = (action) => {
    const actions = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      publish: 'published',
      unpublish: 'unpublished'
    };
    return actions[action] || action;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium">Recent Activities</h3>
      </div>
      <div className="card-body p-0">
        <div className="flow-root">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClasses = getActivityColor(activity.type);

              return (
                <li key={index} className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClasses} flex items-center justify-center`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user_name}</span>
                        {' '}
                        <span className="text-gray-600">
                          {getActionText(activity.action)} {activity.type}
                        </span>
                        {activity.title && (
                          <span className="font-medium"> "{activity.title}"</span>
                        )}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(activity.created_at)}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        {activities.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No recent activities to show</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivities;