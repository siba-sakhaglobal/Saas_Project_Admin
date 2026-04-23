import React from 'react';
import { FileText, Users, Calendar, Heart, TrendingUp, TrendingDown } from 'lucide-react';

const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cardData = [
    {
      title: 'Total Pages',
      value: stats.total_pages,
      icon: FileText,
      change: stats.pages_change,
      color: 'blue'
    },
    {
      title: 'Blog Posts',
      value: stats.total_blog_posts,
      icon: FileText,
      change: stats.blog_change,
      color: 'green'
    },
    {
      title: 'Events',
      value: stats.total_events,
      icon: Calendar,
      change: stats.events_change,
      color: 'purple'
    },
    {
      title: 'Team Members',
      value: stats.total_team_members,
      icon: Users,
      change: stats.team_change,
      color: 'indigo'
    },
    {
      title: 'Total Donations',
      value: `₹${stats.total_donations?.toLocaleString() || 0}`,
      icon: Heart,
      change: stats.donations_change,
      color: 'red'
    },
    {
      title: 'Active Users',
      value: stats.active_users,
      icon: Users,
      change: stats.users_change,
      color: 'yellow'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      green: 'bg-green-500 text-green-600 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 bg-purple-50',
      indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50',
      red: 'bg-red-500 text-red-600 bg-red-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50'
    };
    return colors[color].split(' ');
  };

  const renderChangeIndicator = (change) => {
    if (!change && change !== 0) return null;
    
    const isPositive = change > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center text-sm ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        <Icon className="h-4 w-4 mr-1" />
        <span>{Math.abs(change)}%</span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cardData.map((card, index) => {
        const [iconBg, textColor, cardBg] = getColorClasses(card.color);
        const Icon = card.icon;

        return (
          <div key={index} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 ${iconBg} rounded-md flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value}
                      </div>
                      <div className="ml-2">
                        {renderChangeIndicator(card.change)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;