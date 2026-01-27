import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Archive, RotateCcw } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './ArchivedItems.css';

const ArchivedItems = () => {
  const navigate = useNavigate();
  const { 
    getAllBatchesIncludingArchived, 
    getAllCustomStreamsIncludingArchived,
    getAllArchivedDefaultStreams,
    restoreBatch,
    restoreCustomStream,
    restoreDefaultStream
  } = useInterns();
  
  const [activeTab, setActiveTab] = useState('batches');
  
  const archivedBatches = getAllBatchesIncludingArchived().filter(batch => batch.status === 'archived');
  const archivedCustomStreams = getAllCustomStreamsIncludingArchived().filter(stream => stream.status === 'archived');
  const archivedDefaultStreams = getAllArchivedDefaultStreams();
  const archivedStreams = [...archivedCustomStreams, ...archivedDefaultStreams];

  const handleRestoreBatch = (batchId) => {
    if (window.confirm('Are you sure you want to restore this batch?')) {
      restoreBatch(batchId);
    }
  };

  const handleRestoreStream = (stream) => {
    if (window.confirm('Are you sure you want to restore this stream?')) {
      if (stream.isDefault) {
        restoreDefaultStream(stream.name);
      } else {
        restoreCustomStream(stream.id);
      }
    }
  };

  return (
    <div className="archived-items-page">
      <div className="archived-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="header-content">
          <div className="header-title">
            <Archive size={28} />
            <h1>Archived Items</h1>
          </div>
          <p>View and restore archived batches and streams</p>
        </div>
      </div>

      <div className="archived-tabs">
        <button
          className={`tab-btn ${activeTab === 'batches' ? 'active' : ''}`}
          onClick={() => setActiveTab('batches')}
        >
          Batches ({archivedBatches.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'streams' ? 'active' : ''}`}
          onClick={() => setActiveTab('streams')}
        >
          Streams ({archivedStreams.length})
        </button>
      </div>

      <div className="archived-content">
        {activeTab === 'batches' && (
          <div className="archived-section">
            {archivedBatches.length > 0 ? (
              <div className="archived-grid">
                {archivedBatches.map(batch => (
                  <div key={batch.id} className="archived-card">
                    <div className="archived-card-header">
                      <h3>{batch.name}</h3>
                      <button
                        className="restore-btn"
                        onClick={() => handleRestoreBatch(batch.id)}
                        title="Restore batch"
                      >
                        <RotateCcw size={18} />
                        Restore
                      </button>
                    </div>
                    {batch.description && (
                      <p className="archived-description">{batch.description}</p>
                    )}
                    <div className="archived-meta">
                      <span className="archived-date">
                        Archived: {new Date(batch.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Archive size={48} color="#9ca3af" />
                <h3>No Archived Batches</h3>
                <p>Archived batches will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="archived-section">
            {archivedStreams.length > 0 ? (
              <div className="archived-grid">
                {archivedStreams.map((stream, index) => (
                  <div key={stream.id || `default-${index}`} className="archived-card">
                    <div className="archived-card-header">
                      <h3>{stream.name}</h3>
                      <button
                        className="restore-btn"
                        onClick={() => handleRestoreStream(stream)}
                        title="Restore stream"
                      >
                        <RotateCcw size={18} />
                        Restore
                      </button>
                    </div>
                    {stream.description && (
                      <p className="archived-description">{stream.description}</p>
                    )}
                    <div className="archived-meta">
                      <span className="archived-date">
                        {stream.isDefault ? 'Default Stream' : `Archived: ${new Date(stream.createdAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Archive size={48} color="#9ca3af" />
                <h3>No Archived Streams</h3>
                <p>Archived streams will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchivedItems;
