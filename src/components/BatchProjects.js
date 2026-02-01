import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, Edit2, Users } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import CreateProjectModal from './CreateProjectModal';
import './BatchProjects.css';

const BatchProjects = ({ batchId }) => {
  const { getInternsByBatchId, getProjectsByBatch, updateProject } = useInterns();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [batchInterns, setBatchInterns] = useState([]);

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

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
  };

  const handleUpdateProjectStatus = (projectId, newStatus) => {
    updateProject(batchId, projectId, { status: newStatus });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Partially Completed':
        return 'status-partial';
      case 'Not Completed':
        return 'status-not-completed';
      default:
        return 'status-not-completed';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return '#059669';
      case 'Partially Completed':
        return '#f59e0b';
      case 'Not Completed':
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

            return (
              <div key={project.id} className="project-card">
                <div className="project-card-header">
                  <div className="project-header">
                    <div className="project-icon">
                      <FolderOpen size={24} color={getStatusColor(project.status)} />
                    </div>
                    <div className="project-info">
                      <h4 className="project-name">{project.name}</h4>
                      <p className="project-description">{project.description}</p>
                    </div>
                  </div>
                </div>

                {assignedInternsList.length > 0 && (
                  <div className="project-interns">
                    <div className="interns-header">
                      <div className="interns-header-left">
                        <Users size={16} />
                        <span>Assigned Interns ({assignedInternsList.length})</span>
                      </div>
                      <button 
                        className="edit-project-btn"
                        onClick={() => handleEditProject(project)}
                        title="Edit Project"
                      >
                        <Edit2 size={18} />
                      </button>
                    </div>
                    <div className="interns-list">
                      {assignedInternsList.map(intern => (
                        <span key={intern.id} className="intern-badge">
                          {intern.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {project.adminRemarks && (
                  <div className="project-remarks">
                    <div className="remarks-label">Admin Remarks:</div>
                    <p className="remarks-text">{project.adminRemarks}</p>
                  </div>
                )}
                
                <div className="project-footer">
                  <div className="project-meta">
                    <span className="project-date">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                    {project.updatedAt && (
                      <span className="project-date">
                        Updated: {new Date(project.updatedAt).toLocaleDateString()}
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
                      onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                      className={`project-status-dropdown ${getStatusClass(project.status)}`}
                    >
                      <option value="Not Completed">Not Completed</option>
                      <option value="Partially Completed">Partially Completed</option>
                      <option value="Completed">Completed</option>
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
        />
      )}
    </div>
  );
};

export default BatchProjects;
