import React from 'react';
import { useQuery } from '@tanstack/react-query';
import cms from '../../../services/cms';
import LoadingSpinner from '../../common/LoadingSpinner';
import StatsCards from './StatsCards';
import RecentActivities from './RecentActivities';
import ChartSection from './ChartSection';

const Dashboard = () => {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const response = await cms.raw().get('/api/dashboard/overview');
      return response.data;
    }
  });

  const { data: statistics, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-statistics'],
    queryFn: async () => {
      const response = await cms.raw().get('/api/dashboard/statistics');
      return response.data;
    }
  });

  if (overviewLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of your website's performance and content.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={overview?.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2">
          <ChartSection monthlyStats={overview?.monthly_stats} />
        </div>

        {/* Recent Activities */}
        <div>
          <RecentActivities activities={overview?.recent_activities} />
        </div>
      </div>

      {/* Additional Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Content Statistics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Content Overview</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {statistics.content?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.category}</p>
                      <p className="text-sm text-gray-500">
                        {item.published} published, {item.draft} draft
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {item.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Team Statistics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">Team Members</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                {statistics.team?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{item.category.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {item.active} active
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      {item.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Engagement Statistics */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium">User Engagement</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Newsletter Subscribers</p>
                    <p className="text-sm text-gray-500">Active subscriptions</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {statistics.engagement?.newsletter_subscribers}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Contact Inquiries</p>
                    <p className="text-sm text-gray-500">
                      {statistics.engagement?.new_inquiries} new
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {statistics.engagement?.total_inquiries}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Volunteer Applications</p>
                    <p className="text-sm text-gray-500">
                      {statistics.engagement?.pending_applications} pending
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {statistics.engagement?.total_volunteer_applications}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;