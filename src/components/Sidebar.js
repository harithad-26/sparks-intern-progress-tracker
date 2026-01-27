import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Smartphone, 
  Brain, 
  Link as LinkIcon, 
  Zap, 
  BarChart3,
  Settings,
  Plus,
  LayoutDashboard,
  Users,
  Archive
} from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, onAddStream }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCustomStreams } = useInterns();

  // Default streams with icons
  const defaultStreams = [
    { name: 'App Development', slug: 'app-development', icon: Smartphone },
    { name: 'AI/ML', slug: 'ai-ml', icon: Brain },
    { name: 'Web Development', slug: 'web-development', icon: Globe },
    { name: 'Blockchain', slug: 'blockchain', icon: LinkIcon },
    { name: 'Automation', slug: 'automation', icon: Zap },
    { name: 'Analytics', slug: 'analytics', icon: BarChart3 }
  ];

  // Get custom streams and add default icon
  const customStreams = getCustomStreams().map(stream => ({
    ...stream,
    icon: Globe // Default icon for custom streams
  }));

  // Combine default and custom streams
  const allStreams = [...defaultStreams, ...customStreams];

  const handleStreamClick = (streamSlug) => {
    navigate(`/stream/${streamSlug}`);
    onClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    onClose();
  };

  const handleArchivedClick = () => {
    navigate('/archived');
    onClose();
  };

  const handleDashboardClick = () => {
    navigate('/');
    onClose();
  };

  const handleAllInternsClick = () => {
    navigate('/interns');
    onClose();
  };

  const handleAddStreamClick = () => {
    onAddStream();
    onClose();
  };

  const isStreamActive = (streamSlug) => {
    return location.pathname === `/stream/${streamSlug}`;
  };

  const isDashboardActive = () => {
    return location.pathname === '/';
  };

  const isAllInternsActive = () => {
    return location.pathname === '/interns';
  };

  const isSettingsActive = () => {
    return location.pathname === '/settings';
  };

  const isArchivedActive = () => {
    return location.pathname === '/archived';
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Navigation</h3>
        </div>
        
        <nav className="sidebar-nav">
          <button
            onClick={handleDashboardClick}
            className={`nav-item ${isDashboardActive() ? 'active' : ''}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          
          <button
            onClick={handleAllInternsClick}
            className={`nav-item ${isAllInternsActive() ? 'active' : ''}`}
          >
            <Users size={20} />
            <span>All Interns</span>
          </button>
          
          <div className="nav-section">
            <div className="nav-section-title">Streams</div>
            {allStreams.map((stream) => {
              const Icon = stream.icon;
              const isActive = isStreamActive(stream.slug);
              
              return (
                <button
                  key={stream.slug}
                  onClick={() => handleStreamClick(stream.slug)}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{stream.name}</span>
                </button>
              );
            })}
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <button
            onClick={handleAddStreamClick}
            className="nav-item add-stream-btn"
          >
            <Plus size={20} />
            <span>Add Stream</span>
          </button>
          
          <button
            onClick={handleArchivedClick}
            className={`nav-item ${isArchivedActive() ? 'active' : ''}`}
          >
            <Archive size={20} />
            <span>Archived Items</span>
          </button>
          
          <button
            onClick={handleSettingsClick}
            className={`nav-item ${isSettingsActive() ? 'active' : ''}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;