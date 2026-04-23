import React from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const SystemHealth = ({ data }) => {
  const systems = [
    {
      name: 'Database',
      status: data?.database?.status || 'healthy',
      response_time: data?.database?.responseTime || '12ms',
      uptime: data?.database?.uptime || '99.9%'
    },
    {
      name: 'API Server',
      status: data?.api?.status || 'healthy',
      response_time: data?.api?.responseTime || '45ms',
      uptime: data?.api?.uptime || '99.8%'
    },
    {
      name: 'Payment Gateway',
      status: data?.payment?.status || 'healthy',
      response_time: data?.payment?.responseTime || '120ms',
      uptime: data?.payment?.uptime || '99.5%'
    },
    {
      name: 'Email Service',
      status: data?.email?.status || 'warning',
      response_time: data?.email?.responseTime || '250ms',
      uptime: data?.email?.uptime || '98.9%'
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default:
        return <CheckCircleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
        <div className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
      
      <div className="space-y-4">
        {systems.map((system, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(system.status)}
              <div>
                <div className="font-medium text-gray-900">{system.name}</div>
                <div className="text-xs text-gray-500">
                  {system.response_time} • Uptime: {system.uptime}
                </div>
              </div>
            </div>
            <div className={`text-sm font-medium ${getStatusColor(system.status)}`}>
              {system.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Server Resources</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">CPU Usage</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${data?.resources?.cpu || 35}%` }}></div>
              </div>
              <span className="text-sm text-blue-700">{data?.resources?.cpu || 35}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Memory Usage</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${data?.resources?.memory || 62}%` }}></div>
              </div>
              <span className="text-sm text-blue-700">{data?.resources?.memory || 62}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">Storage</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${data?.resources?.storage || 78}%` }}></div>
              </div>
              <span className="text-sm text-blue-700">{data?.resources?.storage || 78}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;