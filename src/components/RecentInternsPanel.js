import React from 'react';
import { Clock } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './RecentInternsPanel.css';

const RecentInternsPanel = ({ onViewIntern, searchTerm }) => {
  const { getAllInterns, searchInterns } = useInterns();
  
  // Get recent interns (last 5 added) or filtered interns if searching
  const allInterns = searchTerm ? searchInterns(searchTerm) : getAllInterns();
  const recentInterns = allInterns
    .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))
    .slice(0, searchTerm ? Math.min(allInterns.length, 10) : 5); // Show more results when searching

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  return (
    <div className="recent-interns-panel">
      <div className="panel-header">
        <div className="header-title">
          <Clock size={20} />
          <h3>{searchTerm ? `Search Results (${recentInterns.length})` : 'Recent Interns'}</h3>
        </div>
      </div>
      
      <div className="recent-interns-list">
        {recentInterns.length > 0 ? (
          recentInterns.map(intern => (
            <div 
              key={intern.id} 
              className="recent-intern-item"
              onClick={() => onViewIntern(intern)}
            >
              <div className="intern-avatar-small">
                {getInitials(intern.name)}
              </div>
              <div className="intern-info">
                <h4 className="intern-name-small">{intern.name}</h4>
                <p className="intern-domain-small">{intern.domain}</p>
                <span className={`status-pill-small ${getStatusClass(intern.status)}`}>
                  {intern.status}
                </span>
              </div>
            </div>
          ))
        ) : searchTerm ? (
          <div className="no-results">
            <p>No interns found matching "{searchTerm}"</p>
          </div>
        ) : (
          <div className="no-results">
            <p>No recent interns</p>
          </div>
        )}
      </div>
      
      <div className="panel-footer">
        <button className="view-all-btn">View All Interns</button>
      </div>
    </div>
  );
};

export default RecentInternsPanel;