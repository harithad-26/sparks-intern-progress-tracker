import React, { useState } from 'react';
import { X, Mail, Phone, GraduationCap, Calendar, MapPin, Edit, Trash2, Users } from 'lucide-react';
import EditInternModal from './EditInternModal';
import './InternDetailsPanel.css';

const InternDetailsPanel = ({ intern, onClose, onUpdateIntern, onDeleteIntern }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'dropped': return 'status-dropped';
      case 'completed': return 'status-completed';
      default: return 'status-active';
    }
  };

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleSaveIntern = (updatedIntern) => {
    if (onUpdateIntern) {
      onUpdateIntern(updatedIntern);
    }
    setShowEditModal(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDeleteIntern) {
      onDeleteIntern(intern.id);
    }
    onClose(); // Close the details panel after deletion
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Handle keyboard events for delete confirmation
  const handleDeleteKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancelDelete();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal intern-details-panel" onClick={e => e.stopPropagation()}>
        <div className="details-header">
          <div className="intern-profile">
            <div className="intern-avatar-large">
              {getInitials(intern.name)}
            </div>
            <div className="intern-title-info">
              <h2>{intern.name}</h2>
              <p className="intern-domain-title">{intern.domain}</p>
              <span className={`status-pill ${getStatusClass(intern.status)}`}>
                {intern.status}
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="details-content">
          <div className="info-section">
            <h3>Contact Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <Mail size={16} />
                <div>
                  <label>Email</label>
                  <span>{intern.email}</span>
                </div>
              </div>
              <div className="info-item">
                <Phone size={16} />
                <div>
                  <label>Phone</label>
                  <span>{intern.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Academic Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <GraduationCap size={16} />
                <div>
                  <label>College</label>
                  <span>{intern.college}</span>
                </div>
              </div>
              <div className="info-item">
                <Calendar size={16} />
                <div>
                  <label>Academic Year</label>
                  <span>{intern.academicYear || '3rd Year'}</span>
                </div>
              </div>
              {intern.batch && (
                <div className="info-item">
                  <Users size={16} />
                  <div>
                    <label>Batch</label>
                    <span>{intern.batch}</span>
                  </div>
                </div>
              )}
              <div className="info-item">
                <MapPin size={16} />
                <div>
                  <label>Joined Date</label>
                  <span>{intern.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Additional Details</h3>
            <div className="info-grid">
              <div className="additional-notes">
                <p>{intern.additionalDetails || 'No additional details provided.'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="details-actions">
          <button className="btn btn-primary" onClick={handleEditClick}>
            <Edit size={16} />
            Edit Intern
          </button>
          <button className="btn btn-danger" onClick={handleDeleteClick}>
            <Trash2 size={16} />
            Delete Intern
          </button>
        </div>
      </div>
      
      {showEditModal && (
        <EditInternModal
          intern={intern}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveIntern}
        />
      )}
      
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete} onKeyDown={handleDeleteKeyDown}>
          <div className="modal delete-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Intern</h2>
              <button className="close-btn" onClick={handleCancelDelete}>
                <X size={20} />
              </button>
            </div>
            
            <div className="delete-confirm-content">
              <div className="warning-icon">
                <Trash2 size={48} color="#dc3545" />
              </div>
              <p>
                Are you sure you want to delete <strong>{intern.name}</strong>?
              </p>
              <p className="warning-text">
                This action cannot be undone. All data associated with this intern will be permanently removed.
              </p>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={handleCancelDelete}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                <Trash2 size={16} />
                Delete Intern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternDetailsPanel;