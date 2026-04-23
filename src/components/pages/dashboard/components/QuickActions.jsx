import React from 'react';
import { 
  PlusIcon, 
  DocumentPlusIcon, 
  UserPlusIcon, 
  MegaphoneIcon,
  EnvelopeIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

const QuickActions = () => {
  const actions = [
    {
      title: 'New Campaign',
      description: 'Create donation campaign',
      icon: PlusIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => console.log('New campaign')
    },
    {
      title: 'Add Blog Post',
      description: 'Write new article',
      icon: DocumentPlusIcon,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => console.log('New blog post')
    },
    {
      title: 'Add Team Member',
      description: 'Add new staff',
      icon: UserPlusIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('New team member')
    },
    {
      title: 'Send Newsletter',
      description: 'Email subscribers',
      icon: EnvelopeIcon,
      color: 'bg-pink-600 hover:bg-pink-700',
      action: () => console.log('Send newsletter')
    },
    {
      title: 'Create Event',
      description: 'Schedule new event',
      icon: MegaphoneIcon,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => console.log('New event')
    },
    {
      title: 'Settings',
      description: 'System configuration',
      icon: CogIcon,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: () => console.log('Settings')
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.action}
              className={`${action.color} text-white p-4 rounded-lg transition-colors duration-200 text-left`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-6 h-6" />
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs opacity-75">{action.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Recent Shortcuts</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="text-sm text-gray-700">View Donations</div>
            <div className="text-xs text-gray-500">⌘D</div>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="text-sm text-gray-700">Analytics</div>
            <div className="text-xs text-gray-500">⌘A</div>
          </div>
          <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
            <div className="text-sm text-gray-700">User Management</div>
            <div className="text-xs text-gray-500">⌘U</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;