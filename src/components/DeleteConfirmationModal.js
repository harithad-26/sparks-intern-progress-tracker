import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ intern, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal delete-confirmation-modal" onClick={e => e.stopPropagation()}>
        <div className="confirmation-content">
          <div className="warning-icon">
            <AlertTriangle size={48} />
          </div>
          
          <h2>Are you sure you want to delete this intern?</h2>
          
          <div className="intern-info">
            <p><strong>{intern.name}</strong></p>
            <p className="intern-email">{intern.email}</p>
          </div>
          
          <p className="warning-text">
            This action cannot be undone. All data associated with this intern will be permanently removed.
          </p>
        </div>
        
        <div className="confirmation-actions">
          <button 
            className="btn btn-secondary cancel-btn"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger confirm-delete-btn"
            onClick={() => onConfirm(intern)}
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;