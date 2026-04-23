// Simple placeholder components for the enterprise dashboard

import React from 'react';

export const DonationInsights = ({ data }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-material-8 border border-white/20 p-8 hover:bg-white/80 transition-all duration-500 group">
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl flex items-center justify-center shadow-material-2">
        <span className="text-2xl">💰</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 font-display">Donation Insights</h3>
        <p className="text-neutral-600">Financial performance overview</p>
      </div>
    </div>
    <div className="space-y-6">
      <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Total This Month</span>
        <span className="text-3xl font-bold text-accent-600">₹{data?.totalMonth || '25,480'}</span>
      </div>
      <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Average Donation</span>
        <span className="text-2xl font-bold text-primary-600">₹{data?.avgDonation || '78'}</span>
      </div>
      <div className="flex justify-between items-center p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Top Campaign</span>
        <span className="text-lg font-semibold text-secondary-600">{data?.topCampaign || 'Education Fund'}</span>
      </div>
    </div>
  </div>
);

export const ContentManagement = ({ data }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-material-8 border border-white/20 p-8 hover:bg-white/80 transition-all duration-500">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-material-2">
        <span className="text-lg">📄</span>
      </div>
      <h3 className="text-xl font-bold text-neutral-800 font-display">Content Overview</h3>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Published Posts</span>
        <span className="text-lg font-bold text-accent-600">{data?.publishedPosts || 24}</span>
      </div>
      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Draft Posts</span>
        <span className="text-lg font-bold text-orange-600">{data?.draftPosts || 3}</span>
      </div>
      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Active Pages</span>
        <span className="text-lg font-bold text-primary-600">{data?.activePages || 12}</span>
      </div>
      <div className="flex justify-between items-center p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Media Files</span>
        <span className="text-lg font-bold text-secondary-600">{data?.mediaFiles || 156}</span>
      </div>
    </div>
  </div>
);

export const UserEngagement = ({ data }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-material-8 border border-white/20 p-8 hover:bg-white/80 transition-all duration-500">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center shadow-material-2">
        <span className="text-lg">👥</span>
      </div>
      <h3 className="text-xl font-bold text-neutral-800 font-display">User Engagement</h3>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Newsletter Subscribers</span>
        <span className="text-xl font-bold text-primary-600">{data?.subscribers || '2,341'}</span>
      </div>
      <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Active Volunteers</span>
        <span className="text-xl font-bold text-accent-600">{data?.volunteers || 45}</span>
      </div>
      <div className="flex justify-between items-center p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <span className="text-neutral-600 font-medium">Event Registrations</span>
        <span className="text-xl font-bold text-secondary-600">{data?.registrations || 127}</span>
      </div>
    </div>
  </div>
);

export const PerformanceMetrics = ({ data }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-material-8 border border-white/20 p-8 hover:bg-white/80 transition-all duration-500">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-material-2">
        <span className="text-lg">📊</span>
      </div>
      <h3 className="text-xl font-bold text-neutral-800 font-display">Performance</h3>
    </div>
    <div className="space-y-6">
      <div className="p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <span className="text-neutral-600 font-medium">Campaign Success</span>
          <span className="text-lg font-bold text-accent-600">{data?.successRate || 87}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-accent-400 to-accent-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${data?.successRate || 87}%` }}></div>
        </div>
      </div>
      <div className="p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <span className="text-neutral-600 font-medium">Goal Achievement</span>
          <span className="text-lg font-bold text-primary-600">{data?.goalAchievement || 94}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${data?.goalAchievement || 94}%` }}></div>
        </div>
      </div>
      <div className="p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <span className="text-neutral-600 font-medium">Donor Retention</span>
          <span className="text-lg font-bold text-secondary-600">{data?.retention || 76}%</span>
        </div>
        <div className="w-full bg-neutral-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-secondary-400 to-secondary-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${data?.retention || 76}%` }}></div>
        </div>
      </div>
    </div>
  </div>
);

export const CampaignAnalytics = ({ data }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-material-8 border border-white/20 p-8 hover:bg-white/80 transition-all duration-500">
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl flex items-center justify-center shadow-material-2">
        <span className="text-2xl">🎯</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 font-display">Campaign Performance</h3>
        <p className="text-neutral-600">Active fundraising campaigns</p>
      </div>
    </div>
    <div className="space-y-6">
      {(data || [
        { name: 'Education Fund', progress: 90, raised: 45000, goal: 50000, color: 'from-primary-400 to-primary-600' },
        { name: 'Healthcare Initiative', progress: 80, raised: 32000, goal: 40000, color: 'from-accent-400 to-accent-600' },
        { name: 'Environmental Project', progress: 70, raised: 21000, goal: 30000, color: 'from-secondary-400 to-secondary-600' }
      ]).map((campaign, index) => (
        <div key={index} className="p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-all duration-300 hover:scale-105 group">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-neutral-800">{campaign.name}</span>
            <span className="text-sm font-medium text-neutral-600 bg-white/70 px-3 py-1 rounded-full">
              ₹{campaign.raised?.toLocaleString()} / ₹{campaign.goal?.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`bg-gradient-to-r ${campaign.color || 'from-primary-400 to-primary-600'} h-3 rounded-full transition-all duration-1000 group-hover:shadow-material-2`}
              style={{ width: `${campaign.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-neutral-500">{campaign.progress}% complete</span>
            <span className="text-xs font-medium text-accent-600">₹{(campaign.goal - campaign.raised).toLocaleString()} remaining</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const GeographicDistribution = ({ data }) => (
  <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-material-8 border border-white/20 p-8 hover:bg-white/80 transition-all duration-500">
    <div className="flex items-center space-x-4 mb-8">
      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-material-2">
        <span className="text-2xl">🌍</span>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 font-display">Geographic Distribution</h3>
        <p className="text-neutral-600">Global donor distribution</p>
      </div>
    </div>
    <div className="space-y-4">
      {(data || [
        { country: 'United States', donors: 1234, percentage: 45, flag: '🇺🇸', color: 'from-primary-400 to-primary-600' },
        { country: 'India', donors: 876, percentage: 32, flag: '🇮🇳', color: 'from-accent-400 to-accent-600' },
        { country: 'United Kingdom', donors: 432, percentage: 16, flag: '🇬🇧', color: 'from-secondary-400 to-secondary-600' },
        { country: 'Others', donors: 189, percentage: 7, flag: '🌐', color: 'from-orange-400 to-orange-600' }
      ]).map((location, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl hover:bg-white/70 transition-all duration-300 hover:scale-105 group">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{location.flag}</span>
            <div>
              <div className="font-bold text-neutral-800">{location.country}</div>
              <div className="text-sm text-neutral-600">{location.donors.toLocaleString()} donors</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-neutral-800 mb-2">{location.percentage}%</div>
            <div className="w-20 bg-neutral-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${location.color} h-2 rounded-full transition-all duration-1000 group-hover:shadow-material-2`}
                style={{ width: `${location.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);