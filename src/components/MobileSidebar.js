import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Globe, 
  Smartphone, 
  Brain, 
  Link as LinkIcon, 
  Zap, 
  BarChart3,
  Plus
} from 'lucide-react';
import './MobileSidebar.css';

const MobileSidebar = ({ isOpen, onClose, onAddStream, customStreams = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultStreams = [
    { name: 'Web Development', slug: 'web-development', icon: Globe },
    { name: 'App Development', slug: 'app-development', icon: Smartphone },
    { name: 'AI/ML', slug: 'ai-ml', icon: Brain },
    { name: 'Blockchain', slug: 'blockchain', icon: LinkIcon },
    { name: 'Automation', slug: 'automation', icon: Zap },
    { name: 'Analytics', slug: 'analytics', icon: BarChart3 }
  ];

  const allStreams = [...defaultStreams, ...customStreams.map(stream => ({
    name: stream.name,
    slug: stream.slug,
    icon: Globe // Default icon for custom streams
  }))];

  const handleStreamClick = (streamSlug) => {
    navigate(`/stream/${streamSlug}`);
    onClose();
  };

  const handleAddStream = () => {
    onAddStream();
    onClose();
  };

  const isStreamActive = (streamSlug) => {
    return location.pathname === `/stream/${streamSlug}`;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      {/* Sidebar */}
      <div className={`mobile-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <h3>Streams</h3>
        </div>
        
        <nav className="mobile-sidebar-nav">
          {allStreams.map((stream) => {
            const Icon = stream.icon;
            const isActive = isStreamActive(stream.slug);
            
            return (
              <button
                key={stream.slug}
                onClick={() => handleStreamClick(stream.slug)}
                className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{stream.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="mobile-sidebar-footer">
          <button 
            className="add-stream-btn"
            onClick={handleAddStream}
          >
            <Plus size={20} />
            Add Stream
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;