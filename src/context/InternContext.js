import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const InternContext = createContext();

export const useInterns = () => {
  const context = useContext(InternContext);
  if (!context) {
    throw new Error('useInterns must be used within an InternProvider');
  }
  return context;
};

export const InternProvider = ({ children }) => {
  // State for data from Supabase
  const [interns, setInterns] = useState([]);
  const [streams, setStreams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [globalWeeks, setGlobalWeeks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [performanceEvaluations, setPerformanceEvaluations] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // UI state
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Default stream mapping for URL params to display names
  const defaultStreamMapping = {
    'web-development': 'Web Development',
    'app-development': 'App Development',
    'ai-ml': 'AI/ML',
    'blockchain': 'Blockchain',
    'automation': 'Automation',
    'analytics': 'Analytics'
  };

  // Load all data from Supabase on mount
  useEffect(() => {
    loadAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadInterns(),
        loadStreams(),
        loadBatches(),
        loadGlobalWeeks(),
        loadProjects(),
        loadPerformanceEvaluations(),
        loadWeeklyTasks(),
        loadAttendanceRecords()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // SUPABASE DATA LOADING FUNCTIONS
  const loadInterns = async () => {
    const { data, error } = await supabase
      .from('interns')
      .select(`
        *,
        streams (name),
        batches (name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading interns:', error);
      return;
    }
    
    // Transform data to match UI expectations
    const transformedData = (data || []).map(intern => ({
      ...intern,
      domain: intern.streams?.name || '',
      batch: intern.batches?.name || ''
    }));
    
    setInterns(transformedData);
  };

  const loadStreams = async () => {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
      .eq('status', 'active')
      .order('name');
    
    if (error) {
      console.error('Error loading streams:', error);
      return;
    }
    setStreams(data || []);
  };

  const loadBatches = async () => {
    const { data, error } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading batches:', error);
      return;
    }
    setBatches(data || []);
  };

  const loadGlobalWeeks = async () => {
    const { data, error } = await supabase
      .from('global_weeks')
      .select('*')
      .order('week_number');
    
    if (error) {
      console.error('Error loading global weeks:', error);
      return;
    }
    setGlobalWeeks(data || []);
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_assignments (
          intern_id,
          interns (name)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading projects:', error);
      return;
    }
    setProjects(data || []);
  };

  const loadPerformanceEvaluations = async () => {
    const { data, error } = await supabase
      .from('performance_evaluations')
      .select(`
        *,
        interns (name, domain, batch)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading performance evaluations:', error);
      return;
    }
    setPerformanceEvaluations(data || []);
  };

  const loadWeeklyTasks = async () => {
    const { data, error } = await supabase
      .from('weekly_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading weekly tasks:', error);
      return;
    }
    setWeeklyTasks(data || []);
  };

  const loadAttendanceRecords = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error loading attendance records:', error);
      return;
    }
    setAttendanceRecords(data || []);
  };

  // INTERN MANAGEMENT FUNCTIONS
  const addIntern = async (internData, currentStream = null) => {
    console.log('Adding intern with data:', internData);
    
    // First, we need to get or create the stream and batch IDs
    let streamId = null;
    let batchId = null;

    // Get stream ID if domain is provided
    if (internData.domain || currentStream) {
      const streamName = internData.domain || currentStream;
      const { data: streamData, error: streamError } = await supabase
        .from('streams')
        .select('id')
        .eq('name', streamName)
        .single();
      
      if (streamError && streamError.code === 'PGRST116') {
        // Stream doesn't exist, create it
        const { data: newStream, error: createStreamError } = await supabase
          .from('streams')
          .insert([{ name: streamName }])
          .select('id')
          .single();
        
        if (createStreamError) {
          console.error('Error creating stream:', createStreamError);
          throw createStreamError;
        }
        streamId = newStream.id;
      } else if (streamError) {
        console.error('Error finding stream:', streamError);
        throw streamError;
      } else {
        streamId = streamData.id;
      }
    }

    // Get batch ID if batch is provided
    if (internData.batch) {
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('id')
        .eq('name', internData.batch)
        .single();
      
      if (batchError && batchError.code === 'PGRST116') {
        // Batch doesn't exist, create it
        const { data: newBatch, error: createBatchError } = await supabase
          .from('batches')
          .insert([{ name: internData.batch }])
          .select('id')
          .single();
        
        if (createBatchError) {
          console.error('Error creating batch:', createBatchError);
          throw createBatchError;
        }
        batchId = newBatch.id;
      } else if (batchError) {
        console.error('Error finding batch:', batchError);
        throw batchError;
      } else {
        batchId = batchData.id;
      }
    }

    const newIntern = {
      name: internData.name,
      email: internData.email,
      college: internData.college,
      phone: internData.phone,
      stream_id: streamId,
      batch_id: batchId,
      status: internData.onboardingStatus || 'active'
    };

    console.log('Inserting to Supabase:', newIntern);

    const { data, error } = await supabase
      .from('interns')
      .insert([newIntern])
      .select(`
        *,
        streams (name),
        batches (name)
      `)
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }

    console.log('Successfully added intern:', data);

    // Transform data to match UI expectations
    const transformedData = {
      ...data,
      domain: data.streams?.name || '',
      batch: data.batches?.name || ''
    };

    // Update local state
    setInterns(prev => [transformedData, ...prev]);
    return transformedData;
  };

  const updateIntern = async (internId, updates) => {
    const { data, error } = await supabase
      .from('interns')
      .update({
        name: updates.name,
        email: updates.email,
        college: updates.college,
        phone: updates.phone,
        academic_year: updates.academicYear,
        domain: updates.domain,
        batch: updates.batch,
        status: updates.status,
        additional_details: updates.additionalDetails
      })
      .eq('id', internId)
      .select()
      .single();

    if (error) {
      console.error('Error updating intern:', error);
      throw error;
    }

    // Update local state
    setInterns(prev => prev.map(intern => 
      intern.id === internId ? data : intern
    ));
    return data;
  };

  const deleteIntern = async (internId) => {
    const { error } = await supabase
      .from('interns')
      .delete()
      .eq('id', internId);

    if (error) {
      console.error('Error deleting intern:', error);
      throw error;
    }

    // Update local state
    setInterns(prev => prev.filter(intern => intern.id !== internId));
  };

  // STREAM MANAGEMENT FUNCTIONS
  const addCustomStream = async (streamData) => {
    // Check if stream already exists
    const existingStream = streams.find(s => s.name.toLowerCase() === streamData.name.toLowerCase());
    if (existingStream) {
      console.warn(`Stream "${streamData.name}" already exists`);
      return null;
    }

    const newStream = {
      name: streamData.name,
      slug: streamData.slug,
      description: streamData.description || '',
      status: 'active'
    };

    const { data, error } = await supabase
      .from('streams')
      .insert([newStream])
      .select()
      .single();

    if (error) {
      console.error('Error adding stream:', error);
      throw error;
    }

    // Update local state
    setStreams(prev => [...prev, data]);
    return data;
  };

  const updateCustomStream = async (streamId, updates) => {
    const { data, error } = await supabase
      .from('streams')
      .update(updates)
      .eq('id', streamId)
      .select()
      .single();

    if (error) {
      console.error('Error updating stream:', error);
      throw error;
    }

    // Update local state
    setStreams(prev => prev.map(stream =>
      stream.id === streamId ? data : stream
    ));
    return data;
  };

  const deleteCustomStream = async (streamId) => {
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return;

    // Check if stream has interns
    const streamInterns = interns.filter(intern => intern.domain === stream.name);
    
    if (streamInterns.length > 0) {
      throw new Error('Cannot delete stream with interns. Archive it instead.');
    }

    const { error } = await supabase
      .from('streams')
      .delete()
      .eq('id', streamId);

    if (error) {
      console.error('Error deleting stream:', error);
      throw error;
    }

    // Update local state
    setStreams(prev => prev.filter(stream => stream.id !== streamId));
  };

  const archiveCustomStream = async (streamId) => {
    await updateCustomStream(streamId, { status: 'archived' });
  };

  const restoreCustomStream = async (streamId) => {
    await updateCustomStream(streamId, { status: 'active' });
  };

  // BATCH MANAGEMENT FUNCTIONS
  const addBatch = async (batchData) => {
    // Check for duplicate names
    const existingBatch = batches.find(
      batch => batch.name.toLowerCase() === batchData.name.toLowerCase()
    );
    
    if (existingBatch) {
      throw new Error('A batch with this name already exists');
    }

    const newBatch = {
      name: batchData.name,
      description: batchData.description || '',
      start_date: batchData.startDate || null,
      end_date: batchData.endDate || null,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('batches')
      .insert([newBatch])
      .select()
      .single();

    if (error) {
      console.error('Error adding batch:', error);
      throw error;
    }

    // Update local state
    setBatches(prev => [data, ...prev]);
    return data;
  };

  const updateBatch = async (batchId, updates) => {
    const { data, error } = await supabase
      .from('batches')
      .update({
        name: updates.name,
        description: updates.description,
        start_date: updates.startDate,
        end_date: updates.endDate,
        status: updates.status
      })
      .eq('id', batchId)
      .select()
      .single();

    if (error) {
      console.error('Error updating batch:', error);
      throw error;
    }

    // Update local state
    setBatches(prev => prev.map(batch =>
      batch.id === batchId ? data : batch
    ));
    return data;
  };

  const deleteBatch = async (batchId) => {
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    // Check if batch has interns
    const batchInterns = interns.filter(intern => intern.batch === batch.name);
    
    if (batchInterns.length > 0) {
      throw new Error('Cannot delete batch with interns. Archive it instead.');
    }

    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', batchId);

    if (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }

    // Update local state
    setBatches(prev => prev.filter(batch => batch.id !== batchId));
  };

  const archiveBatch = async (batchId) => {
    await updateBatch(batchId, { status: 'archived' });
  };

  const restoreBatch = async (batchId) => {
    await updateBatch(batchId, { status: 'active' });
  };

  // GLOBAL WEEKS MANAGEMENT
  const addGlobalWeek = async (weekData) => {
    const newWeek = {
      name: weekData.name,
      description: weekData.description || '',
      week_number: parseInt(weekData.name.match(/\d+/)?.[0] || '0')
    };

    const { data, error } = await supabase
      .from('global_weeks')
      .insert([newWeek])
      .select()
      .single();

    if (error) {
      console.error('Error adding global week:', error);
      throw error;
    }

    // Update local state and sort
    setGlobalWeeks(prev => [...prev, data].sort((a, b) => a.week_number - b.week_number));
    return data;
  };

  const deleteGlobalWeek = async (weekId) => {
    const { error } = await supabase
      .from('global_weeks')
      .delete()
      .eq('id', weekId);

    if (error) {
      console.error('Error deleting global week:', error);
      throw error;
    }

    // Update local state
    setGlobalWeeks(prev => prev.filter(week => week.id !== weekId));
  };

  // PERFORMANCE EVALUATION FUNCTIONS
  const savePerformanceEvaluation = async (streamName, batchId = 'default', evaluationData) => {
    const newEvaluation = {
      intern_id: evaluationData.internId,
      week: evaluationData.week,
      stream_name: streamName,
      batch_id: batchId === 'default' ? null : batchId,
      interest_rating: evaluationData.ratings.interest,
      enthusiasm_rating: evaluationData.ratings.enthusiasm,
      technical_skills_rating: evaluationData.ratings.technicalSkills,
      deadline_adherence_rating: evaluationData.ratings.deadlineAdherence,
      team_collaboration_rating: evaluationData.ratings.teamCollaboration,
      comments: evaluationData.comments,
      evaluated_by: evaluationData.evaluatedBy || 'Admin'
    };

    // Check if evaluation already exists for this intern and week
    const { data: existing } = await supabase
      .from('performance')
      .select('id')
      .eq('intern_id', evaluationData.internId)
      .eq('week', evaluationData.week)
      .eq('stream_name', streamName)
      .eq('batch_id', batchId === 'default' ? null : batchId)
      .single();

    let result;
    if (existing) {
      // Update existing evaluation
      const { data, error } = await supabase
        .from('performance')
        .update(newEvaluation)
        .eq('id', existing.id)
        .select(`
          *,
          interns (name, domain, batch)
        `)
        .single();

      if (error) {
        console.error('Error updating performance evaluation:', error);
        throw error;
      }
      result = data;

      // Update local state
      setPerformanceEvaluations(prev => prev.map(evaluation => 
        evaluation.id === existing.id ? data : evaluation
      ));
    } else {
      // Insert new evaluation
      const { data, error } = await supabase
        .from('performance')
        .insert([newEvaluation])
        .select(`
          *,
          interns (name, domain, batch)
        `)
        .single();

      if (error) {
        console.error('Error saving performance evaluation:', error);
        throw error;
      }
      result = data;

      // Update local state
      setPerformanceEvaluations(prev => [data, ...prev]);
    }

    return result;
  };

  // WEEKLY TASKS FUNCTIONS
  const saveWeeklyTask = async (streamName, batchId = null, taskData) => {
    const newTask = {
      intern_id: taskData.internId,
      intern_name: taskData.internName,
      week_number: taskData.weekNumber,
      task_title: taskData.taskTitle,
      task_description: taskData.taskDescription,
      status: taskData.status || 'Not Tried',
      stream_name: streamName,
      batch_id: batchId,
      project_link: taskData.projectLink || '',
      remarks: taskData.remarks || '',
      grades: taskData.grades || {},
      total_grade: taskData.totalGrade || 0
    };

    const { data, error } = await supabase
      .from('weekly_tasks')
      .insert([newTask])
      .select()
      .single();

    if (error) {
      console.error('Error saving weekly task:', error);
      throw error;
    }

    // Update local state
    setWeeklyTasks(prev => [data, ...prev]);
    return data;
  };

  const updateWeeklyTaskStatus = async (taskId, updates) => {
    const { data, error } = await supabase
      .from('weekly_tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating weekly task:', error);
      throw error;
    }

    // Update local state
    setWeeklyTasks(prev => prev.map(task =>
      task.id === taskId ? data : task
    ));
    return data;
  };

  const deleteWeeklyTask = async (taskId) => {
    const { error } = await supabase
      .from('weekly_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting weekly task:', error);
      throw error;
    }

    // Update local state
    setWeeklyTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // PROJECT MANAGEMENT FUNCTIONS
  const addProject = async (batchId, projectData) => {
    const newProject = {
      name: projectData.name,
      description: projectData.description,
      status: projectData.status || 'Not Started',
      batch_id: batchId,
      admin_remarks: projectData.adminRemarks || ''
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      throw error;
    }

    // If there are assigned interns, add them to project_assignments
    if (projectData.assignedInterns && projectData.assignedInterns.length > 0) {
      const assignments = projectData.assignedInterns.map(internId => ({
        project_id: data.id,
        intern_id: internId
      }));

      const { error: assignmentError } = await supabase
        .from('project_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.error('Error assigning interns to project:', assignmentError);
      }
    }

    // Reload projects to get updated data with assignments
    await loadProjects();
    return data;
  };

  const updateProject = async (projectId, updates) => {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        description: updates.description,
        status: updates.status,
        admin_remarks: updates.adminRemarks
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    // Update local state
    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, ...data } : project
    ));
    return data;
  };

  const deleteProject = async (projectId) => {
    // First delete project assignments
    await supabase
      .from('project_assignments')
      .delete()
      .eq('project_id', projectId);

    // Then delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    // Update local state
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  // ATTENDANCE MANAGEMENT FUNCTIONS
  const saveAttendanceData = async (month, attendanceData) => {
    const attendanceEntries = Object.entries(attendanceData)
      .filter(([key]) => key !== 'savedAt')
      .map(([key, status]) => {
        const [internId, week] = key.split('-');
        return {
          intern_id: parseInt(internId),
          week: week,
          month: month,
          status: status,
          date: new Date().toISOString().split('T')[0] // Current date
        };
      });

    // Delete existing records for this month first
    await supabase
      .from('attendance')
      .delete()
      .eq('month', month);

    // Insert new records
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendanceEntries)
      .select();

    if (error) {
      console.error('Error saving attendance data:', error);
      throw error;
    }

    // Update local state
    await loadAttendanceRecords();
    return data;
  };

  // HELPER FUNCTIONS (using local state)
  const getAllInterns = () => interns;
  
  const getInternById = (id) => interns.find(intern => intern.id === id);
  
  const getInternsByStream = (streamKey) => {
    const mappedStream = defaultStreamMapping[streamKey] || streamKey;
    return interns.filter(intern => intern.domain === mappedStream);
  };

  const getInternsByBatch = (batchName) => {
    return interns.filter(intern => intern.batch === batchName);
  };

  const getAllStreams = () => {
    const defaultStreams = Object.values(defaultStreamMapping);
    const customStreamNames = streams.map(stream => stream.name);
    return [...defaultStreams, ...customStreamNames].sort();
  };

  const getAllBatches = () => {
    return batches.filter(batch => batch.status === 'active');
  };

  const getAllBatchesIncludingArchived = () => batches;

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

  const getCustomStreams = () => streams;

  const getAllCustomStreamsIncludingArchived = () => streams;

  const getGlobalWeeks = () => globalWeeks;

  const getProjectsByBatch = (batchId) => {
    return projects.filter(project => project.batch_id === parseInt(batchId));
  };

  const getProjectById = (batchId, projectId) => {
    return projects.find(project => project.id === parseInt(projectId) && project.batch_id === parseInt(batchId));
  };

  const getPerformanceEvaluations = (streamName, batchId = 'default') => {
    return performanceEvaluations.filter(evaluation => {
      const matchesStream = evaluation.stream_name === streamName;
      const matchesBatch = batchId === 'default' ? evaluation.batch_id === null : evaluation.batch_id === batchId;
      return matchesStream && matchesBatch;
    });
  };

  const getInternPerformanceHistory = (internId, streamName, batchId = 'default') => {
    return performanceEvaluations.filter(evaluation => {
      const matchesIntern = evaluation.intern_id === internId;
      const matchesStream = evaluation.stream_name === streamName;
      const matchesBatch = batchId === 'default' ? evaluation.batch_id === null : evaluation.batch_id === batchId;
      return matchesIntern && matchesStream && matchesBatch;
    });
  };

  const getWeeklyTasks = (streamName, batchId = null) => {
    return weeklyTasks.filter(task => {
      const matchesStream = task.stream_name === streamName;
      const matchesBatch = batchId === null ? true : task.batch_id === batchId;
      return matchesStream && matchesBatch;
    });
  };

  const getAttendanceData = (month) => {
    const monthRecords = attendanceRecords.filter(record => record.month === month);
    const attendanceMap = {};
    
    monthRecords.forEach(record => {
      const key = `${record.intern_id}-${record.week}`;
      attendanceMap[key] = record.status;
    });
    
    return attendanceMap;
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
        (intern.academic_year && intern.academic_year.toLowerCase().includes(term)) ||
        (intern.batch && intern.batch.toLowerCase().includes(term)) ||
        (intern.additional_details && intern.additional_details.toLowerCase().includes(term))
      );
    });
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

  // Batch selection state management
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
    const customStream = streams.find(stream => stream.slug === slug);
    if (customStream) {
      return {
        ...customStream,
        isDefault: false
      };
    }
    
    return null;
  };

  // Legacy function mappings for backward compatibility
  const streamMapping = { ...defaultStreamMapping };
  streams.forEach(stream => {
    streamMapping[stream.slug] = stream.name;
  });

  const value = {
    // Data
    interns,
    streams,
    batches,
    globalWeeks,
    projects,
    performanceEvaluations,
    weeklyTasks,
    attendanceRecords,
    loading,
    
    // Intern functions
    addIntern,
    updateIntern,
    deleteIntern,
    getAllInterns,
    getInternById,
    getInternsByStream,
    getInternsByBatch,
    searchInterns,
    
    // Stream functions
    addCustomStream,
    updateCustomStream,
    deleteCustomStream,
    archiveCustomStream,
    restoreCustomStream,
    getAllStreams,
    getCustomStreams,
    getAllCustomStreamsIncludingArchived,
    getStreamBySlug,
    getStreamStats,
    
    // Batch functions
    addBatch,
    updateBatch,
    deleteBatch,
    archiveBatch,
    restoreBatch,
    getAllBatches,
    getAllBatchesIncludingArchived,
    getAvailableBatches,
    getBatchById,
    setSelectedBatch,
    getSelectedBatch,
    clearSelectedBatch,
    selectedBatchId,
    
    // Global weeks functions
    getGlobalWeeks,
    addGlobalWeek,
    deleteGlobalWeek,
    
    // Performance functions
    getPerformanceEvaluations,
    savePerformanceEvaluation,
    getInternPerformanceHistory,
    
    // Weekly tasks functions
    getWeeklyTasks,
    saveWeeklyTask,
    updateWeeklyTaskStatus,
    deleteWeeklyTask,
    
    // Project functions
    getProjectsByBatch,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    
    // Attendance functions
    saveAttendanceData,
    getAttendanceData,
    
    // Legacy mappings
    streamMapping,
    getInternsByDomain: getInternsByStream,
    getDomainStats: getStreamStats,
    domainMapping: streamMapping,
    
    // Reload function
    loadAllData
  };

  return (
    <InternContext.Provider value={value}>
      {children}
    </InternContext.Provider>
  );
};