import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

const AdvancedCharts = ({ data, period }) => {
  const [activeChart, setActiveChart] = useState('revenue');

  // Sample data - in real app, this would come from props
  const revenueData = data?.revenue || [
    { month: 'Jan', donations: 12000, campaigns: 8, donors: 145 },
    { month: 'Feb', donations: 15000, campaigns: 12, donors: 198 },
    { month: 'Mar', donations: 18000, campaigns: 15, donors: 234 },
    { month: 'Apr', donations: 22000, campaigns: 18, donors: 287 },
    { month: 'May', donations: 25000, campaigns: 20, donors: 321 },
    { month: 'Jun', donations: 28000, campaigns: 22, donors: 356 }
  ];

  const campaignPerformance = data?.campaigns || [
    { name: 'Education Fund', raised: 45000, goal: 50000, donors: 234 },
    { name: 'Healthcare Initiative', raised: 32000, goal: 40000, donors: 187 },
    { name: 'Environmental Project', raised: 28000, goal: 35000, donors: 156 },
    { name: 'Community Development', raised: 23000, goal: 30000, donors: 134 }
  ];

  const donationChannels = data?.channels || [
    { name: 'Website', value: 45, color: '#0088FE' },
    { name: 'Events', value: 25, color: '#00C49F' },
    { name: 'Social Media', value: 20, color: '#FFBB28' },
    { name: 'Email', value: 10, color: '#FF8042' }
  ];

  const userEngagement = data?.engagement || [
    { date: '2024-01-01', pageViews: 1200, uniqueVisitors: 800, bounceRate: 35 },
    { date: '2024-01-02', pageViews: 1350, uniqueVisitors: 920, bounceRate: 32 },
    { date: '2024-01-03', pageViews: 1100, uniqueVisitors: 750, bounceRate: 38 },
    { date: '2024-01-04', pageViews: 1400, uniqueVisitors: 980, bounceRate: 30 },
    { date: '2024-01-05', pageViews: 1600, uniqueVisitors: 1100, bounceRate: 28 }
  ];

  const renderChart = () => {
    switch (activeChart) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="donations" fill="#3B82F6" name="Donations ($)" />
              <Line yAxisId="right" type="monotone" dataKey="donors" stroke="#EF4444" strokeWidth={3} name="New Donors" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'campaigns':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={campaignPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="raised" fill="#10B981" name="Raised" />
              <Bar dataKey="goal" fill="#D1D5DB" name="Goal" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'channels':
        return (
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={400}>
              <PieChart>
                <Pie
                  data={donationChannels}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {donationChannels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-50% space-y-4">
              {donationChannels.map((channel, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: channel.color }}
                  ></div>
                  <div className="flex-1">
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-sm text-gray-500">{channel.value}% of total</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'engagement':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={userEngagement}>
              <defs>
                <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorPageViews)"
                name="Page Views"
              />
              <Area 
                type="monotone" 
                dataKey="uniqueVisitors" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorVisitors)"
                name="Unique Visitors"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const chartTabs = [
    { key: 'revenue', label: 'Revenue & Growth', icon: '📊' },
    { key: 'campaigns', label: 'Campaign Performance', icon: '🎯' },
    { key: 'channels', label: 'Donation Channels', icon: '📈' },
    { key: 'engagement', label: 'User Engagement', icon: '👥' }
  ];

  return (
    <div>
      {/* Chart Tabs */}
      <div className="flex space-x-4 mb-6">
        {chartTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveChart(tab.key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeChart === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-gray-50 rounded-lg p-4">
        {renderChart()}
      </div>

      {/* Chart Insights */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-blue-600 font-medium">Top Performing</div>
          <div className="text-lg font-bold text-blue-900">Education Fund</div>
          <div className="text-xs text-blue-600">90% of goal reached</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-green-600 font-medium">Growth Rate</div>
          <div className="text-lg font-bold text-green-900">+23.5%</div>
          <div className="text-xs text-green-600">vs last month</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-purple-600 font-medium">Avg. Donation</div>
          <div className="text-lg font-bold text-purple-900">₹78</div>
          <div className="text-xs text-purple-600">+₹12 increase</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedCharts;