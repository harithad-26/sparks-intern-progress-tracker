import React from 'react';
import { X, Edit2, Trash2, UserPlus } from 'lucide-react';
import './CreateProjectModal.css'; // Use the same CSS as CreateProjectModal

const ProjectDetailModal = ({ project, onClose, onEdit, onDelete, assignedInterns = [] }) => {
  if (!project) return null;

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'Partially Completed';
      case 'not_started':
        return 'Not Completed';
      default:
        return 'Unknown';
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container create-project-modal">
        <div className="modal-header">
          <h2>Project Details</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-form">
          <div className="modal-body">
            {/* Project Name - Display only */}
            <div className="form-group">
              <label htmlFor="name">
                Project Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={project.title || ''}
                readOnly
                className="readonly-input"
              />
            </div>

            {/* Project Description - Display only */}
            <div className="form-group">
              <label htmlFor="description">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={project.description || ''}
                readOnly
                rows="4"
                className="readonly-input"
              />
            </div>

            {/* Project Status - Display only */}
            <div className="form-group">
              <label htmlFor="status">Project Status</label>
              <input
                type="text"
                id="status"
                name="status"
                value={getStatusLabel(project.status)}
                readOnly
                className="readonly-input"
              />
            </div>

            {/* Assigned Interns - Display only */}
            <div className="form-group">
              <label>
                Assigned Interns
              </label>
              <div className="interns-selection-container">
                {assignedInterns.length > 0 ? (
                  <div className="interns-checkbox-list">
                    {assignedInterns.map(intern => (
                      <div key={intern.id} className="intern-checkbox-item readonly">
                        <div className="intern-checkbox-label">
                          <span className="intern-name">{intern.name}</span>
                          <span className="intern-details">{intern.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-interns-message">
                    <UserPlus size={20} color="#9ca3af" />
                    <span>No interns assigned to this project</span>
                  </div>
                )}
                {assignedInterns.length > 0 && (
                  <div className="selected-count">
                    {assignedInterns.length} intern(s) assigned
                  </div>
                )}
              </div>
            </div>

            {/* Admin Remarks - Display only */}
            <div className="form-group">
              <label htmlFor="adminRemarks">
                Admin Remarks
              </label>
              <textarea
                id="adminRemarks"
                name="adminRemarks"
                value={project.admin_remarks || ''}
                readOnly
                rows="6"
                className="admin-remarks-textarea readonly-input"
              />
            </div>

            <div className="batch-info">
              <span className="info-label">Created:</span>
              <span className="info-value">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <div className="normal-actions">
              <div className="left-actions">
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => onDelete(project)}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
              <div className="right-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => onEdit(project)}
                >
                  <Edit2 size={18} />
                  Edit Project
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;