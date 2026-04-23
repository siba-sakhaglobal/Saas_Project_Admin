import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline';

const KPICards = ({ data, period }) => {
  const kpis = [
    {
      title: 'Total Revenue',
      value: data?.totalRevenue || '₹0',
      change: data?.revenueChange || 0,
      trend: data?.revenueTrend || 'up',
      icon: '💰',
      color: 'green'
    },
    {
      title: 'Active Campaigns',
      value: data?.activeCampaigns || 0,
      change: data?.campaignChange || 0,
      trend: data?.campaignTrend || 'up',
      icon: '🎯',
      color: 'blue'
    },
    {
      title: 'Total Donors',
      value: data?.totalDonors || 0,
      change: data?.donorChange || 0,
      trend: data?.donorTrend || 'up',
      icon: '👥',
      color: 'purple'
    },
    {
      title: 'Volunteer Applications',
      value: data?.volunteerApplications || 0,
      change: data?.volunteerChange || 0,
      trend: data?.volunteerTrend || 'up',
      icon: '🙋‍♀️',
      color: 'orange'
    },
    {
      title: 'Website Visitors',
      value: data?.websiteVisitors || 0,
      change: data?.visitorChange || 0,
      trend: data?.visitorTrend || 'up',
      icon: '📈',
      color: 'indigo'
    },
    {
      title: 'Engagement Rate',
      value: `${data?.engagementRate || 0}%`,
      change: data?.engagementChange || 0,
      trend: data?.engagementTrend || 'up',
      icon: '❤️',
      color: 'pink'
    }
  ];

  const getColorClasses = (color, isBackground = false) => {
    const colorMap = {
      green: isBackground ? 'bg-green-50 border-green-200' : 'text-green-600',
      blue: isBackground ? 'bg-blue-50 border-blue-200' : 'text-blue-600',
      purple: isBackground ? 'bg-purple-50 border-purple-200' : 'text-purple-600',
      orange: isBackground ? 'bg-orange-50 border-orange-200' : 'text-orange-600',
      indigo: isBackground ? 'bg-indigo-50 border-indigo-200' : 'text-indigo-600',
      pink: isBackground ? 'bg-pink-50 border-pink-200' : 'text-pink-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpis.map((kpi, index) => (
        <div 
          key={index} 
          className="group relative bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-material-4 hover:shadow-material-8 transition-all duration-500 hover:scale-105 hover:bg-white/80 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-14 h-14 ${getColorClasses(kpi.color, true)} rounded-2xl flex items-center justify-center text-2xl shadow-material-2 group-hover:shadow-material-4 transition-all duration-300 group-hover:scale-110`}>
                {kpi.icon}
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                kpi.change >= 0 
                  ? 'bg-accent-100 text-accent-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {kpi.change >= 0 ? (
                  <ArrowUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3" />
                )}
                <span>{formatChange(kpi.change)}</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className={`font-bold text-neutral-800 font-display group-hover:text-neutral-900 transition-colors ${
                kpi.title === 'Total Revenue' ? 'text-2xl break-all' : 'text-3xl'
              }`}>
                {kpi.value}
              </h3>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors">
                {kpi.title}
              </p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                kpi.trend === 'up' 
                  ? 'bg-accent-100 text-accent-600 group-hover:bg-accent-200' 
                  : 'bg-red-100 text-red-600 group-hover:bg-red-200'
              }`}>
                {kpi.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowTrendingDownIcon className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;