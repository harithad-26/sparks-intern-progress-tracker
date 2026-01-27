import { AlertTriangle, X } from 'lucide-react';
import './DeleteBatchModal.css';

const DeleteBatchModal = ({ batch, internCount, onClose, onConfirm, onArchive }) => {
  const hasInterns = internCount > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal delete-batch-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{hasInterns ? 'Archive Batch' : 'Delete Batch'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="delete-batch-content">
          <div className="warning-icon">
            <AlertTriangle size={48} color={hasInterns ? '#f59e0b' : '#dc2626'} />
          </div>
          
          {hasInterns ? (
            <>
              <p className="warning-title">This batch contains {internCount} intern{internCount !== 1 ? 's' : ''}</p>
              <p className="warning-text">
                You cannot permanently delete a batch that has interns assigned to it. 
                You can archive this batch instead, which will hide it from the main view 
                but preserve all intern data.
              </p>
              <div className="batch-info">
                <strong>{batch.name}</strong>
                {batch.description && <p>{batch.description}</p>}
              </div>
            </>
          ) : (
            <>
              <p className="warning-title">Are you sure you want to delete this batch?</p>
              <p className="warning-text">
                This action cannot be undone. The batch will be permanently removed from the system.
              </p>
              <div className="batch-info">
                <strong>{batch.name}</strong>
                {batch.description && <p>{batch.description}</p>}
              </div>
            </>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {hasInterns ? (
            <button className="btn btn-warning" onClick={onArchive}>
              Archive Batch
            </button>
          ) : (
            <button className="btn btn-danger" onClick={onConfirm}>
              Delete Batch
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteBatchModal;
