import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './WeekManagement.css';

const WeekManagement = () => {
  const { getGlobalWeeks, addGlobalWeek, deleteGlobalWeek } = useInterns();
  const [showAddForm, setShowAddForm] = useState(false);
  const [weekForm, setWeekForm] = useState({
    name: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const weeks = getGlobalWeeks();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setWeekForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!weekForm.name.trim()) {
      newErrors.name = 'Week name is required';
    } else {
      // Check for duplicate week names
      const existingWeek = weeks.find(week => 
        week.name.toLowerCase() === weekForm.name.trim().toLowerCase()
      );
      
      if (existingWeek) {
        newErrors.name = 'Week name already exists';
      }
      
      // Validate sequential naming (Week 1, Week 2, etc.)
      const weekNamePattern = /^Week \d+$/i;
      if (!weekNamePattern.test(weekForm.name.trim())) {
        newErrors.name = 'Week name must follow format: Week 1, Week 2, etc.';
      }
    }
    
    return newErrors;
  };

  const handleAddWeek = async (e) => {
    e.preventDefault();
    
    console.log('=== ADD WEEK DEBUG ===');
    console.log('Form data:', weekForm);
    console.log('addGlobalWeek function:', addGlobalWeek);
    
    const validationErrors = validateForm();
    console.log('Validation errors:', validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      console.log('Calling addGlobalWeek...');
      const result = await addGlobalWeek({
        name: weekForm.name.trim(),
        description: weekForm.description.trim()
      });
      
      console.log('addGlobalWeek result:', result);
      
      // Reset form
      setWeekForm({ name: '', description: '' });
      setErrors({});
      setShowAddForm(false);
      
      alert('Week added successfully!');
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      alert('Error adding week. Please try again.');
    }
  };

  const handleDeleteWeek = async (weekId) => {
    if (window.confirm('Are you sure you want to delete this week? This will affect all performance evaluations.')) {
      try {
        await deleteGlobalWeek(weekId);
        alert('Week deleted successfully!');
      } catch (error) {
        console.error('Error deleting week:', error);
        alert('Error deleting week. Please try again.');
      }
    }
  };

  const getNextWeekNumber = () => {
    if (weeks.length === 0) return 1;
    
    const weekNumbers = weeks.map(week => {
      const match = week.name.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });
    
    return Math.max(...weekNumbers) + 1;
  };

  return (
    <div className="week-management">
      <div className="week-management-header">
        <div className="header-content">
          <Calendar size={24} />
          <div>
            <h3>Week Management</h3>
            <p>Manage evaluation periods for performance assessments</p>
          </div>
        </div>
        <button 
          className="add-week-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          Add Week
        </button>
      </div>

      {showAddForm && (
        <div className="add-week-form">
          <form onSubmit={handleAddWeek}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Week Name *</label>
                <input
                  type="text"
                  name="name"
                  value={weekForm.name}
                  onChange={handleFormChange}
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder={`Week ${getNextWeekNumber()}`}
                  required
                />
                {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={weekForm.description}
                  onChange={handleFormChange}
                  className="form-input"
                  placeholder="Optional description"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Week
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="weeks-list">
        {weeks.map((week) => (
          <div key={week.id} className="week-item">
            <div className="week-content">
              <h4 className="week-name">{week.name}</h4>
              {week.description && (
                <p className="week-description">{week.description}</p>
              )}
            </div>
            <button
              className="delete-week-btn"
              onClick={() => handleDeleteWeek(week.id)}
              title="Delete week"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {weeks.length === 0 && (
        <div className="empty-weeks">
          <Calendar size={48} color="#9ca3af" />
          <h4>No Weeks Configured</h4>
          <p>Add evaluation periods to enable performance assessments</p>
        </div>
      )}
    </div>
  );
};

export default WeekManagement;