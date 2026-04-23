import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { ChevronDown } from 'lucide-react';

const ProjectSelector = () => {
  const { projects, activeProject, setActiveProject } = useProject();
  const [isOpen, setIsOpen] = useState(false);

  if (!projects || projects.length === 0) {
    return null;
  }

  // If only one project, show it but don't allow switching
  if (projects.length === 1) {
    return (
      <div className="px-4 py-2 bg-white/50 backdrop-blur-sm rounded-2xl">
        <div className="text-sm font-medium text-neutral-700">
          {projects[0].name}
        </div>
        <div className="text-xs text-neutral-500">
          {projects[0].slug}
        </div>
      </div>
    );
  }

  // Multiple projects - show dropdown
  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary-400/50 shadow-soft transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-neutral-800">
            {activeProject?.name || 'Select Project'}
          </div>
          <div className="text-xs text-neutral-500">
            {activeProject?.slug}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-material-8 border border-white/20 py-2 z-50 animate-slide-down">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                setActiveProject(project.id);
                setIsOpen(false);
              }}
              className={`flex flex-col w-full px-4 py-3 text-left transition-colors ${
                activeProject?.id === project.id
                  ? 'bg-primary-50/50 border-l-4 border-primary-500'
                  : 'hover:bg-neutral-50/50'
              }`}
            >
              <div className="text-sm font-semibold text-neutral-800">
                {project.name}
              </div>
              <div className="text-xs text-neutral-500">
                {project.slug}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
