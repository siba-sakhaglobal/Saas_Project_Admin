import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  GripVertical, 
  Edit, 
  Settings as SettingsIcon,
  Code2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const CanvasArea = ({
  sections,
  selectedSection,
  viewMode,
  isDragging,
  onSectionSelect,
  onSectionUpdate,
  onSectionDelete,
  onSectionDuplicate,
  onSectionReorder,
  setIsDragging
}) => {
  const [hoveredSection, setHoveredSection] = useState(null);

  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      default:
        return 'max-w-full';
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);
    
    if (!result.destination) return;

    const { source, destination } = result;
    onSectionReorder(source.index, destination.index);
  };

  const toggleSectionVisibility = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      onSectionUpdate(sectionId, { is_active: !section.is_active });
    }
  };

  const moveSection = (sectionId, direction) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex >= 0 && newIndex < sections.length) {
      onSectionReorder(currentIndex, newIndex);
    }
  };

  const renderSectionContent = (section) => {
    if (section.html) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: section.html }}
          className={`transition-opacity ${section.is_active ? 'opacity-100' : 'opacity-50'}`}
        />
      );
    }

    // Fallback for sections without HTML
    return (
      <div className="p-8 bg-gray-100 text-center text-gray-500 border-2 border-dashed border-gray-300">
        <div className="text-sm font-medium mb-2">{section.type}</div>
        <div className="text-xs">Click to edit this section</div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto">
      <div className="p-6">
        <div className={`mx-auto ${getCanvasWidth()} transition-all duration-300`}>
          {sections.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <SettingsIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Start Building Your Page
              </h3>
              <p className="text-gray-500 mb-6">
                Add sections from the library to start building your page
              </p>
            </div>
          ) : (
            <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {sections.map((section, index) => (
                      <Draggable
                        key={section.id}
                        draggableId={section.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="relative group"
                            onMouseEnter={() => setHoveredSection(section.id)}
                            onMouseLeave={() => setHoveredSection(null)}
                          >
                            {/* Section Toolbar */}
                            {(hoveredSection === section.id || selectedSection?.id === section.id) && (
                              <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 bg-white shadow-lg rounded-lg p-1 border">
                                {/* Drag Handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-1 text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing"
                                  title="Drag to reorder"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>

                                {/* Move Up */}
                                <button
                                  onClick={() => moveSection(section.id, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </button>

                                {/* Move Down */}
                                <button
                                  onClick={() => moveSection(section.id, 'down')}
                                  disabled={index === sections.length - 1}
                                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Move down"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </button>

                                <div className="w-px h-4 bg-gray-300" />

                                {/* Edit */}
                                <button
                                  onClick={() => onSectionSelect(section)}
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                  title="Edit section"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>

                                {/* Toggle Visibility */}
                                <button
                                  onClick={() => toggleSectionVisibility(section.id)}
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                  title={section.is_active ? 'Hide section' : 'Show section'}
                                >
                                  {section.is_active ? (
                                    <Eye className="h-4 w-4" />
                                  ) : (
                                    <EyeOff className="h-4 w-4" />
                                  )}
                                </button>

                                {/* Duplicate */}
                                <button
                                  onClick={() => onSectionDuplicate(section.id)}
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                  title="Duplicate section"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => onSectionDelete(section.id)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                  title="Delete section"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}

                            {/* Section Label */}
                            {(hoveredSection === section.id || selectedSection?.id === section.id) && (
                              <div className="absolute top-2 left-2 z-20">
                                <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded">
                                  {section.type}
                                </span>
                              </div>
                            )}

                            {/* Section Content */}
                            <div
                              className={`relative bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
                                selectedSection?.id === section.id
                                  ? 'border-primary-500 ring-2 ring-primary-200'
                                  : hoveredSection === section.id
                                  ? 'border-gray-300'
                                  : 'border-transparent'
                              } ${
                                snapshot.isDragging ? 'shadow-xl rotate-1' : ''
                              }`}
                              onClick={() => onSectionSelect(section)}
                            >
                              {/* CSS Injection */}
                              {section.css && (
                                <style>
                                  {section.css}
                                </style>
                              )}

                              {renderSectionContent(section)}

                              {/* Hidden Section Overlay */}
                              {!section.is_active && (
                                <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center rounded-lg">
                                  <div className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center">
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Hidden Section
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Add Section Button */}
          {sections.length > 0 && (
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-gray-100 text-gray-500 text-sm">
                    Add more sections from the library
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Info */}
      <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 text-sm text-gray-600 border">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-primary-600 rounded-full mr-2"></div>
            <span className="capitalize">{viewMode}</span>
          </div>
          <span>•</span>
          <span>{sections.length} sections</span>
          {selectedSection && (
            <>
              <span>•</span>
              <span>Editing: {selectedSection.type}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CanvasArea;