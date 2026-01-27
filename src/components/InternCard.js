import React from 'react';
import { Mail, GraduationCap, Calendar, Users } from 'lucide-react';
import './InternCard.css';

const InternCard = ({ intern, onViewDetails }) => {
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
    <div className="intern-card">
      <div className="intern-header">
        <div className="intern-avatar">
          {getInitials(intern.name)}
        </div>
        <div className="intern-basic-info">
          <h3 className="intern-name">{intern.name}</h3>
          <p className="intern-domain">{intern.domain}</p>
        </div>
        <span className={`status-pill ${getStatusClass(intern.status)}`}>
          {intern.status}
        </span>
      </div>
      
      <div className="intern-details">
        <div className="detail-item">
          <Mail size={16} />
          <span>{intern.email}</span>
        </div>
        <div className="detail-item">
          <GraduationCap size={16} />
          <span>{intern.college}</span>
        </div>
        {intern.batch && (
          <div className="detail-item">
            <Users size={16} />
            <span>{intern.batch}</span>
          </div>
        )}
        <div className="detail-item">
          <Calendar size={16} />
          <span>Joined {intern.joinedDate}</span>
        </div>
      </div>
      
      <button 
        className="btn btn-primary view-details-btn"
        onClick={() => onViewDetails(intern)}
      >
        View Details
      </button>
    </div>
  );
};

export default InternCard;