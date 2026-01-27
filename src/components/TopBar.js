import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, LogOut } from 'lucide-react';
import Hamburger from './Hamburger';
import './TopBar.css';

const TopBar = ({ onAddIntern, onLogout, onToggleSidebar, isSidebarOpen, onSearch, searchTerm, user }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (onSearch) {
        onSearch('');
      }
    }
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        <Hamburger 
          onClick={onToggleSidebar}
          isOpen={isSidebarOpen}
        />
        <div className="search-section">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search interns, streams..." 
              className={`search-input ${searchTerm ? 'has-results' : ''}`}
              value={searchTerm || ''}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>
      </div>
      
      <div className="topbar-actions">
        <button className="btn btn-primary add-intern-btn" onClick={onAddIntern}>
          <Plus size={20} />
          Add Intern
        </button>
        
        <div className="admin-profile-container" ref={profileRef}>
          <div 
            className="profile-avatar"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <User size={20} />
          </div>
          
          {showProfileMenu && (
            <div className="profile-menu">
              <button className="profile-menu-item" onClick={() => {
                setShowProfileMenu(false);
                onLogout();
              }}>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;