import React, { createContext, useContext, useState } from 'react';

const InternContext = createContext();

export const useInterns = () => {
  const context = useContext(InternContext);
  if (!context) {
    throw new Error('useInterns must be used within an InternProvider');
  }
  return context;
};

export const InternProvider = ({ children }) => {
  const [interns, setInterns] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      college: 'MIT',
      status: 'active',
      joinedDate: '2024-12-10',
      phone: '+1 234 567 8900',
      academicYear: '3rd Year',
      domain: 'Web Development',
      batch: 'Batch 1',
      additionalDetails: 'Excellent performance in React and Node.js projects.'
    },
    {
      id: 2,
      name: 'Jennifer Lopez',
      email: 'jennifer.l@email.com',
      college: 'UCLA',
      status: 'completed',
      joinedDate: '2024-11-15',
      phone: '+1 234 567 8901',
      academicYear: '4th Year',
      domain: 'Web Development',
      batch: 'Batch 1',
      additionalDetails: 'Completed internship with excellent feedback.'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.c@email.com',
      college: 'Stanford University',
      status: 'active',
      joinedDate: '2024-12-09',
      phone: '+1 234 567 8902',
      academicYear: '4th Year',
      domain: 'AI/ML',
      batch: 'Batch 2',
      additionalDetails: 'Strong background in machine learning algorithms.'
    },
    {
      id: 4,
      name: 'Emma Davis',
      email: 'emma.d@email.com',
      college: 'UC Berkeley',
      status: 'active',
      joinedDate: '2024-12-08',
      phone: '+1 234 567 8903',
      academicYear: '2nd Year',
      domain: 'App Development',
      batch: 'Batch 3',
      additionalDetails: 'Proficient in Flutter and React Native development.'
    },
    {
      id: 5,
      name: 'Alex Rodriguez',
      email: 'alex.r@email.com',
      college: 'Harvard University',
      status: 'active',
      joinedDate: '2024-12-07',
      phone: '+1 234 567 8904',
      academicYear: '3rd Year',
      domain: 'Blockchain',
      batch: 'Batch 2',
      additionalDetails: 'Experience with Ethereum and smart contract development.'
    },
    {
      id: 6,
      name: 'Lisa Wang',
      email: 'lisa.w@email.com',
      college: 'Carnegie Mellon',
      status: 'dropped',
      joinedDate: '2024-12-06',
      phone: '+1 234 567 8905',
      academicYear: '4th Year',
      domain: 'Analytics',
      batch: 'Batch 4',
      additionalDetails: 'Strong analytical skills with Python and R.'
    },
    {
      id: 7,
      name: 'David Kim',
      email: 'david.k@email.com',
      college: 'Georgia Tech',
      status: 'active',
      joinedDate: '2024-12-05',
      phone: '+1 234 567 8906',
      academicYear: '3rd Year',
      domain: 'Automation',
      batch: 'Batch 3',
      additionalDetails: 'Expertise in RPA and process automation tools.'
    },
    {
      id: 8,
      name: 'Robert Brown',
      email: 'robert.b@email.com',
      college: 'Caltech',
      status: 'active',
      joinedDate: '2024-11-20',
      phone: '+1 234 567 8907',
      academicYear: '3rd Year',
      domain: 'AI/ML',
      batch: 'Batch 2',
      additionalDetails: 'Working on computer vision projects.'
    }
  ]);

  const [nextId, setNextId] = useState(9);
  const [customStreams, setCustomStreams] = useState([]);
  const [archivedDefaultStreams, setArchivedDefaultStreams] = useState([]);
  
  // Batch Management State
  const [batches, setBatches] = useState([
    { id: 1, name: 'Batch 1', description: '', startDate: '', endDate: '', status: 'active', createdAt: new Date().toISOString() },
    { id: 2, name: 'Batch 2', description: '', startDate: '', endDate: '', status: 'active', createdAt: new Date().toISOString() },
    { id: 3, name: 'Batch 3', description: '', startDate: '', endDate: '', status: 'active', createdAt: new Date().toISOString() },
    { id: 4, name: 'Batch 4', description: '', startDate: '', endDate: '', status: 'active', createdAt: new Date().toISOString() },
    { id: 5, name: 'Batch 5', description: '', startDate: '', endDate: '', status: 'active', createdAt: new Date().toISOString() },
    { id: 6, name: 'Batch 6', description: '', startDate: '', endDate: '', status: 'active', createdAt: new Date().toISOString() }
  ]);
  const [nextBatchId, setNextBatchId] = useState(7);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  
  // Global Week Management
  const [globalWeeks, setGlobalWeeks] = useState([
    { id: 1, name: 'Week 1', description: 'Introduction and Onboarding' },
    { id: 2, name: 'Week 2', description: 'Basic Training' },
    { id: 3, name: 'Week 3', description: 'Project Assignment' },
    { id: 4, name: 'Week 4', description: 'Mid-term Review' },
    { id: 5, name: 'Week 5', description: 'Advanced Training' },
    { id: 6, name: 'Week 6', description: 'Project Development' },
    { id: 7, name: 'Week 7', description: 'Testing and Debugging' },
    { id: 8, name: 'Week 8', description: 'Final Presentation' }
  ]);
  
  // Weekly Tasks Storage
  // Structure: { streamName_batchId: [tasks] }
  const [weeklyTasks, setWeeklyTasks] = useState({});

  // Attendance Storage
  // Structure: { month_year: { internId-week: status } }
  const [attendanceRecords, setAttendanceRecords] = useState({});

  // Projects Storage
  // Structure: { batchId: [projects] }
  const [projects, setProjects] = useState({
    1: [
      {
        id: 1,
        name: 'E-commerce Website',
        description: 'Build a full-stack e-commerce website with React and Node.js',
        status: 'Partially Completed',
        assignedInterns: [1, 2],
        adminRemarks: 'Good progress on frontend. Backend API needs more work.',
        batchId: 1,
        createdAt: '2024-12-15T10:00:00Z',
        updatedAt: '2024-12-17T14:30:00Z'
      }
    ],
    2: [
      {
        id: 2,
        name: 'Machine Learning Model',
        description: 'Develop a predictive model for customer behavior analysis',
        status: 'Not Completed',
        assignedInterns: [3, 5],
        adminRemarks: 'Data preprocessing phase completed. Model training in progress.',
        batchId: 2,
        createdAt: '2024-12-16T09:00:00Z',
        updatedAt: '2024-12-16T09:00:00Z'
      }
    ]
  });

  // Performance Evaluations Storage
  // Structure: { streamName: { batchId: [evaluations] } }
  const [performanceEvaluations, setPerformanceEvaluations] = useState({
    'Web Development': {
      'default': [
        {
          id: 1,
          internId: 1,
          week: 'Week 1',
          ratings: {
            interest: 4,
            enthusiasm: 5,
            technicalSkills: 3,
            deadlineAdherence: 4,
            teamCollaboration: 4
          },
          comments: 'Sarah shows great enthusiasm and is quick to learn new concepts. Needs more practice with advanced React patterns.',
          evaluatedAt: '2024-12-10T10:00:00Z',
          evaluatedBy: 'Admin'
        },
        {
          id: 2,
          internId: 2,
          week: 'Week 2',
          ratings: {
            interest: 5,
            enthusiasm: 4,
            technicalSkills: 4,
            deadlineAdherence: 5,
            teamCollaboration: 5
          },
          comments: 'Jennifer demonstrates excellent technical skills and consistently meets deadlines. Great team player.',
          evaluatedAt: '2024-12-11T14:30:00Z',
          evaluatedBy: 'Admin'
        }
      ]
    },
    'AI/ML': {
      'default': [
        {
          id: 3,
          internId: 3,
          week: 'Week 1',
          ratings: {
            interest: 5,
            enthusiasm: 5,
            technicalSkills: 4,
            deadlineAdherence: 4,
            teamCollaboration: 3
          },
          comments: 'Mike has strong technical background in ML algorithms. Could improve on collaborative communication.',
          evaluatedAt: '2024-12-09T16:15:00Z',
          evaluatedBy: 'Admin'
        }
      ]
    },
    'Mixed Streams': {
      '1': [
        {
          id: 4,
          internId: 4,
          week: 'Week 1',
          ratings: {
            interest: 4,
            enthusiasm: 4,
            technicalSkills: 3,
            deadlineAdherence: 4,
            teamCollaboration: 5
          },
          comments: 'Emma is very collaborative and shows good progress in mobile development fundamentals.',
          evaluatedAt: '2024-12-08T11:20:00Z',
          evaluatedBy: 'Admin'
        }
      ]
    }
  });

  // Default stream mapping for URL params to display names
  const defaultStreamMapping = {
    'web-development': 'Web Development',
    'app-development': 'App Development',
    'ai-ml': 'AI/ML',
    'blockchain': 'Blockchain',
    'automation': 'Automation',
    'analytics': 'Analytics'
  };

  // Combine default and custom streams (excluding archived default streams)
  const getAllStreams = () => {
    const defaultStreams = Object.values(defaultStreamMapping).filter(
      streamName => !archivedDefaultStreams.includes(streamName)
    );
    const customStreamNames = customStreams
      .filter(stream => stream.status === 'active')
      .map(stream => stream.name);
    const allStreams = [...defaultStreams, ...customStreamNames];
    // Sort alphabetically for consistent ordering
    return allStreams.sort();
  };

  // Dynamic stream mapping including custom streams
  const getStreamMapping = () => {
    const customMapping = {};
    customStreams.forEach(stream => {
      customMapping[stream.slug] = stream.name;
    });
    return { ...defaultStreamMapping, ...customMapping };
  };

  const streamMapping = getStreamMapping();

  const addIntern = (internData, currentStream = null) => {
    const newIntern = {
      ...internData,
      id: nextId,
      joinedDate: new Date().toISOString().split('T')[0],
      status: internData.onboardingStatus || 'active',
      domain: internData.domain || currentStream // Use form domain first, then fallback to currentStream
    };

    setInterns(prev => [...prev, newIntern]);
    setNextId(prev => prev + 1);
    return newIntern;
  };

  const updateIntern = (internId, updates) => {
    setInterns(prev => prev.map(intern => 
      intern.id === internId ? { ...intern, ...updates } : intern
    ));
  };

  const deleteIntern = (internId) => {
    setInterns(prev => prev.filter(intern => intern.id !== internId));
  };

  const getInternsByStream = (streamKey) => {
    const mappedStream = streamMapping[streamKey] || streamKey;
    return interns.filter(intern => intern.domain === mappedStream);
  };

  const getAllInterns = () => {
    return interns;
  };

  const getInternById = (id) => {
    return interns.find(intern => intern.id === id);
  };

  const getStreamStats = () => {
    const stats = {};
    const allStreams = getAllStreams();
    allStreams.forEach(stream => {
      const streamInterns = interns.filter(intern => intern.domain === stream);
      stats[stream] = {
        total: streamInterns.length,
        active: streamInterns.filter(intern => intern.status === 'active').length,
        dropped: streamInterns.filter(intern => intern.status === 'dropped').length,
        completed: streamInterns.filter(intern => intern.status === 'completed').length
      };
    });
    return stats;
  };

  const searchInterns = (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return interns;
    }

    const term = searchTerm.toLowerCase().trim();
    return interns.filter(intern => {
      return (
        intern.name.toLowerCase().includes(term) ||
        intern.email.toLowerCase().includes(term) ||
        intern.college.toLowerCase().includes(term) ||
        intern.domain.toLowerCase().includes(term) ||
        intern.status.toLowerCase().includes(term) ||
        (intern.phone && intern.phone.toLowerCase().includes(term)) ||
        (intern.academicYear && intern.academicYear.toLowerCase().includes(term)) ||
        (intern.batch && intern.batch.toLowerCase().includes(term)) ||
        (intern.additionalDetails && intern.additionalDetails.toLowerCase().includes(term))
      );
    });
  };

  // Custom Stream Management Functions
  const addCustomStream = (streamData) => {
    // Check if stream already exists (in default or custom streams)
    const allExistingStreams = getAllStreams();
    if (allExistingStreams.includes(streamData.name)) {
      console.warn(`Stream "${streamData.name}" already exists`);
      return null;
    }

    const newStream = {
      id: Date.now(),
      name: streamData.name,
      slug: streamData.slug,
      description: streamData.description || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    setCustomStreams(prev => [...prev, newStream]);
    return newStream;
  };

  const updateCustomStream = (streamId, updates) => {
    setCustomStreams(prev => prev.map(stream =>
      stream.id === streamId ? { ...stream, ...updates } : stream
    ));
  };

  const deleteCustomStream = (streamId) => {
    const stream = customStreams.find(s => s.id === streamId);
    if (!stream) return;

    // Check if stream has interns
    const streamInterns = interns.filter(intern => intern.domain === stream.name);
    
    if (streamInterns.length > 0) {
      throw new Error('Cannot delete stream with interns. Archive it instead.');
    }

    // Permanently delete if no interns
    setCustomStreams(prev => prev.filter(stream => stream.id !== streamId));
  };

  const archiveCustomStream = (streamId) => {
    setCustomStreams(prev => prev.map(stream =>
      stream.id === streamId ? { ...stream, status: 'archived' } : stream
    ));
  };

  const restoreCustomStream = (streamId) => {
    setCustomStreams(prev => prev.map(stream =>
      stream.id === streamId ? { ...stream, status: 'active' } : stream
    ));
  };

  const getCustomStreams = () => {
    return customStreams.filter(stream => stream.status === 'active');
  };

  const getAllCustomStreamsIncludingArchived = () => {
    return customStreams;
  };

  const archiveDefaultStream = (streamName) => {
    if (!archivedDefaultStreams.includes(streamName)) {
      setArchivedDefaultStreams(prev => [...prev, streamName]);
    }
  };

  const restoreDefaultStream = (streamName) => {
    setArchivedDefaultStreams(prev => prev.filter(name => name !== streamName));
  };

  const getAllArchivedDefaultStreams = () => {
    return archivedDefaultStreams.map(streamName => ({
      name: streamName,
      isDefault: true,
      status: 'archived'
    }));
  };

  // Batch Management Functions
  const getAllBatches = () => {
    return batches.filter(batch => batch.status === 'active');
  };

  const getAllBatchesIncludingArchived = () => {
    return batches;
  };

  const getAvailableBatches = () => {
    const activeBatches = batches.filter(batch => batch.status === 'active');
    return activeBatches.map(batch => ({
      ...batch,
      internCount: interns.filter(intern => intern.batch === batch.name).length
    }));
  };

  const getBatchById = (batchId) => {
    return batches.find(batch => batch.id === parseInt(batchId));
  };

  const addBatch = (batchData) => {
    // Check for duplicate names
    const existingBatch = batches.find(
      batch => batch.name.toLowerCase() === batchData.name.toLowerCase()
    );
    
    if (existingBatch) {
      throw new Error('A batch with this name already exists');
    }

    const newBatch = {
      id: nextBatchId,
      name: batchData.name,
      description: batchData.description || '',
      startDate: batchData.startDate || '',
      endDate: batchData.endDate || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    setBatches(prev => [...prev, newBatch]);
    setNextBatchId(prev => prev + 1);
    return newBatch;
  };

  const updateBatch = (batchId, updates) => {
    setBatches(prev => prev.map(batch =>
      batch.id === batchId ? { ...batch, ...updates } : batch
    ));
  };

  const deleteBatch = (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    // Check if batch has interns
    const batchInterns = interns.filter(intern => intern.batch === batch.name);
    
    if (batchInterns.length > 0) {
      throw new Error('Cannot delete batch with interns. Archive it instead.');
    }

    // Permanently delete if no interns
    setBatches(prev => prev.filter(batch => batch.id !== batchId));
  };

  const archiveBatch = (batchId) => {
    setBatches(prev => prev.map(batch =>
      batch.id === batchId ? { ...batch, status: 'archived' } : batch
    ));
  };

  const restoreBatch = (batchId) => {
    setBatches(prev => prev.map(batch =>
      batch.id === batchId ? { ...batch, status: 'active' } : batch
    ));
  };

  const getInternsByBatch = (batchName) => {
    return interns.filter(intern => intern.batch === batchName);
  };

  const setSelectedBatch = (batchId) => {
    setSelectedBatchId(batchId);
  };

  const getSelectedBatch = () => {
    return selectedBatchId;
  };

  const clearSelectedBatch = () => {
    setSelectedBatchId(null);
  };

  const getStreamBySlug = (slug) => {
    // Check default streams first
    if (defaultStreamMapping[slug]) {
      return {
        name: defaultStreamMapping[slug],
        slug: slug,
        isDefault: true
      };
    }
    
    // Check custom streams
    const customStream = customStreams.find(stream => stream.slug === slug);
    if (customStream) {
      return {
        ...customStream,
        isDefault: false
      };
    }
    
    return null;
  };

  // Global Week Management Functions
  const getGlobalWeeks = () => {
    return globalWeeks;
  };

  const addGlobalWeek = (weekData) => {
    const newWeek = {
      id: Date.now(),
      name: weekData.name,
      description: weekData.description || '',
      createdAt: new Date().toISOString()
    };
    
    setGlobalWeeks(prev => [...prev, newWeek].sort((a, b) => {
      // Sort by week number
      const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
      const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
      return aNum - bNum;
    }));
    
    return newWeek;
  };

  const deleteGlobalWeek = (weekId) => {
    setGlobalWeeks(prev => prev.filter(week => week.id !== weekId));
  };

  // Performance Evaluation Functions
  const getPerformanceEvaluations = (streamName, batchId = 'default') => {
    const streamKey = streamName || 'default';
    const batchKey = batchId || 'default';
    
    if (!performanceEvaluations[streamKey] || !performanceEvaluations[streamKey][batchKey]) {
      return [];
    }
    
    return performanceEvaluations[streamKey][batchKey];
  };

  const savePerformanceEvaluation = async (streamName, batchId = 'default', evaluationData) => {
    const streamKey = streamName || 'default';
    const batchKey = batchId || 'default';
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setPerformanceEvaluations(prev => {
          const newEvaluations = { ...prev };
          
          // Initialize structure if it doesn't exist
          if (!newEvaluations[streamKey]) {
            newEvaluations[streamKey] = {};
          }
          if (!newEvaluations[streamKey][batchKey]) {
            newEvaluations[streamKey][batchKey] = [];
          }
          
          // Find existing evaluation for same intern and week
          const existingIndex = newEvaluations[streamKey][batchKey].findIndex(
            evaluation => evaluation.internId === evaluationData.internId && evaluation.week === evaluationData.week
          );
          
          if (existingIndex >= 0) {
            // Update existing evaluation
            newEvaluations[streamKey][batchKey][existingIndex] = {
              ...newEvaluations[streamKey][batchKey][existingIndex],
              ...evaluationData,
              updatedAt: new Date().toISOString()
            };
          } else {
            // Add new evaluation
            newEvaluations[streamKey][batchKey].push({
              id: Date.now(),
              ...evaluationData
            });
          }
          
          return newEvaluations;
        });
        
        resolve();
      }, 500); // Simulate API delay
    });
  };

  const getInternPerformanceHistory = (internId, streamName, batchId = 'default') => {
    const evaluations = getPerformanceEvaluations(streamName, batchId);
    return evaluations.filter(evaluation => evaluation.internId === internId);
  };

  const getPerformanceStatistics = (streamName, batchId = 'default') => {
    const evaluations = getPerformanceEvaluations(streamName, batchId);
    
    if (evaluations.length === 0) {
      return {
        totalEvaluations: 0,
        averageRatings: {},
        internCount: 0,
        weeksCovered: []
      };
    }
    
    const allRatings = {
      interest: [],
      enthusiasm: [],
      technicalSkills: [],
      deadlineAdherence: [],
      teamCollaboration: []
    };
    
    const uniqueInterns = new Set();
    const uniqueWeeks = new Set();
    
    evaluations.forEach(evaluation => {
      uniqueInterns.add(evaluation.internId);
      uniqueWeeks.add(evaluation.week);
      
      Object.keys(allRatings).forEach(category => {
        if (evaluation.ratings[category] > 0) {
          allRatings[category].push(evaluation.ratings[category]);
        }
      });
    });
    
    const averageRatings = {};
    Object.keys(allRatings).forEach(category => {
      const ratings = allRatings[category];
      averageRatings[category] = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
    });
    
    return {
      totalEvaluations: evaluations.length,
      averageRatings,
      internCount: uniqueInterns.size,
      weeksCovered: Array.from(uniqueWeeks).sort()
    };
  };

  // Weekly Tasks Management Functions
  const getWeeklyTasks = (streamName, batchId = null) => {
    const key = `${streamName || 'default'}_${batchId || 'all'}`;
    return weeklyTasks[key] || [];
  };

  const saveWeeklyTask = (streamName, batchId = null, taskData) => {
    const key = `${streamName || 'default'}_${batchId || 'all'}`;
    
    setWeeklyTasks(prev => {
      const newTasks = { ...prev };
      if (!newTasks[key]) {
        newTasks[key] = [];
      }
      
      const newTask = {
        id: Date.now(),
        ...taskData,
        createdAt: new Date().toISOString()
      };
      
      newTasks[key] = [...newTasks[key], newTask];
      return newTasks;
    });
  };

  const updateWeeklyTaskStatus = (streamName, batchId = null, taskId, status) => {
    const key = `${streamName || 'default'}_${batchId || 'all'}`;
    
    setWeeklyTasks(prev => {
      const newTasks = { ...prev };
      if (newTasks[key]) {
        newTasks[key] = newTasks[key].map(task =>
          task.id === taskId ? { ...task, status, updatedAt: new Date().toISOString() } : task
        );
      }
      return newTasks;
    });
  };

  const deleteWeeklyTask = (streamName, batchId = null, taskId) => {
    const key = `${streamName || 'default'}_${batchId || 'all'}`;
    
    setWeeklyTasks(prev => {
      const newTasks = { ...prev };
      if (newTasks[key]) {
        newTasks[key] = newTasks[key].filter(task => task.id !== taskId);
      }
      return newTasks;
    });
  };

  // Project Management Functions
  const getProjectsByBatch = (batchId) => {
    return projects[batchId] || [];
  };

  const addProject = (batchId, projectData) => {
    const newProject = {
      id: Date.now(),
      ...projectData,
      batchId: batchId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => ({
      ...prev,
      [batchId]: [...(prev[batchId] || []), newProject]
    }));

    return newProject;
  };

  const updateProject = (batchId, projectId, updates) => {
    setProjects(prev => ({
      ...prev,
      [batchId]: (prev[batchId] || []).map(project =>
        project.id === projectId
          ? { ...project, ...updates, updatedAt: new Date().toISOString() }
          : project
      )
    }));
  };

  const deleteProject = (batchId, projectId) => {
    setProjects(prev => ({
      ...prev,
      [batchId]: (prev[batchId] || []).filter(project => project.id !== projectId)
    }));
  };

  const getProjectById = (batchId, projectId) => {
    const batchProjects = projects[batchId] || [];
    return batchProjects.find(project => project.id === projectId);
  };

  // Attendance Management Functions
  const saveAttendanceData = (month, attendanceData) => {
    const key = month.replace(' ', '_'); // Convert "March 2025" to "March_2025"
    setAttendanceRecords(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...attendanceData,
        savedAt: new Date().toISOString()
      }
    }));
    
    // Also save to localStorage for persistence
    const storageKey = `attendance_${key}`;
    localStorage.setItem(storageKey, JSON.stringify({
      ...attendanceData,
      savedAt: new Date().toISOString()
    }));
  };

  const getAttendanceData = (month) => {
    const key = month.replace(' ', '_');
    
    // First try to get from state
    if (attendanceRecords[key]) {
      return attendanceRecords[key];
    }
    
    // If not in state, try localStorage
    const storageKey = `attendance_${key}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Update state with localStorage data
      setAttendanceRecords(prev => ({
        ...prev,
        [key]: parsedData
      }));
      return parsedData;
    }
    
    return {};
  };

  const getAllAttendanceRecords = () => {
    return attendanceRecords;
  };

  const getAttendanceStats = (month) => {
    const data = getAttendanceData(month);
    const entries = Object.entries(data).filter(([key]) => key !== 'savedAt');
    
    const stats = {
      total: entries.length,
      present: entries.filter(([, status]) => status === 'present').length,
      absent: entries.filter(([, status]) => status === 'absent').length,
      halfDay: entries.filter(([, status]) => status === 'half-day').length,
      notSet: entries.filter(([, status]) => !status || status === '').length
    };
    
    return stats;
  };

  const value = {
    interns,
    addIntern,
    updateIntern,
    deleteIntern,
    getInternsByStream,
    getAllInterns,
    getInternById,
    getStreamStats,
    searchInterns,
    streamMapping,
    getAllStreams,
    addCustomStream,
    updateCustomStream,
    deleteCustomStream,
    archiveCustomStream,
    restoreCustomStream,
    getCustomStreams,
    getAllCustomStreamsIncludingArchived,
    archiveDefaultStream,
    restoreDefaultStream,
    getAllArchivedDefaultStreams,
    getStreamBySlug,
    // Global Week Management
    getGlobalWeeks,
    addGlobalWeek,
    deleteGlobalWeek,
    // Performance Evaluation Functions
    getPerformanceEvaluations,
    savePerformanceEvaluation,
    getInternPerformanceHistory,
    getPerformanceStatistics,
    // Weekly Tasks Management Functions
    getWeeklyTasks,
    saveWeeklyTask,
    updateWeeklyTaskStatus,
    deleteWeeklyTask,
    // Batch Management Functions
    getAllBatches,
    getAllBatchesIncludingArchived,
    getAvailableBatches,
    getBatchById,
    addBatch,
    updateBatch,
    deleteBatch,
    archiveBatch,
    restoreBatch,
    getInternsByBatch,
    setSelectedBatch,
    getSelectedBatch,
    clearSelectedBatch,
    selectedBatchId,
    // Project Management Functions
    getProjectsByBatch,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    // Attendance Management Functions
    saveAttendanceData,
    getAttendanceData,
    getAllAttendanceRecords,
    getAttendanceStats,
    // Keep old names for backward compatibility
    getInternsByDomain: getInternsByStream,
    getDomainStats: getStreamStats,
    domainMapping: streamMapping
  };

  return (
    <InternContext.Provider value={value}>
      {children}
    </InternContext.Provider>
  );
};