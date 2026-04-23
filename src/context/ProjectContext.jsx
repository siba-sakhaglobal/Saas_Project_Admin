import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { hasApiKey } from '../services/cms';
import cms from '../services/cms';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const resolvedId = localStorage.getItem('project_id');
  const projectId = hasApiKey ? resolvedId : params.projectId;
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !projectId) {
      setLoading(false);
      return;
    }

    const loadProject = async () => {
      try {
        setLoading(true);
        setError(null);

        if (hasApiKey) {
          const { data } = await cms.raw().get('/api/projects');
          const allProjects = Array.isArray(data) ? data : data?.projects || [];
          const active = allProjects.find(p => p.id === projectId) || allProjects[0];
          if (active) {
            setProject(active);
            setProjects(allProjects);
            localStorage.setItem('project_id', active.id);
          }
        } else {
          const { data } = await cms.raw().get('/api/projects');
          const allProjects = Array.isArray(data) ? data : data?.projects || [];
          setProjects(allProjects);
          const active = allProjects.find(p => p.id === projectId);
          if (!active) {
            setError('Project not found');
            navigate('/', { replace: true });
            return;
          }
          setProject(active);
          localStorage.setItem('project_id', projectId);
          localStorage.setItem('active_project_id', projectId);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [isAuthenticated, projectId, navigate]);

  const switchProject = (newProjectId) => {
    if (hasApiKey) return;
    localStorage.setItem('project_id', newProjectId);
    localStorage.setItem('active_project_id', newProjectId);
    window.location.href = `/p/${newProjectId}/dashboard`;
  };

  return (
    <ProjectContext.Provider value={{ project, projectId, projects, switchProject, loading, error }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
};
