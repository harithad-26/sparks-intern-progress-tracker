import React, { useState, useEffect } from 'react';
import { Save, ChevronDown } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './PerformanceEvaluation.css';

const PerformanceEvaluation = ({ streamName, batchId }) => {
  const { 
    getAllInterns, 
    getInternsByBatchId,
    getPerformanceEvaluations, 
    savePerformanceEvaluation, 
    getGlobalWeeks
  } = useInterns();
  
  const [selectedIntern, setSelectedIntern] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [ratings, setRatings] = useState({
    interest: 0,
    enthusiasm: 0,
    technicalSkills: 0,
    deadlineAdherence: 0,
    teamCollaboration: 0
  });
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [availableInterns, setAvailableInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);

  // Get all interns and weeks
  const allInterns = getAllInterns();
  const globalWeeks = getGlobalWeeks();

  // Load interns based on batch ID
  useEffect(() => {
    const loadInterns = async () => {
      setLoadingInterns(true);
      try {
        let filtered = [];
        
        if (batchId) {
          // Use batch ID to get interns directly from database
          filtered = await getInternsByBatchId(batchId);
        } else {
          // Fallback to all interns filtered by stream
          filtered = allInterns.filter(intern => intern.status === 'active');
          
          // Filter by stream if provided
          if (streamName && streamName !== 'Mixed Streams') {
            filtered = filtered.filter(intern => intern.domain === streamName);
          }
        }
        
        setAvailableInterns(filtered);
      } catch (error) {
        console.error('Error loading interns:', error);
        setAvailableInterns([]);
      } finally {
        setLoadingInterns(false);
      }
    };

    loadInterns();
  }, [batchId, streamName, getInternsByBatchId, allInterns]);

  // Load existing evaluation when intern and week are selected
  useEffect(() => {
    if (selectedIntern && selectedWeek) {
      const evaluations = getPerformanceEvaluations(streamName, batchId);
      const existing = evaluations.find(
        evaluation => evaluation.internId === parseInt(selectedIntern) && evaluation.week === selectedWeek
      );
      
      if (existing) {
        setRatings(existing.ratings);
        setComments(existing.comments);
      } else {
        // Reset form for new evaluation
        setRatings({
          interest: 0,
          enthusiasm: 0,
          technicalSkills: 0,
          deadlineAdherence: 0,
          teamCollaboration: 0
        });
        setComments('');
      }
    }
  }, [selectedIntern, selectedWeek, streamName, batchId, getPerformanceEvaluations]);

  const handleRatingChange = (category, rating) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
    
    // Clear validation errors when user makes changes
    if (validationErrors[category]) {
      setValidationErrors(prev => ({
        ...prev,
        [category]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Check if comments are required (any rating is 2 or below)
    const hasLowRatings = Object.values(ratings).some(rating => rating > 0 && rating <= 2);
    if (hasLowRatings && !comments.trim()) {
      errors.comments = 'Comments are required when any parameter score is 2 or below';
    }
    
    return errors;
  };

  const handleSaveEvaluation = async () => {
    if (!selectedIntern || !selectedWeek) {
      alert('Please select both an intern and evaluation period.');
      return;
    }

    // Validate that intern ID is not null
    if (!selectedIntern || selectedIntern === '') {
      alert('Please select a valid intern before submitting the evaluation.');
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setValidationErrors({});

    try {
      const evaluationData = {
        internId: selectedIntern, // Don't convert to integer, keep as UUID string
        week: selectedWeek,
        ratings,
        comments: comments.trim(),
        evaluatedAt: new Date().toISOString(),
        evaluatedBy: 'Admin'
      };

      await savePerformanceEvaluation(streamName, batchId, evaluationData);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error saving evaluation:', error);
      alert('Failed to save evaluation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRatingControl = (category, currentRating, label) => {
    const ratingLabels = {
      1: 'Poor',
      2: 'Needs Improvement', 
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    };

    return (
      <div className="rating-row">
        <label className="parameter-label">{label}</label>
        <div className="rating-controls">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              type="button"
              className={`rating-btn ${currentRating === rating ? 'active' : ''} ${rating <= 2 ? 'low-score' : ''}`}
              onClick={() => handleRatingChange(category, rating)}
              title={ratingLabels[rating]}
            >
              {rating}
            </button>
          ))}
          <span className="rating-label">
            {currentRating > 0 ? ratingLabels[currentRating] : 'Not Rated'}
          </span>
        </div>
      </div>
    );
  };

  const calculateOverallScore = () => {
    const ratedValues = Object.values(ratings).filter(rating => rating > 0);
    if (ratedValues.length === 0) return 0;
    return (ratedValues.reduce((sum, rating) => sum + rating, 0) / ratedValues.length).toFixed(1);
  };

  const getSelectedInternName = () => {
    if (!selectedIntern) return '';
    const intern = allInterns.find(intern => intern.id === parseInt(selectedIntern));
    return intern ? intern.name : '';
  };

  const isExistingEvaluation = () => {
    if (!selectedIntern || !selectedWeek) return false;
    const evaluations = getPerformanceEvaluations(streamName, batchId);
    return evaluations.some(evaluation => 
      evaluation.internId === parseInt(selectedIntern) && evaluation.week === selectedWeek
    );
  };

  const hasLowScores = Object.values(ratings).some(rating => rating > 0 && rating <= 2);

  return (
    <div className="performance-evaluation-container">
      <div className="performance-card">
        <div className="card-header">
          <h2>Performance Evaluation</h2>
          {showSuccess && (
            <div className="success-notification">
              Evaluation saved successfully!
            </div>
          )}
        </div>

        <div className="card-content">
          {/* Top Controls */}
          <div className="top-controls">
            <div className="control-group">
              <label className="control-label">Select Intern</label>
              <div className="select-wrapper">
                <select
                  value={selectedIntern}
                  onChange={(e) => setSelectedIntern(e.target.value)}
                  className="control-select"
                  disabled={loadingInterns || availableInterns.length === 0}
                >
                  {loadingInterns ? (
                    <option value="">Loading interns...</option>
                  ) : availableInterns.length === 0 ? (
                    <option value="">
                      {streamName && streamName !== 'Mixed Streams' 
                        ? `No active interns available for ${streamName}` 
                        : 'No active interns available'}
                    </option>
                  ) : (
                    <>
                      <option value="">Choose an intern...</option>
                      {availableInterns.map(intern => (
                        <option key={intern.id} value={intern.id}>
                          {intern.name} - {intern.domain} {intern.batch && `(${intern.batch})`}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                <ChevronDown className="select-chevron" size={16} />
              </div>
              {!loadingInterns && availableInterns.length === 0 && (
                <div className="validation-notice">
                  {streamName && streamName !== 'Mixed Streams' 
                    ? `No active interns found for the ${streamName} stream.` 
                    : 'No active interns found.'}
                </div>
              )}
            </div>

            <div className="control-group">
              <label className="control-label">Select Evaluation Period</label>
              <div className="select-wrapper">
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="control-select"
                >
                  <option value="">Choose evaluation period...</option>
                  {globalWeeks.map(week => (
                    <option key={week.id} value={week.name}>
                      {week.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="select-chevron" size={16} />
              </div>
            </div>
          </div>

          {/* Performance Parameters */}
          {selectedIntern && selectedWeek && (
            <>
              <div className="parameters-section">
                <h3>Performance Score Parameters</h3>
                <div className="parameters-list">
                  {renderRatingControl('interest', ratings.interest, 'Interest')}
                  {renderRatingControl('enthusiasm', ratings.enthusiasm, 'Enthusiasm')}
                  {renderRatingControl('technicalSkills', ratings.technicalSkills, 'Technical Skills')}
                  {renderRatingControl('deadlineAdherence', ratings.deadlineAdherence, 'Deadline Adherence')}
                  {renderRatingControl('teamCollaboration', ratings.teamCollaboration, 'Team Collaboration')}
                </div>

                {/* Overall Score */}
                <div className="overall-score">
                  <span className="overall-label">Overall Performance Score:</span>
                  <span className={`overall-value ${hasLowScores ? 'low-score' : ''}`}>
                    {calculateOverallScore()}/5.0
                  </span>
                </div>
              </div>

              {/* Admin Comments */}
              <div className="comments-section">
                <label className="comments-label">
                  Admin Comments
                  {hasLowScores && <span className="required-indicator">*</span>}
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => {
                    setComments(e.target.value);
                    if (validationErrors.comments) {
                      setValidationErrors(prev => ({ ...prev, comments: '' }));
                    }
                  }}
                  className={`comments-textarea ${validationErrors.comments ? 'error' : ''}`}
                  placeholder="Provide detailed qualitative feedback about the intern's performance..."
                  rows="4"
                />
                {validationErrors.comments && (
                  <span className="error-message">{validationErrors.comments}</span>
                )}
                {hasLowScores && (
                  <div className="validation-notice">
                    Comments are required when any parameter score is 2 or below
                  </div>
                )}
              </div>

              {/* Existing Evaluation Notice */}
              {isExistingEvaluation() && (
                <div className="existing-notice">
                  Editing existing evaluation for <strong>{getSelectedInternName()}</strong> - <strong>{selectedWeek}</strong>
                </div>
              )}

              {/* Save Action */}
              <div className="save-section">
                <button
                  onClick={handleSaveEvaluation}
                  disabled={isLoading}
                  className="save-evaluation-btn"
                >
                  <Save size={16} />
                  {isLoading ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </>
          )}

          {/* Empty State */}
          {(!selectedIntern || !selectedWeek) && (
            <div className="empty-state">
              <p>Select an intern and evaluation period to begin performance assessment</p>
            </div>
          )}
        </div>
      </div>

      {/* Existing Evaluations Display */}
      <ExistingEvaluations 
        streamName={streamName} 
        batchId={batchId} 
        allInterns={availableInterns}
        globalWeeks={globalWeeks}
        getPerformanceEvaluations={getPerformanceEvaluations}
      />
    </div>
  );
};

// Component to display existing evaluations in Excel-like table format
const ExistingEvaluations = ({ streamName, batchId, allInterns, globalWeeks, getPerformanceEvaluations }) => {
  const evaluations = getPerformanceEvaluations(streamName, batchId);

  if (evaluations.length === 0) {
    return (
      <div className="existing-evaluations-card">
        <div className="card-header">
          <h3>Saved Evaluations</h3>
        </div>
        <div className="card-content">
          <div className="empty-state">
            <p>No evaluations have been saved yet.</p>
          </div>
        </div>
      </div>
    );
  }

  const getInternName = (internId) => {
    const intern = allInterns.find(intern => intern.id === internId);
    return intern ? intern.name : 'Unknown Intern';
  };

  const calculateOverallScore = (evaluation) => {
    // Handle both old format (ratings object) and new format (individual fields)
    let ratings;
    if (evaluation.ratings) {
      // Old format: ratings is an object
      ratings = Object.values(evaluation.ratings).filter(rating => rating > 0);
    } else {
      // New format: individual rating fields from database
      ratings = [
        evaluation.interest,
        evaluation.enthusiasm, 
        evaluation.technical_skills,
        evaluation.deadline_adherence,
        evaluation.team_collaboration
      ].filter(rating => rating && rating > 0);
    }
    
    if (ratings.length === 0) return 0;
    return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
  };

  const getScoreClass = (score) => {
    if (score >= 4) return 'score-excellent';
    if (score >= 3) return 'score-good';
    if (score >= 2) return 'score-average';
    return 'score-poor';
  };

  return (
    <div className="existing-evaluations-card">
      <div className="card-header">
        <h3>Saved Evaluations ({evaluations.length})</h3>
      </div>
      <div className="card-content">
        <div className="excel-table-container">
          <table className="excel-table">
            <thead>
              <tr>
                <th className="excel-header">Intern Name</th>
                <th className="excel-header">Week</th>
                <th className="excel-header">Interest</th>
                <th className="excel-header">Enthusiasm</th>
                <th className="excel-header">Technical Skills</th>
                <th className="excel-header">Deadline Adherence</th>
                <th className="excel-header">Team Collaboration</th>
                <th className="excel-header">Overall Score</th>
                <th className="excel-header">Comments</th>
                <th className="excel-header">Evaluated Date</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((evaluation, index) => {
                const overallScore = calculateOverallScore(evaluation);
                return (
                  <tr key={index} className="excel-row">
                    <td className="excel-cell intern-name-cell">
                      {getInternName(evaluation.intern_id)}
                    </td>
                    <td className="excel-cell week-cell">
                      <span className="week-badge">{evaluation.week}</span>
                    </td>
                    <td className="excel-cell score-cell">
                      {evaluation.interest || 0}/5
                    </td>
                    <td className="excel-cell score-cell">
                      {evaluation.enthusiasm || 0}/5
                    </td>
                    <td className="excel-cell score-cell">
                      {evaluation.technical_skills || 0}/5
                    </td>
                    <td className="excel-cell score-cell">
                      {evaluation.deadline_adherence || 0}/5
                    </td>
                    <td className="excel-cell score-cell">
                      {evaluation.team_collaboration || 0}/5
                    </td>
                    <td className="excel-cell overall-cell">
                      <span className={`overall-score ${getScoreClass(parseFloat(overallScore))}`}>
                        {overallScore}/5.0
                      </span>
                    </td>
                    <td className="excel-cell comments-cell">
                      <div className="comments-preview">
                        {evaluation.comments || 'No comments'}
                      </div>
                    </td>
                    <td className="excel-cell date-cell">
                      {evaluation.created_at ? new Date(evaluation.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerformanceEvaluation;