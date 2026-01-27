import { AlertTriangle, X } from 'lucide-react';
import './DeleteStreamModal.css';

const DeleteStreamModal = ({ stream, internCount, onClose, onConfirm, onArchive }) => {
  const hasInterns = internCount > 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal delete-stream-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{hasInterns ? 'Archive Stream' : 'Delete Stream'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="delete-stream-content">
          <div className="warning-icon">
            <AlertTriangle size={48} color={hasInterns ? '#f59e0b' : '#dc2626'} />
          </div>
          
          {hasInterns ? (
            <>
              <p className="warning-title">This stream contains {internCount} intern{internCount !== 1 ? 's' : ''}</p>
              <p className="warning-text">
                You cannot permanently delete a stream that has interns assigned to it. 
                You can archive this stream instead, which will hide it from the main view 
                but preserve all intern data.
              </p>
              <div className="stream-info">
                <strong>{stream.name}</strong>
                {stream.description && <p>{stream.description}</p>}
              </div>
            </>
          ) : (
            <>
              <p className="warning-title">Are you sure you want to delete this stream?</p>
              <p className="warning-text">
                This action cannot be undone. The stream will be permanently removed from the system.
              </p>
              <div className="stream-info">
                <strong>{stream.name}</strong>
                {stream.description && <p>{stream.description}</p>}
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
              Archive Stream
            </button>
          ) : (
            <button className="btn btn-danger" onClick={onConfirm}>
              Delete Stream
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteStreamModal;
