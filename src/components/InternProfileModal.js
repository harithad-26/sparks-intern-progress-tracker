import React from 'react';
import { X, Edit, Trash2, Mail, Phone, GraduationCap, Calendar } from 'lucide-react';
import './InternProfileModal.css';

const InternProfileModal = ({ intern, onClose, onEdit, onDelete }) => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal intern-profile-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Intern Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {getInitials(intern.name)}
            </div>
            <div className="profile-info">
              <h3>{intern.name}</h3>
              <p className="profile-domain">{intern.domain}</p>
              <span className={`status-pill ${getStatusClass(intern.status)}`}>
                {intern.status}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <h4>Contact Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <span>{intern.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <Phone size={16} />
                  <div>
                    <label>Phone</label>
                    <span>{intern.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Academic Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <GraduationCap size={16} />
                  <div>
                    <label>College / University</label>
                    <span>{intern.college}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <label>Academic Year</label>
                    <span>{intern.academicYear || '3rd Year'}</span>
                  </div>
                </div>
              </div>
            </div>

            {intern.additionalDetails && (
              <div className="detail-section">
                <h4>Additional Details</h4>
                <div className="additional-details">
                  <p>{intern.additionalDetails}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-primary edit-btn"
            onClick={() => onEdit(intern)}
          >
            <Edit size={16} />
            Edit
          </button>
          <button 
            className="btn btn-danger delete-btn"
            onClick={() => onDelete(intern)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default InternProfileModal;