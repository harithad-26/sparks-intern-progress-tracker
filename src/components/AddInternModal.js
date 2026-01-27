import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './AddInternModal.css';

const AddInternModal = ({ onClose, currentDomain }) => {
  const { addIntern, streamMapping, getAllStreams, getAllBatches } = useInterns();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    domain: '', // This stores the stream name (keeping 'domain' for backward compatibility)
    batch: '',
    academicYear: '',
    onboardingStatus: 'active',
    additionalDetails: ''
  });

  // Auto-select stream if we're in a specific stream page
  useEffect(() => {
    if (currentDomain && streamMapping[currentDomain]) {
      setFormData(prev => ({
        ...prev,
        domain: streamMapping[currentDomain]
      }));
    } else {
      // Ensure domain is empty when not on a specific stream page
      setFormData(prev => ({
        ...prev,
        domain: ''
      }));
    }
  }, [currentDomain, streamMapping]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create intern object with proper field mapping
      const internData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        college: formData.college,
        domain: formData.domain,
        batch: formData.batch,
        academicYear: formData.academicYear,
        onboardingStatus: formData.onboardingStatus,
        additionalDetails: formData.additionalDetails
      };

      // Add intern to the context - use the selected domain from the form
      const newIntern = await addIntern(internData);
      
      console.log('Added intern:', newIntern);
      alert(`Intern ${internData.name} has been added successfully!`);
      onClose();
    } catch (error) {
      console.error('Error adding intern:', error);
      alert('Error adding intern. Please try again.');
    }
  };

  // Get all available streams (default + custom)
  const streams = getAllStreams();

  // Get all active batches
  const batches = getAllBatches();

  const academicYears = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'Graduate'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal add-intern-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Intern</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="intern-form">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">College *</label>
            <input
              type="text"
              name="college"
              value={formData.college}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Internship Stream *</label>
            <select
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              className="form-select"
              required
              disabled={currentDomain && streamMapping[currentDomain]}
            >
              <option value="">Select Stream</option>
              {streams.map(stream => (
                <option key={stream} value={stream}>{stream}</option>
              ))}
            </select>
            {currentDomain && streamMapping[currentDomain] && formData.domain === streamMapping[currentDomain] && (
              <small className="stream-note">
                Auto-assigned to {streamMapping[currentDomain]} stream
              </small>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Batch *</label>
            <select
              name="batch"
              value={formData.batch}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Batch</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.name}>{batch.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="">Select Year</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Onboarding Status</label>
            <select
              name="onboardingStatus"
              value={formData.onboardingStatus}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="dropped">Dropped</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Additional Details</label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Any additional notes or details..."
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Intern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInternModal;