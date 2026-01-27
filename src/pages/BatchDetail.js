import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, BarChart3, ArrowLeft, MoreVertical } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import AttendanceMatrix from '../components/AttendanceMatrix';
import InternProfileModal from '../components/InternProfileModal';
import EditInternModal from '../components/EditInternModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import AddInternModal from '../components/AddInternModal';
import PerformanceEvaluation from '../components/PerformanceEvaluation';
import WeeklyTasks from '../components/WeeklyTasks';
import BatchProjects from '../components/BatchProjects';
import DeleteBatchModal from '../components/DeleteBatchModal';
import './BatchDetail.css';

const BatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const { getInternsByBatch, updateIntern, deleteIntern, addIntern, getBatchById, deleteBatch, archiveBatch } = useInterns();
  const [activeTab, setActiveTab] = useState('interns');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchMenu, setShowBatchMenu] = useState(false);
  const [showDeleteBatchModal, setShowDeleteBatchModal] = useState(false);
  
  // Get batch and interns for this specific batch
  const batch = getBatchById(batchId);
  const batchName = batch ? batch.name : `Batch ${batchId}`;
  const batchInterns = getInternsByBatch(batchName);
  const batchData = {
    name: batchName,
    totalInterns: batchInterns.length,
    activeInterns: batchInterns.filter(intern => intern.status === 'active').length,
    droppedInterns: batchInterns.filter(intern => intern.status === 'dropped').length,
    completedInterns: batchInterns.filter(intern => intern.status === 'completed').length,
    coordinator: 'Dr. Sarah Wilson',
    description: `Training batch ${batchId} for comprehensive internship program`,
    startDate: '2024-01-15',
    endDate: '2024-06-15'
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarClick = (intern) => {
    setSelectedIntern(intern);
    setShowProfileModal(true);
  };

  const handleEditIntern = (intern) => {
    setShowProfileModal(false);
    setSelectedIntern(intern);
    setShowEditModal(true);
  };

  const handleSaveIntern = (updatedIntern) => {
    updateIntern(updatedIntern.id, updatedIntern);
    setShowEditModal(false);
    setSelectedIntern(null);
  };

  const handleDeleteIntern = (intern) => {
    setShowProfileModal(false);
    setSelectedIntern(intern);
    setShowDeleteModal(true);
  };

  const confirmDeleteIntern = (intern) => {
    deleteIntern(intern.id);
    setShowDeleteModal(false);
    setSelectedIntern(null);
    console.log('Deleted intern:', intern);
  };

  const handleAddIntern = () => {
    setShowAddModal(true);
  };

  const handleSaveNewIntern = (internData) => {
    // Add the intern with the current batch assigned
    const internWithBatch = {
      ...internData,
      batch: batchName
    };
    addIntern(internWithBatch);
    setShowAddModal(false);
    console.log('Added intern to batch:', internWithBatch);
  };

  const closeModals = () => {
    setShowProfileModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowAddModal(false);
    setSelectedIntern(null);
  };

  const handleDeleteBatch = () => {
    setShowBatchMenu(false);
    setShowDeleteBatchModal(true);
  };

  const handleConfirmDeleteBatch = () => {
    try {
      deleteBatch(batch.id);
      setShowDeleteBatchModal(false);
      navigate('/batches');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleArchiveBatch = () => {
    archiveBatch(batch.id);
    setShowDeleteBatchModal(false);
    navigate('/batches');
  };

  const tabs = [
    { id: 'interns', label: 'Intern List', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: BarChart3 },
    { id: 'weeklytask', label: 'WeeklyTask', icon: CheckCircle }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'interns':
        return (
          <div className="interns-content">
            {batchInterns.length > 0 ? (
              <div className="interns-table-container">
                <div className="interns-header">
                  <h3>Interns in {batchData.name} ({batchInterns.length})</h3>
                </div>
                <table className="interns-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>College</th>
                      <th>Domain</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchInterns.map(intern => (
                      <tr key={intern.id} className="intern-row">
                        <td className="name-cell">
                          <div className="name-with-avatar">
                            <div 
                              className="intern-avatar-small"
                              onClick={() => handleAvatarClick(intern)}
                            >
                              {getInitials(intern.name)}
                            </div>
                            <span className="intern-name">{intern.name}</span>
                          </div>
                        </td>
                        <td>{intern.email}</td>
                        <td>{intern.college}</td>
                        <td>{intern.domain}</td>
                        <td>
                          <span className={`status-pill status-${intern.status}`}>
                            {intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}
                          </span>
                        </td>
                        <td>{intern.joinedDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Users size={48} color="#9ca3af" />
                </div>
                <h3>No Interns in {batchData.name}</h3>
                <p>There are currently no interns assigned to this batch.</p>
                <button className="btn btn-primary" onClick={handleAddIntern}>Add Intern to Batch</button>
              </div>
            )}
          </div>
        );
      
      case 'attendance':
        return (
          <div className="attendance-content">
            <div className="attendance-section-header">
              <h3>Attendance tracking for {batchData.name}</h3>
            </div>
            <AttendanceMatrix batchId={batchId} />
          </div>
        );
      

      case 'performance':
        return (
          <div className="performance-content">
            <PerformanceEvaluation 
              streamName="Mixed Streams"
              batchId={batchId}
            />
          </div>
        );
      
      case 'projects':
        return (
          <div className="projects-content">
            <BatchProjects batchId={batchId} />
          </div>
        );
      
      case 'weeklytask':
        return (
          <div className="weeklytask-content">
            <WeeklyTasks 
              batchId={batchId}
              streamName="Mixed Streams"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="batch-detail">
      <div className="batch-header">
        <div className="batch-header-top">
          <button className="back-button" onClick={() => navigate('/batches')}>
            <ArrowLeft size={20} />
            Back to Batches
          </button>
          <div className="batch-menu-container">
            <button 
              className="batch-menu-btn"
              onClick={() => setShowBatchMenu(!showBatchMenu)}
            >
              <MoreVertical size={20} />
            </button>
            {showBatchMenu && (
              <div className="batch-dropdown-menu">
                <button 
                  className="menu-item delete-item"
                  onClick={handleDeleteBatch}
                >
                  Delete Batch
                </button>
              </div>
            )}
          </div>
        </div>
        <h1>{batchData.name}</h1>
        <p>{batchData.description}</p>
      </div>

      <div className="batch-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="tab-content">
        {renderTabContent()}
      </div>

      {showProfileModal && selectedIntern && (
        <InternProfileModal
          intern={selectedIntern}
          onClose={closeModals}
          onEdit={handleEditIntern}
          onDelete={handleDeleteIntern}
        />
      )}

      {showEditModal && selectedIntern && (
        <EditInternModal
          intern={selectedIntern}
          onClose={closeModals}
          onSave={handleSaveIntern}
        />
      )}

      {showDeleteModal && selectedIntern && (
        <DeleteConfirmationModal
          intern={selectedIntern}
          onClose={closeModals}
          onConfirm={confirmDeleteIntern}
        />
      )}

      {showAddModal && (
        <AddInternModal
          onClose={closeModals}
          onSave={handleSaveNewIntern}
          preselectedBatch={batchName}
        />
      )}

      {showDeleteBatchModal && batch && (
        <DeleteBatchModal
          batch={batch}
          internCount={batchInterns.length}
          onClose={() => setShowDeleteBatchModal(false)}
          onConfirm={handleConfirmDeleteBatch}
          onArchive={handleArchiveBatch}
        />
      )}

    </div>
  );
};

export default BatchDetail;