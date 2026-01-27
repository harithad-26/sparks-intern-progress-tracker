import React, { useState, useEffect, useCallback } from 'react';
import { useInterns } from '../context/InternContext';
import './WeeklyTasks.css';

const WeeklyTasks = ({ batchId, streamName }) => {
  const { 
    getAllInterns, 
    getGlobalWeeks
  } = useInterns();

  const [formData, setFormData] = useState({
    internId: '',
    weekNumber: '',
    taskTitle: '',
    taskDescription: ''
  });

  const [tasks, setTasks] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Section B state
  const [sectionBData, setSectionBData] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  // Get available data
  const globalWeeks = getGlobalWeeks();
  const allInterns = getAllInterns();
  
  // Filter interns by stream and batch (consistent with PerformanceEvaluation)
  const getFilteredInterns = () => {
    let filtered = allInterns.filter(intern => intern.status === 'active'); // Only active interns
    
    // Filter by stream if streamName is provided
    if (streamName && streamName !== 'Mixed Streams') {
      filtered = filtered.filter(intern => intern.domain === streamName);
    }
    
    // Filter by batch if batchId is provided
    if (batchId) {
      filtered = filtered.filter(intern => intern.batch === `Batch ${batchId}`);
    }
    
    return filtered;
  };

  const availableInterns = getFilteredInterns();

  // Load existing tasks from localStorage on component mount
  useEffect(() => {
    const storageKey = `weeklyTasks_${streamName || 'default'}_${batchId || 'all'}`;
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [batchId, streamName]);

  // Save tasks to localStorage whenever tasks change
  const saveTasks = (updatedTasks) => {
    const storageKey = `weeklyTasks_${streamName || 'default'}_${batchId || 'all'}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.weekNumber || !formData.taskTitle.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const newTask = {
        id: Date.now(),
        internId: null, // No specific intern assigned
        internName: 'General Task', // General task for all interns
        weekNumber: formData.weekNumber,
        taskTitle: formData.taskTitle.trim(),
        taskDescription: formData.taskDescription.trim(),
        status: 'Not Tried',
        createdAt: new Date().toISOString(),
        batchId: batchId,
        streamName: streamName
      };

      const updatedTasks = [...tasks, newTask];
      saveTasks(updatedTasks);

      // Reset form
      setFormData({
        internId: '',
        weekNumber: '',
        taskTitle: '',
        taskDescription: ''
      });

      console.log('Task saved successfully:', newTask);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Error saving task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Section B Functions
  const loadSectionBData = useCallback(() => {
    const storageKey = `sectionB_${streamName || 'default'}_${batchId || 'all'}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      setSectionBData(JSON.parse(savedData));
    }
  }, [streamName, batchId]);

  const saveSectionBData = (data) => {
    const storageKey = `sectionB_${streamName || 'default'}_${batchId || 'all'}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    setSectionBData(data);
  };

  const addTaskAssignment = (taskData) => {
    const newAssignment = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date().toISOString()
    };
    const updatedData = [...sectionBData, newAssignment];
    saveSectionBData(updatedData);
  };

  const updateTaskAssignment = (id, updatedData) => {
    const updatedAssignments = sectionBData.map(assignment =>
      assignment.id === id ? { ...assignment, ...updatedData } : assignment
    );
    saveSectionBData(updatedAssignments);
  };

  const deleteTaskAssignment = (id) => {
    const updatedAssignments = sectionBData.filter(assignment => assignment.id !== id);
    saveSectionBData(updatedAssignments);
  };

  // Load Section B data on mount
  useEffect(() => {
    loadSectionBData();
  }, [batchId, streamName, loadSectionBData]);

  return (
    <div className="weekly-tasks">
      {/* Section A - Weekly Task Definition */}
      <div className="weekly-tasks-section">
        <div className="task-definition-card">
          <div className="card-header">
            <h3>Weekly Tasks – Section A</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="weekNumber">Week Number</label>
                  <select
                    id="weekNumber"
                    name="weekNumber"
                    value={formData.weekNumber}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select week...</option>
                    {globalWeeks.map(week => (
                      <option key={week.id} value={week.name}>
                        {week.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="taskTitle">Task Title</label>
                  <input
                    type="text"
                    id="taskTitle"
                    name="taskTitle"
                    value={formData.taskTitle}
                    onChange={handleInputChange}
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="taskDescription">Task Description</label>
                  <textarea
                    id="taskDescription"
                    name="taskDescription"
                    value={formData.taskDescription}
                    onChange={handleInputChange}
                    placeholder="Enter detailed task description..."
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Section B - Task Assignment & Evaluation */}
      <SectionB 
        tasks={tasks}
        availableInterns={availableInterns}
        globalWeeks={globalWeeks}
        sectionBData={sectionBData}
        onAddAssignment={addTaskAssignment}
        onUpdateAssignment={updateTaskAssignment}
        onDeleteAssignment={deleteTaskAssignment}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />


      {/* Section C - Weekly Task Summary (Read-only mirror of Section B) */}
      <WeeklyTaskSummary sectionBData={sectionBData} />
    </div>
  );
};

// Section B Component
const SectionB = ({ 
  tasks, 
  availableInterns, 
  globalWeeks, 
  sectionBData, 
  onAddAssignment, 
  onUpdateAssignment, 
  onDeleteAssignment,
  editingTask,
  setEditingTask 
}) => {
  const [formData, setFormData] = useState({
    internId: '',
    taskId: '',
    weekNumber: '',
    status: 'Not Tried',
    projectLink: '',
    remarks: '',
    grades: {
      onTimeSubmission: 0,
      projectPerfection: 0,
      teamWork: 0,
      uniqueness: 0
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('grade_')) {
      const gradeType = name.replace('grade_', '');
      setFormData(prev => ({
        ...prev,
        grades: {
          ...prev.grades,
          [gradeType]: parseInt(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.internId || !formData.taskId) {
      alert('Please select both intern and task');
      return;
    }

    const selectedIntern = availableInterns.find(intern => intern.id === parseInt(formData.internId));
    const selectedTask = tasks.find(task => task.id === parseInt(formData.taskId));
    
    const assignmentData = {
      internId: parseInt(formData.internId),
      internName: selectedIntern?.name || 'Unknown',
      taskId: parseInt(formData.taskId),
      taskTitle: selectedTask?.taskTitle || 'Unknown Task',
      weekNumber: selectedTask?.weekNumber || formData.weekNumber,
      status: formData.status,
      projectLink: formData.projectLink.trim(),
      remarks: formData.remarks.trim(),
      grades: formData.grades,
      totalGrade: Object.values(formData.grades).reduce((sum, grade) => sum + grade, 0) / 4
    };

    if (editingTask) {
      onUpdateAssignment(editingTask.id, assignmentData);
      setEditingTask(null);
    } else {
      onAddAssignment(assignmentData);
    }

    // Reset form
    setFormData({
      internId: '',
      taskId: '',
      weekNumber: '',
      status: 'Not Tried',
      projectLink: '',
      remarks: '',
      grades: {
        onTimeSubmission: 0,
        projectPerfection: 0,
        teamWork: 0,
        uniqueness: 0
      }
    });
  };

  const handleEdit = (assignment) => {
    setFormData({
      internId: assignment.internId.toString(),
      taskId: assignment.taskId.toString(),
      weekNumber: assignment.weekNumber,
      status: assignment.status || 'Not Tried',
      projectLink: assignment.projectLink || '',
      remarks: assignment.remarks || '',
      grades: assignment.grades || {
        onTimeSubmission: 0,
        projectPerfection: 0,
        teamWork: 0,
        uniqueness: 0
      }
    });
    setEditingTask(assignment);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      onDeleteAssignment(id);
    }
  };

  const getGradeColor = (grade) => {
    if (grade >= 8) return 'grade-excellent';
    if (grade >= 6) return 'grade-good';
    if (grade >= 4) return 'grade-average';
    return 'grade-poor';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'Partially Completed':
        return 'status-partial';
      case 'Not Completed':
        return 'status-not-completed';
      case 'Not Tried':
        return 'status-not-tried';
      default:
        return 'status-not-tried';
    }
  };

  return (
    <div className="weekly-tasks-section">
      <div className="task-tracking-card">
        <div className="card-header">
          <h3>Weekly Tasks – Section B</h3>
        </div>
        <div className="card-content">
          {/* Assignment Form */}
          <form onSubmit={handleSubmit} className="assignment-form">
            <div className="assignment-form-grid">
              <div className="form-group">
                <label htmlFor="internId">Select Intern</label>
                <select
                  id="internId"
                  name="internId"
                  value={formData.internId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose an intern...</option>
                  {availableInterns.map(intern => (
                    <option key={intern.id} value={intern.id}>
                      {intern.name} - {intern.batch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="taskId">Select Task</label>
                <select
                  id="taskId"
                  name="taskId"
                  value={formData.taskId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose a task...</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.weekNumber} - {task.taskTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Task Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Not Tried">Not Tried</option>
                  <option value="Not Completed">Not Completed</option>
                  <option value="Partially Completed">Partially Completed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="projectLink">Paste the link</label>
                <textarea
                  id="projectLink"
                  name="projectLink"
                  value={formData.projectLink}
                  onChange={handleInputChange}
                  placeholder="Paste GitHub link, Figma link, or any project-related links here..."
                  rows="2"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="remarks">Remarks</label>
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  placeholder="Enter remarks about the task performance..."
                  rows="3"
                />
              </div>

              {/* Grading System */}
              <div className="grading-section full-width">
                <h4>Grading Criteria (0-10 scale)</h4>
                <div className="grading-grid">
                  <div className="grade-item">
                    <label htmlFor="grade_onTimeSubmission">On Time Submission</label>
                    <input
                      type="number"
                      id="grade_onTimeSubmission"
                      name="grade_onTimeSubmission"
                      min="0"
                      max="10"
                      value={formData.grades.onTimeSubmission}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grade-item">
                    <label htmlFor="grade_projectPerfection">Project Perfection</label>
                    <input
                      type="number"
                      id="grade_projectPerfection"
                      name="grade_projectPerfection"
                      min="0"
                      max="10"
                      value={formData.grades.projectPerfection}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grade-item">
                    <label htmlFor="grade_teamWork">Team Work</label>
                    <input
                      type="number"
                      id="grade_teamWork"
                      name="grade_teamWork"
                      min="0"
                      max="10"
                      value={formData.grades.teamWork}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grade-item">
                    <label htmlFor="grade_uniqueness">Uniqueness</label>
                    <input
                      type="number"
                      id="grade_uniqueness"
                      name="grade_uniqueness"
                      min="0"
                      max="10"
                      value={formData.grades.uniqueness}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingTask ? 'Update Assignment' : 'Save'}
              </button>
              {editingTask && (
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingTask(null);
                    setFormData({
                      internId: '',
                      taskId: '',
                      weekNumber: '',
                      status: 'Not Tried',
                      projectLink: '',
                      remarks: '',
                      grades: {
                        onTimeSubmission: 0,
                        projectPerfection: 0,
                        teamWork: 0,
                        uniqueness: 0
                      }
                    });
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Assignments Table */}
          {sectionBData.length > 0 ? (
            <div className="assignments-table-container">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Intern Name</th>
                    <th>Task & Week</th>
                    <th>Status</th>
                    <th>Project Link</th>
                    <th>Grades</th>
                    <th>Total</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionBData.map(assignment => (
                    <tr key={assignment.id} className="assignment-row">
                      <td className="intern-cell">
                        <div className="intern-info">
                          <span className="intern-name">{assignment.internName}</span>
                        </div>
                      </td>
                      <td className="task-cell">
                        <div className="task-info">
                          <span className="week-number">{assignment.weekNumber}</span>
                          <span className="task-title">{assignment.taskTitle}</span>
                        </div>
                      </td>
                      <td className="status-cell">
                        <select
                          value={assignment.status || 'Not Tried'}
                          onChange={(e) => onUpdateAssignment(assignment.id, { ...assignment, status: e.target.value })}
                          className={`status-dropdown ${getStatusClass(assignment.status || 'Not Tried')}`}
                        >
                          <option value="Not Tried">Not Tried</option>
                          <option value="Not Completed">Not Completed</option>
                          <option value="Partially Completed">Partially Completed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td className="link-cell">
                        <div className="project-link">
                          {assignment.projectLink ? (
                            <a 
                              href={assignment.projectLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="link-text"
                              title={assignment.projectLink}
                            >
                              🔗 View Link
                            </a>
                          ) : (
                            <span className="no-link">No link provided</span>
                          )}
                        </div>
                      </td>
                      <td className="grades-cell">
                        <div className="grades-display">
                          <span className="grade-item">OT: {assignment.grades?.onTimeSubmission || 0}</span>
                          <span className="grade-item">PP: {assignment.grades?.projectPerfection || 0}</span>
                          <span className="grade-item">TW: {assignment.grades?.teamWork || 0}</span>
                          <span className="grade-item">UN: {assignment.grades?.uniqueness || 0}</span>
                        </div>
                      </td>
                      <td className="total-cell">
                        <span className={`total-grade ${getGradeColor(assignment.totalGrade || 0)}`}>
                          {(assignment.totalGrade || 0).toFixed(1)}
                        </span>
                      </td>
                      <td className="remarks-cell">
                        <div className="remarks-text">
                          {assignment.remarks || 'No remarks'}
                        </div>
                      </td>
                      <td className="actions-cell">
                        <div className="action-buttons">
                          <button 
                            className="btn-edit"
                            onClick={() => handleEdit(assignment)}
                            title="Edit Assignment"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDelete(assignment.id)}
                            title="Delete Assignment"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                  <path d="M3 12c1 0 3-1-3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                  <path d="M3 12h6m6 0h6"/>
                </svg>
              </div>
              <h4>No Task Assignments Yet</h4>
              <p>Assign tasks to interns using the form above to start tracking their performance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Weekly Task Summary Component - Simple read-only table mirroring Section B data
const WeeklyTaskSummary = ({ sectionBData }) => {
  if (sectionBData.length === 0) {
    return (
      <div className="weekly-tasks-section">
        <div className="task-summary-card">
          <div className="card-header">
            <h3>Weekly Task Summary</h3>
          </div>
          <div className="card-content">
            <div className="empty-state">
              <p>No task evaluations available. The summary will appear once tasks are assigned and evaluated in Section B.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-tasks-section">
      <div className="task-summary-card">
        <div className="card-header">
          <h3>Weekly Task Summary</h3>
        </div>
        <div className="card-content">
          <div className="summary-simple-table-container">
            <table className="summary-simple-table">
              <thead>
                <tr>
                  <th>Intern Name</th>
                  <th>Week Number</th>
                  <th>Task Title</th>
                  <th>Status</th>
                  <th>Total Score</th>
                </tr>
              </thead>
              <tbody>
                {sectionBData.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.internName}</td>
                    <td>{assignment.weekNumber}</td>
                    <td>{assignment.taskTitle}</td>
                    <td>{assignment.status || 'Not Completed'}</td>
                    <td>{(assignment.totalGrade || 0).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTasks;