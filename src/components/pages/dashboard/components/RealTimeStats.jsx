import React from 'react';
import { EyeIcon, UserPlusIcon, CurrencyDollarIcon, HeartIcon } from '@heroicons/react/24/outline';

const RealTimeStats = ({ data }) => {
  const stats = [
    {
      label: 'Online Now',
      value: data?.currentVisitors || 0,
      icon: EyeIcon,
      color: 'text-green-600 bg-green-100'
    },
    {
      label: 'New Donors Today',
      value: data?.newDonorsToday || 0,
      icon: UserPlusIcon,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      label: 'Donations Today',
      value: `₹${data?.donationsToday || 0}`,
      icon: CurrencyDollarIcon,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      label: 'Active Campaigns',
      value: data?.activeCampaigns || 0,
      icon: HeartIcon,
      color: 'text-pink-600 bg-pink-100'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live updates</span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${stat.color} mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RealTimeStats;