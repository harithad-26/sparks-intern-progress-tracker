import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, Edit2, Users } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import CreateProjectModal from './CreateProjectModal';
import ProjectDetailModal from './ProjectDetailModal';
import './BatchProjects.css';

const BatchProjects = ({ batchId }) => {
  const { getInternsByBatchId, getProjectsByBatch, updateProject, loadAllData, deleteProject } = useInterns();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [batchInterns, setBatchInterns] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Get projects from context
  const projects = getProjectsByBatch(batchId);

  // Load batch interns once
  useEffect(() => {
    const loadInterns = async () => {
      try {
        const interns = await getInternsByBatchId(batchId);
        setBatchInterns(interns);
      } catch (error) {
        console.error('Error loading batch interns:', error);
        setBatchInterns([]);
      }
    };

    if (batchId) {
      loadInterns();
    }
  }, [batchId, getInternsByBatchId]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowCreateModal(true);
    setShowDetailModal(false);
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await deleteProject(project.id);
        setShowDetailModal(false);
        loadAllData();
        setRefreshKey(prev => prev + 1);
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
    // Refresh the data to show new/updated projects
    loadAllData();
    setRefreshKey(prev => prev + 1);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProject(null);
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      await updateProject(projectId, { status: newStatus });
      // Refresh data after update
      loadAllData();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Error updating project status. Please try again.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'in_progress':
        return 'status-partial';
      case 'not_started':
        return 'status-not-completed';
      default:
        return 'status-not-completed';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#059669';
      case 'in_progress':
        return '#f59e0b';
      case 'not_started':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="batch-projects">
      <div className="projects-header">
        <h3>Projects - Batch {batchId}</h3>
        {projects.length > 0 && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Project
          </button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="projects-list">
          {projects.map(project => {
            const assignedInternsList = project.assignedInterns
              ? batchInterns.filter(intern => project.assignedInterns.includes(intern.id))
              : [];

            // Debug logging
            console.log('Project:', project.title, 'assignedInterns:', project.assignedInterns, 'assignedInternsList:', assignedInternsList);

            return (
              <div 
                key={project.id} 
                className="project-card clickable"
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-card-header">
                  <div className="project-header">
                    <div className="project-icon">
                      <FolderOpen size={24} color={getStatusColor(project.status)} />
                    </div>
                    <div className="project-info">
                      <h4 className="project-name">{project.title}</h4>
                      <p className="project-description">{project.description}</p>
                    </div>
                  </div>
                </div>

                {/* Always show assigned interns section */}
                <div className="project-interns">
                  <div className="interns-header">
                    <div className="interns-header-left">
                      <Users size={16} />
                      <span>Assigned Interns ({assignedInternsList.length})</span>
                    </div>
                    <button 
                      className="edit-project-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                      title="Edit Project"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                  {assignedInternsList.length > 0 ? (
                    <div className="interns-list">
                      {assignedInternsList.map(intern => (
                        <span key={intern.id} className="intern-badge">
                          {intern.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="no-interns-assigned">
                      <span>No interns assigned</span>
                    </div>
                  )}
                </div>

                {project.admin_remarks && (
                  <div className="project-remarks">
                    <div className="remarks-label">Admin Remarks:</div>
                    <p className="remarks-text">{project.admin_remarks}</p>
                  </div>
                )}
                
                <div className="project-footer">
                  <div className="project-meta">
                    <span className="project-date">
                      Created: {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    {project.updated_at && (
                      <span className="project-date">
                        Updated: {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="project-status-container">
                    <label htmlFor={`status-${project.id}`} className="status-label">
                      Status:
                    </label>
                    <select
                      id={`status-${project.id}`}
                      value={project.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleUpdateProjectStatus(project.id, e.target.value);
                      }}
                      className={`project-status-dropdown ${getStatusClass(project.status)}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="not_started">Not Completed</option>
                      <option value="in_progress">Partially Completed</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="projects-empty-state">
          <div className="empty-state-icon">
            <FolderOpen size={64} color="#9ca3af" strokeWidth={1.5} />
          </div>
          <h4>No Projects Yet</h4>
          <p>Projects for this batch will be displayed here once they are created.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Project
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          batchId={batchId}
          onClose={handleCloseModal}
          project={editingProject}
          onSubmit={() => {
            // Refresh data when project is created/updated
            loadAllData();
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}

      {showDetailModal && selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={handleCloseDetailModal}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          assignedInterns={batchInterns.filter(intern => 
            selectedProject.assignedInterns?.includes(intern.id)
          )}
        />
      )}
    </div>
  );
};

export default BatchProjects;
