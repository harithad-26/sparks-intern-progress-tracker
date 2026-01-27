import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import AddBatchModal from '../components/AddBatchModal';
import './Batches.css';

const Batches = () => {
  const navigate = useNavigate();
  const { getAllBatches, addBatch } = useInterns();
  const [showAddModal, setShowAddModal] = useState(false);
  
  const batches = getAllBatches();

  const handleBatchClick = (batch) => {
    navigate(`/batch/${batch.id}`);
  };

  const handleAddBatch = () => {
    setShowAddModal(true);
  };

  const handleSaveBatch = (batchData) => {
    try {
      addBatch(batchData);
      setShowAddModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="batches-page">
      <div className="batches-header">
        <div className="header-top">
          <button className="back-button" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <button className="add-batch-button" onClick={handleAddBatch}>
            <Plus size={20} />
            ADD BATCH
          </button>
        </div>
        <div className="header-content">
          <h1>Batches</h1>
          <p>Manage and view all training batches</p>
        </div>
      </div>
      
      <div className="batches-grid">
        {batches.map((batch) => (
          <div 
            key={batch.id} 
            className="batch-card"
            onClick={() => handleBatchClick(batch)}
          >
            <div className="batch-content">
              <h3 className="batch-title">{batch.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddBatchModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveBatch}
        />
      )}
    </div>
  );
};

export default Batches;