import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users, CheckCircle, BarChart3, MoreVertical } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import AttendanceMatrix from '../components/AttendanceMatrix';
import InternProfileModal from '../components/InternProfileModal';
import EditInternModal from '../components/EditInternModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import PerformanceEvaluation from '../components/PerformanceEvaluation';
import WeeklyTasks from '../components/WeeklyTasks';
import DeleteStreamModal from '../components/DeleteStreamModal';
import './StreamDetail.css';

const StreamDetail = () => {
  const { domain } = useParams();
  const { 
    getInternsByDomain, 
    updateIntern, 
    deleteIntern, 
    getDomainStats, 
    domainMapping,
    getStreamBySlug,
    deleteCustomStream,
    archiveCustomStream,
    archiveDefaultStream
  } = useInterns();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStreamMenu, setShowStreamMenu] = useState(false);
  const [showDeleteStreamModal, setShowDeleteStreamModal] = useState(false);
  
  // Get interns for this specific stream/domain
  const streamInterns = getInternsByDomain(domain);
  const domainStats = getDomainStats();
  const currentStreamName = domainMapping[domain] || domain;
  const streamInfo = getStreamBySlug(domain);
  const isCustomStream = streamInfo && !streamInfo.isDefault;
  
  // Always show menu for all streams
  const canShowMenu = true;

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

  const closeModals = () => {
    setShowProfileModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedIntern(null);
  };

  const handleDeleteStream = () => {
    setShowStreamMenu(false);
    setShowDeleteStreamModal(true);
  };

  const handleConfirmDeleteStream = () => {
    try {
      if (isCustomStream && streamInfo) {
        // For custom streams, try to delete permanently
        deleteCustomStream(streamInfo.id);
      } else {
        // For default streams, just archive them
        archiveDefaultStream(currentStreamName);
      }
      setShowDeleteStreamModal(false);
      window.location.href = '/';
    } catch (error) {
      alert(error.message);
    }
  };

  const handleArchiveStream = () => {
    if (isCustomStream && streamInfo) {
      archiveCustomStream(streamInfo.id);
    } else {
      archiveDefaultStream(currentStreamName);
    }
    setShowDeleteStreamModal(false);
    window.location.href = '/';
  };

  const currentStats = domainStats[currentStreamName] || { total: 0, active: 0, dropped: 0, completed: 0 };
  
  // Stream-specific coordinators and information
  const streamCoordinators = {
    'Web Development': 'Dr. Sarah Wilson',
    'App Development': 'Prof. Michael Chen',
    'AI/ML': 'Dr. Emily Rodriguez',
    'Blockchain': 'Prof. David Kim',
    'Automation': 'Dr. Lisa Wang',
    'Analytics': 'Prof. Robert Brown'
  };

  const streamDescriptions = {
    'Web Development': 'Full-stack web development using modern frameworks and technologies',
    'App Development': 'Mobile application development for iOS and Android platforms',
    'AI/ML': 'Machine learning and artificial intelligence research and development',
    'Blockchain': 'Distributed ledger technology and cryptocurrency development',
    'Automation': 'Process automation and robotic process automation (RPA)',
    'Analytics': 'Data analysis, visualization, and business intelligence'
  };
  
  const streamData = {
    name: currentStreamName,
    totalInterns: currentStats.total,
    activeInterns: currentStats.active,
    droppedInterns: currentStats.dropped,
    completedInterns: currentStats.completed,
    coordinator: streamCoordinators[currentStreamName] || 'TBD',
    description: streamDescriptions[currentStreamName] || 'Specialized internship program'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'interns', label: 'Intern List', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'weeklytask', label: 'WeeklyTask', icon: CheckCircle }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <div className="stream-stats">
              <div className="stat-card">
                <h3>Total Interns</h3>
                <span className="stat-number">{streamData.totalInterns}</span>
              </div>
              <div className="stat-card">
                <h3>Active Interns</h3>
                <span className="stat-number active">{streamData.activeInterns}</span>
              </div>
              <div className="stat-card">
                <h3>Dropped</h3>
                <span className="stat-number dropped">{streamData.droppedInterns}</span>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <span className="stat-number completed">{streamData.completedInterns}</span>
              </div>
            </div>
            
            <div className="stream-info">
              <h3>Stream Information</h3>
              <div className="info-container">
                <div className="info-row">
                  <span className="label">Stream Coordinator:</span>
                  <span className="value">{streamData.coordinator}</span>
                </div>
                <div className="info-row">
                  <span className="label">Total Interns:</span>
                  <span className="value">{streamData.totalInterns}</span>
                </div>
                <div className="info-row">
                  <span className="label">Stream Description:</span>
                  <span className="value">{streamData.description}</span>
                </div>
                <div className="info-row">
                  <span className="label">Active Status:</span>
                  <span className="value">{streamData.activeInterns > 0 ? 'Active Program' : 'No Active Interns'}</span>
                </div>
              </div>
            </div>

            {streamInterns.length > 0 && (
              <div className="recent-interns-overview">
                <h3>Recent Interns in this Stream</h3>
                <div className="interns-preview">
                  {streamInterns.slice(0, 3).map(intern => (
                    <div key={intern.id} className="intern-preview-card" onClick={() => handleAvatarClick(intern)}>
                      <div className="intern-avatar-small">
                        {getInitials(intern.name)}
                      </div>
                      <div className="intern-preview-info">
                        <h4>{intern.name}</h4>
                        <p>{intern.college}</p>
                        <span className={`status-pill status-${intern.status}`}>
                          {intern.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {streamInterns.length > 3 && (
                  <button 
                    className="view-all-interns-btn"
                    onClick={() => setActiveTab('interns')}
                  >
                    View All {streamData.totalInterns} Interns
                  </button>
                )}
              </div>
            )}
          </div>
        );
      
      case 'interns':
        return (
          <div className="interns-content">
            {streamInterns.length > 0 ? (
              <div className="interns-table-container">
                <div className="interns-header">
                  <h3>Interns in {streamData.name} Stream ({streamInterns.length})</h3>
                </div>
                <table className="interns-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>College</th>
                      <th>Batch</th>
                      <th>Status</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streamInterns.map(intern => (
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
                        <td>{intern.batch || 'Not Assigned'}</td>
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
                <h3>No Interns in {streamData.name} Stream</h3>
                <p>There are currently no interns assigned to this stream. Add interns to get started.</p>
                <button className="btn btn-primary">Add Intern to Stream</button>
              </div>
            )}
          </div>
        );
      
      case 'attendance':
        return (
          <div className="attendance-content">
            <div className="attendance-section-header">
              <h3>Attendance tracking for this stream</h3>
            </div>
            <AttendanceMatrix streamName={currentStreamName} />
          </div>
        );
      

      case 'performance':
        return (
          <div className="performance-content">
            <PerformanceEvaluation 
              streamName={streamData.name}
              batchId="default"
            />
          </div>
        );
      
      case 'weeklytask':
        return (
          <div className="weeklytask-content">
            <WeeklyTasks 
              batchId={null}
              streamName={streamData.name}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="stream-detail">
      <div className="stream-header">
        <div className="stream-header-top">
          <div>
            <h1>{streamData.name} Stream</h1>
            <p>{streamData.description}</p>
          </div>
          {canShowMenu && (
            <div className="stream-menu-container">
              <button 
                className="stream-menu-btn"
                onClick={() => setShowStreamMenu(!showStreamMenu)}
              >
                <MoreVertical size={20} />
              </button>
              {showStreamMenu && (
                <div className="stream-dropdown-menu">
                  <button 
                    className="menu-item delete-item"
                    onClick={handleDeleteStream}
                  >
                    {isCustomStream ? 'Delete Stream' : 'Archive Stream'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="stream-tabs">
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

      {showDeleteStreamModal && streamInfo && (
        <DeleteStreamModal
          stream={{ name: currentStreamName, description: streamData.description }}
          internCount={streamInterns.length}
          onClose={() => setShowDeleteStreamModal(false)}
          onConfirm={handleConfirmDeleteStream}
          onArchive={handleArchiveStream}
        />
      )}

    </div>
  );
};

export default StreamDetail;