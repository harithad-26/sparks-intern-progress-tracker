import React from 'react';
import { Menu } from 'lucide-react';
import './Hamburger.css';

const Hamburger = ({ onClick, isOpen }) => {
  return (
    <button 
      className={`hamburger-btn ${isOpen ? 'active' : ''}`}
      onClick={onClick}
      aria-label="Toggle menu"
    >
      <Menu size={24} />
    </button>
  );
};

export default Hamburger;