import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const ChartSection = ({ monthlyStats }) => {
  // Process monthly statistics for charts
  const processedData = useMemo(() => {
    if (!monthlyStats || monthlyStats.length === 0) return [];

    return monthlyStats.map(item => ({
      month: new Date(item.month).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      pages: item.pages || 0,
      blog_posts: item.blog_posts || 0,
      events: item.events || 0,
      donations: item.donations || 0,
      users: item.users || 0
    }));
  }, [monthlyStats]);

  // Data for pie chart showing content distribution
  const contentDistribution = useMemo(() => {
    if (!monthlyStats || monthlyStats.length === 0) return [];

    const totals = monthlyStats.reduce((acc, item) => ({
      pages: acc.pages + (item.pages || 0),
      blog_posts: acc.blog_posts + (item.blog_posts || 0),
      events: acc.events + (item.events || 0)
    }), { pages: 0, blog_posts: 0, events: 0 });

    return [
      { name: 'Pages', value: totals.pages, color: '#3B82F6' },
      { name: 'Blog Posts', value: totals.blog_posts, color: '#10B981' },
      { name: 'Events', value: totals.events, color: '#8B5CF6' }
    ].filter(item => item.value > 0);
  }, [monthlyStats]);

  if (!monthlyStats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Monthly Overview</h3>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-center h-64 text-gray-500">
              No data available
            </div>
          </div>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Monthly Activity Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Monthly Content Activity</h3>
          <p className="text-sm text-gray-600">Content creation trends over time</p>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6B7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="pages" fill="#3B82F6" name="Pages" radius={[2, 2, 0, 0]} />
              <Bar dataKey="blog_posts" fill="#10B981" name="Blog Posts" radius={[2, 2, 0, 0]} />
              <Bar dataKey="events" fill="#8B5CF6" name="Events" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">User Growth</h3>
            <p className="text-sm text-gray-600">Monthly user registrations</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  name="Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Content Distribution</h3>
            <p className="text-sm text-gray-600">Total content by type</p>
          </div>
          <div className="card-body">
            {contentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={contentDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No content data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donations Trend */}
      {processedData.some(item => item.donations > 0) && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium">Donation Trends</h3>
            <p className="text-sm text-gray-600">Monthly donation activity</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="#EF4444" 
                  strokeWidth={3}
                  dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  name="Donations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartSection;