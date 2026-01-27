import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './EditInternModal.css';

const EditInternModal = ({ intern, onClose, onSave }) => {
  const { getAllStreams, getAllBatches } = useInterns();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    domain: '',
    batch: '',
    academicYear: '',
    status: '',
    additionalDetails: ''
  });

  const [errors, setErrors] = useState({});
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  // Initialize form data when intern prop changes
  useEffect(() => {
    if (intern) {
      setFormData({
        name: intern.name || '',
        email: intern.email || '',
        phone: intern.phone || '',
        college: intern.college || '',
        domain: intern.domain || '',
        batch: intern.batch || '',
        academicYear: intern.academicYear || '3rd Year',
        status: intern.status || 'active',
        additionalDetails: intern.additionalDetails || ''
      });
    }
  }, [intern]);

  // Focus management and trap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      if (e.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;
        
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus first input when modal opens
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Get all available streams (default + custom)
  const domains = getAllStreams();

  // Get all active batches
  const batches = getAllBatches();

  const academicYears = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Graduate',
    'Post Graduate'
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'dropped', label: 'Dropped' },
    { value: 'completed', label: 'Completed' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.college.trim()) {
      newErrors.college = 'College/University is required';
    }
    
    if (!formData.domain) {
      newErrors.domain = 'Internship domain is required';
    }

    if (!formData.batch) {
      newErrors.batch = 'Batch is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const updatedIntern = {
        ...intern,
        ...formData
      };
      onSave(updatedIntern);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal edit-intern-modal" onClick={e => e.stopPropagation()} ref={modalRef}>
        <div className="modal-header">
          <h2>Edit Intern Details</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-intern-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter full name"
                required
                ref={firstInputRef}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter email address"
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="college">
                College / University *
              </label>
              <input
                type="text"
                id="college"
                name="college"
                value={formData.college}
                onChange={handleInputChange}
                className={`form-input ${errors.college ? 'error' : ''}`}
                placeholder="Enter college or university name"
                required
              />
              {errors.college && <span className="error-message">{errors.college}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="domain">
                Internship Domain *
              </label>
              <select
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                className={`form-select ${errors.domain ? 'error' : ''}`}
                required
              >
                <option value="">Select domain</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
              {errors.domain && <span className="error-message">{errors.domain}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="batch">
                Batch *
              </label>
              <select
                id="batch"
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                className={`form-select ${errors.batch ? 'error' : ''}`}
                required
              >
                <option value="">Select batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.name}>
                    {batch.name}
                  </option>
                ))}
              </select>
              {errors.batch && <span className="error-message">{errors.batch}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="academicYear">
                Academic Year
              </label>
              <select
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="form-select"
              >
                {academicYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Onboarding Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="additionalDetails">
                Additional Details
              </label>
              <textarea
                id="additionalDetails"
                name="additionalDetails"
                value={formData.additionalDetails}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter any additional details or notes..."
                rows="4"
              />
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInternModal;