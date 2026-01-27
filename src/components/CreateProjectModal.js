import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './CreateProjectModal.css';

const CreateProjectModal = ({ batchId, onClose, onSubmit, project = null, onDelete }) => {
  const { getInternsByBatch, addProject, updateProject, deleteProject } = useInterns();
  const batchInterns = getInternsByBatch(`Batch ${batchId}`);
  
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Not Completed',
    assignedInterns: project?.assignedInterns || [],
    adminRemarks: project?.adminRemarks || ''
  });

  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditMode = !!project;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInternSelection = (internId) => {
    const id = parseInt(internId);
    setFormData(prev => {
      const isSelected = prev.assignedInterns.includes(id);
      return {
        ...prev,
        assignedInterns: isSelected
          ? prev.assignedInterns.filter(i => i !== id)
          : [...prev.assignedInterns, id]
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        assignedInterns: formData.assignedInterns,
        adminRemarks: formData.adminRemarks.trim()
      };

      if (isEditMode) {
        updateProject(batchId, project.id, projectData);
      } else {
        addProject(batchId, projectData);
      }

      // Call the onSubmit callback if provided (for parent component handling)
      if (onSubmit) {
        onSubmit({
          ...(project && { id: project.id }),
          ...projectData
        });
      }

      onClose();
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (project && project.id) {
      deleteProject(batchId, project.id);
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(project);
      }
      
      onClose();
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
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
          <h2>{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* Project Name - Text input (required) */}
            <div className="form-group">
              <label htmlFor="name">
                Project Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter project name..."
                className={errors.name ? 'error' : ''}
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Project Description - Multiline textarea (required) */}
            <div className="form-group">
              <label htmlFor="description">
                Project Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter detailed project description..."
                rows="4"
                className={errors.description ? 'error' : ''}
                required
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {/* Project Status - Dropdown with fixed values */}
            <div className="form-group">
              <label htmlFor="status">Project Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Not Completed">Not Completed</option>
                <option value="Partially Completed">Partially Completed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Assign Interns - Batch-Specific Dropdown/Multi-select */}
            <div className="form-group">
              <label>
                Assign Interns (Batch-Specific Dropdown)
              </label>
              <div className="interns-selection-container">
                {batchInterns.length > 0 ? (
                  <div className="interns-checkbox-list">
                    {batchInterns.map(intern => (
                      <label key={intern.id} className="intern-checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.assignedInterns.includes(intern.id)}
                          onChange={() => handleInternSelection(intern.id)}
                        />
                        <span className="intern-checkbox-label">
                          <span className="intern-name">{intern.name}</span>
                          <span className="intern-details">{intern.email}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="no-interns-message">
                    <UserPlus size={20} color="#9ca3af" />
                    <span>No interns available in this batch</span>
                  </div>
                )}
                {formData.assignedInterns.length > 0 && (
                  <div className="selected-count">
                    {formData.assignedInterns.length} intern(s) selected
                  </div>
                )}
              </div>
            </div>

            {/* Admin Remarks - Large white-space textarea */}
            <div className="form-group">
              <label htmlFor="adminRemarks">
                Admin Remarks
              </label>
              <textarea
                id="adminRemarks"
                name="adminRemarks"
                value={formData.adminRemarks}
                onChange={handleInputChange}
                placeholder="Enter remarks or feedback for this project…"
                rows="6"
                className="admin-remarks-textarea"
              />
              <div className="field-description">
                Used by admin to give project-related comments
              </div>
            </div>

            <div className="batch-info">
              <span className="info-label">Batch:</span>
              <span className="info-value">Batch {batchId}</span>
            </div>
          </div>

          <div className="modal-footer">
            {showDeleteConfirm ? (
              <div className="delete-confirmation">
                <p className="delete-message">Are you sure you want to delete this project? This action cannot be undone.</p>
                <div className="delete-actions">
                  <button type="button" className="btn btn-secondary" onClick={cancelDelete}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                    Delete Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="normal-actions">
                <div className="left-actions">
                  {isEditMode && (
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                      Delete
                    </button>
                  )}
                </div>
                <div className="right-actions">
                  <button type="button" className="btn btn-secondary" onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditMode ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
