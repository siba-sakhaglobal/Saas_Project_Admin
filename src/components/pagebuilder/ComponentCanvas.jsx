import React, { useState, useCallback } from 'react';
import {
  Eye,
  Edit3,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Settings,
  Database,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import DynamicSectionRenderer from '../common/DynamicSectionRenderer';

const ComponentCanvas = ({
  components,
  onSelectComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onMoveComponent,
  onToggleComponent,
  selectedComponent,
  viewMode = 'desktop'
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'w-full';
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      onMoveComponent(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const ComponentWrapper = ({ component, index, children }) => {
    const isSelected = selectedComponent?.id === component.id;
    const isDragging = draggedIndex === index;
    const isDragOver = dragOverIndex === index;

    return (
      <div
        className={`relative group transition-all duration-200 ${
          isDragging ? 'opacity-50' : ''
        } ${isDragOver ? 'border-t-4 border-primary-500' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
      >
        {/* Component Overlay */}
        <div
          className={`absolute inset-0 z-10 border-2 transition-all duration-200 ${
            isSelected
              ? 'border-primary-500 bg-primary-50/20'
              : 'border-transparent hover:border-primary-300 hover:bg-primary-50/10'
          }`}
          onClick={() => onSelectComponent(component)}
        >
          {/* Component Header */}
          <div className={`absolute top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between transform transition-all duration-200 ${
            isSelected || 'group-hover:translate-y-0 -translate-y-full opacity-0 group-hover:opacity-100'
          }`}>
            <div className="flex items-center space-x-3">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
              <div>
                <h4 className="text-sm font-medium text-gray-800">{component.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{component.type}</span>
                  {component.dataSource === 'database' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Database className="w-3 h-3 mr-1" />
                      Dynamic
                    </span>
                  )}
                  {!component.isActive && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {component.dataSource === 'database' && (
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Refresh Data"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement data refresh
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              <button
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Toggle Visibility"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComponent(component.id);
                }}
              >
                <Eye className={`w-4 h-4 ${component.isActive ? '' : 'opacity-50'}`} />
              </button>

              <button
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Edit Component"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(component);
                }}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                title="Duplicate Component"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateComponent(component);
                }}
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                title="Delete Component"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this component?')) {
                    onDeleteComponent(component.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {index > 0 && (
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Move Up"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveComponent(index, index - 1);
                  }}
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}

              {index < components.length - 1 && (
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                  title="Move Down"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveComponent(index, index + 1);
                  }}
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Component Content */}
        <div className={`${!component.isActive ? 'opacity-50' : ''}`}>
          {children}
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="flex items-center justify-center min-h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Components Added</h3>
        <p className="text-gray-600 mb-4 max-w-sm">
          Start building your page by adding components from the library on the left.
        </p>
        <div className="text-sm text-gray-500">
          <p>• Choose from static or dynamic components</p>
          <p>• Components with database integration load real data</p>
          <p>• Drag and drop to reorder components</p>
        </div>
      </div>
    </div>
  );

  const ComponentPreview = ({ component }) => {
    if (component.dataSource === 'database' && !component.dataLoaded) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-yellow-800 mb-1">
            Dynamic Component - Data Loading Required
          </h4>
          <p className="text-xs text-yellow-700 mb-3">
            This component loads data from: {component.dataSourceConfig?.table}
          </p>
          <div className="text-xs text-gray-600 bg-white rounded p-2 font-mono">
            Endpoint: {component.dataSourceConfig?.endpoint}
          </div>
        </div>
      );
    }

    try {
      // Convert component to section format for DynamicSectionRenderer
      const sectionData = {
        section_type: component.type,
        content: component.content,
        settings: component.settings,
        is_active: component.isActive
      };

      return <DynamicSectionRenderer section={sectionData} />;
    } catch (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-red-800 mb-1">Component Render Error</h4>
          <p className="text-xs text-red-700">
            Error rendering component: {error.message}
          </p>
        </div>
      );
    }
  };

  if (!components || components.length === 0) {
    return (
      <div className={`flex-1 p-6 bg-gray-50 overflow-y-auto ${getCanvasWidth()}`}>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className={`flex-1 p-6 bg-gray-50 overflow-y-auto ${getCanvasWidth()}`}>
      <div className="space-y-6">
        {components.map((component, index) => (
          <ComponentWrapper
            key={component.id}
            component={component}
            index={index}
          >
            <ComponentPreview component={component} />
          </ComponentWrapper>
        ))}
      </div>

      {/* Add Component Placeholder */}
      <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors cursor-pointer">
        <Settings className="w-6 h-6 mx-auto mb-2" />
        <p className="text-sm">Add more components from the library</p>
      </div>
    </div>
  );
};

export default ComponentCanvas;