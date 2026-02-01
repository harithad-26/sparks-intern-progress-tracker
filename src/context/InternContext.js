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
        streams (id, name),
        batches (id, name)
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
      batch: intern.batches?.name || '',
      stream_id: intern.streams?.id || null,
      batch_id: intern.batches?.id || null,
      joinedDate: intern.joined_date ? new Date(intern.joined_date).toLocaleDateString() : '',
      additionalDetails: intern.additional_details || '' // Map database field to UI field
    }));
    
    setInterns(transformedData);
  };

  const loadStreams = async () => {
    const { data, error } = await supabase
      .from('streams')
      .select('*')
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
    console.log('=== LOADING GLOBAL WEEKS ===');
    
    // Use localStorage primarily for now
    let localWeeks = JSON.parse(localStorage.getItem('global_weeks') || '[]');
    console.log('Weeks from localStorage:', localWeeks);
    
    // If no weeks exist, create default weeks
    if (localWeeks.length === 0) {
      const defaultWeeks = [
        { id: 1, name: 'Week 1', description: 'First week evaluation', week_number: 1, created_at: new Date().toISOString() },
        { id: 2, name: 'Week 2', description: 'Second week evaluation', week_number: 2, created_at: new Date().toISOString() },
        { id: 3, name: 'Week 3', description: 'Third week evaluation', week_number: 3, created_at: new Date().toISOString() },
        { id: 4, name: 'Week 4', description: 'Fourth week evaluation', week_number: 4, created_at: new Date().toISOString() }
      ];
      localStorage.setItem('global_weeks', JSON.stringify(defaultWeeks));
      localWeeks = defaultWeeks;
      console.log('Created default weeks in localStorage');
    }
    
    setGlobalWeeks(localWeeks);
    console.log('Set global weeks state:', localWeeks);
  };

  const loadProjects = async () => {
    console.log('=== LOADING PROJECTS ===');
    
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
    
    console.log('Raw projects data from Supabase:', data);
    
    // Transform data to include assignedInterns array
    const transformedProjects = (data || []).map(project => ({
      ...project,
      assignedInterns: project.project_assignments?.map(assignment => assignment.intern_id) || []
    }));
    
    console.log('Transformed projects:', transformedProjects);
    
    setProjects(transformedProjects);
  };

  const loadPerformanceEvaluations = async () => {
    const { data, error } = await supabase
      .from('performance')
      .select('*')
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
      .order('created_at', { ascending: false });
    
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

    // Get batch ID if batch is provided - THIS IS MANDATORY
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

    // ENSURE batch_id is not null
    if (!batchId) {
      throw new Error('Intern must be assigned to a batch');
    }

    const newIntern = {
      name: internData.name,
      email: internData.email,
      college: internData.college,
      phone: internData.phone,
      academic_year: internData.academicYear,
      joined_date: internData.joinedDate,
      additional_details: internData.additionalDetails,
      stream_id: streamId,
      batch_id: batchId, // MANDATORY FOREIGN KEY
      status: internData.onboardingStatus || 'active'
    };

    console.log('Inserting to Supabase:', newIntern);

    const { data, error } = await supabase
      .from('interns')
      .insert([newIntern])
      .select(`
        *,
        streams (id, name),
        batches (id, name)
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
      batch: data.batches?.name || '',
      stream_id: data.streams?.id || null,
      batch_id: data.batches?.id || null,
      joinedDate: data.joined_date ? new Date(data.joined_date).toLocaleDateString() : '',
      additionalDetails: data.additional_details || '' // Map database field to UI field
    };

    // Update local state
    setInterns(prev => [transformedData, ...prev]);
    return transformedData;
  };

  const updateIntern = async (internId, updates) => {
    console.log('Updating intern:', internId, 'with updates:', updates);
    
    // Get stream and batch IDs if names are provided
    let streamId = updates.stream_id;
    let batchId = updates.batch_id;

    // Handle stream update
    if (updates.domain && !streamId) {
      const { data: streamData, error: streamError } = await supabase
        .from('streams')
        .select('id')
        .eq('name', updates.domain)
        .single();
      
      if (streamError && streamError.code === 'PGRST116') {
        // Stream doesn't exist, create it
        const { data: newStream, error: createStreamError } = await supabase
          .from('streams')
          .insert([{ name: updates.domain }])
          .select('id')
          .single();
        
        if (createStreamError) {
          console.error('Error creating stream:', createStreamError);
          throw createStreamError;
        }
        streamId = newStream.id;
      } else if (!streamError) {
        streamId = streamData.id;
      }
    }

    // Handle batch update - MANDATORY
    if (updates.batch && !batchId) {
      const { data: batchData, error: batchError } = await supabase
        .from('batches')
        .select('id')
        .eq('name', updates.batch)
        .single();
      
      if (batchError && batchError.code === 'PGRST116') {
        // Batch doesn't exist, create it
        const { data: newBatch, error: createBatchError } = await supabase
          .from('batches')
          .insert([{ name: updates.batch }])
          .select('id')
          .single();
        
        if (createBatchError) {
          console.error('Error creating batch:', createBatchError);
          throw createBatchError;
        }
        batchId = newBatch.id;
      } else if (!batchError) {
        batchId = batchData.id;
      }
    }

    // Prepare update data - ONLY include defined values
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.college !== undefined) updateData.college = updates.college;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.academicYear !== undefined) updateData.academic_year = updates.academicYear;
    if (updates.joinedDate !== undefined) updateData.joined_date = updates.joinedDate;
    if (updates.additionalDetails !== undefined) updateData.additional_details = updates.additionalDetails;
    if (streamId !== undefined) updateData.stream_id = streamId;
    if (batchId !== undefined) updateData.batch_id = batchId;
    if (updates.status !== undefined) updateData.status = updates.status;

    console.log('Sending update data to Supabase:', updateData);

    const { data, error } = await supabase
      .from('interns')
      .update(updateData)
      .eq('id', internId)
      .select(`
        *,
        streams (id, name),
        batches (id, name)
      `)
      .single();

    if (error) {
      console.error('Error updating intern:', error);
      throw error;
    }

    console.log('Successfully updated intern:', data);

    // Transform data to match UI expectations
    const transformedData = {
      ...data,
      domain: data.streams?.name || '',
      batch: data.batches?.name || '',
      stream_id: data.streams?.id || null,
      batch_id: data.batches?.id || null,
      joinedDate: data.joined_date ? new Date(data.joined_date).toLocaleDateString() : '',
      additionalDetails: data.additional_details || '' // Map database field to UI field
    };

    // Update local state
    setInterns(prev => prev.map(intern => 
      intern.id === internId ? transformedData : intern
    ));
    
    return transformedData;
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
    console.log('=== ADD GLOBAL WEEK FUNCTION CALLED ===');
    console.log('Adding global week with data:', weekData);
    
    try {
      // For now, let's use localStorage directly to bypass database issues
      console.log('Using localStorage approach...');
      
      // Get existing weeks from localStorage
      const existingWeeks = JSON.parse(localStorage.getItem('global_weeks') || '[]');
      console.log('Existing weeks:', existingWeeks);
      
      // Create new week with ID
      const newWeek = {
        id: Date.now(), // Simple ID generation
        name: weekData.name,
        description: weekData.description || '',
        week_number: parseInt(weekData.name.match(/\d+/)?.[0] || '0'),
        created_at: new Date().toISOString()
      };
      
      console.log('New week to add:', newWeek);
      
      // Add to existing weeks and sort
      const updatedWeeks = [...existingWeeks, newWeek].sort((a, b) => a.week_number - b.week_number);
      console.log('Updated weeks array:', updatedWeeks);
      
      // Save to localStorage
      localStorage.setItem('global_weeks', JSON.stringify(updatedWeeks));
      console.log('Saved to localStorage');
      
      // Update local state
      setGlobalWeeks(updatedWeeks);
      console.log('Updated local state');
      
      console.log('Successfully added global week:', newWeek);
      return newWeek;
      
    } catch (error) {
      console.error('=== ERROR IN ADD GLOBAL WEEK ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      throw error;
    }
  };

  const deleteGlobalWeek = async (weekId) => {
    console.log('=== DELETE GLOBAL WEEK ===');
    console.log('Deleting week ID:', weekId);
    
    try {
      // Use localStorage directly
      const existingWeeks = JSON.parse(localStorage.getItem('global_weeks') || '[]');
      console.log('Existing weeks before delete:', existingWeeks);
      
      // Remove the week
      const updatedWeeks = existingWeeks.filter(week => week.id !== weekId);
      console.log('Updated weeks after delete:', updatedWeeks);
      
      // Save to localStorage
      localStorage.setItem('global_weeks', JSON.stringify(updatedWeeks));
      
      // Update local state
      setGlobalWeeks(updatedWeeks);
      
      console.log('Successfully deleted global week from localStorage');
    } catch (error) {
      console.error('Error deleting week:', error);
      throw error;
    }
  };

  // PERFORMANCE EVALUATION FUNCTIONS
  const savePerformanceEvaluation = async (streamName, batchId = 'default', evaluationData) => {
    console.log('=== SAVING PERFORMANCE EVALUATION ===');
    console.log('Stream:', streamName);
    console.log('Batch ID:', batchId);
    console.log('Evaluation Data:', evaluationData);
    
    const newEvaluation = {
      intern_id: evaluationData.internId,
      week: evaluationData.week,
      interest: evaluationData.ratings.interest,
      enthusiasm: evaluationData.ratings.enthusiasm,
      technical_skills: evaluationData.ratings.technicalSkills,
      deadline_adherence: evaluationData.ratings.deadlineAdherence,
      team_collaboration: evaluationData.ratings.teamCollaboration,
      comments: evaluationData.comments
    };

    console.log('New evaluation object:', newEvaluation);

    // Check if evaluation already exists for this intern and week
    const { data: existing } = await supabase
      .from('performance')
      .select('id')
      .eq('intern_id', evaluationData.internId)
      .eq('week', evaluationData.week)
      .single();

    let result;
    if (existing) {
      // Update existing evaluation
      const { data, error } = await supabase
        .from('performance')
        .update(newEvaluation)
        .eq('id', existing.id)
        .select('*')
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
        .select('*')
        .single();

      if (error) {
        console.error('Error saving performance evaluation:', error);
        throw error;
      }
      result = data;

      console.log('Successfully saved new evaluation:', result);

      // Reload all performance evaluations to update the UI
      await loadPerformanceEvaluations();

      // Update local state
      setPerformanceEvaluations(prev => [data, ...prev]);
    }

    console.log('=== EVALUATION SAVE COMPLETE ===');
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
    console.log('=== ADDING PROJECT ===');
    console.log('Batch ID:', batchId);
    console.log('Project Data:', projectData);
    
    const newProject = {
      title: projectData.name,
      description: projectData.description,
      status: projectData.status || 'not_started',
      batch_id: batchId,
      admin_remarks: projectData.adminRemarks || ''
    };

    console.log('New project object:', newProject);

    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      throw error;
    }

    console.log('Project created successfully:', data);

    // If there are assigned interns, add them to project_assignments
    if (projectData.assignedInterns && projectData.assignedInterns.length > 0) {
      console.log('Adding intern assignments:', projectData.assignedInterns);
      
      const assignments = projectData.assignedInterns.map(internId => ({
        project_id: data.id,
        intern_id: parseInt(internId) // Ensure it's an integer if that's what the DB expects
      }));

      console.log('Assignment objects:', assignments);

      const { error: assignmentError } = await supabase
        .from('project_assignments')
        .insert(assignments);

      if (assignmentError) {
        console.error('Error assigning interns to project:', assignmentError);
        // Don't throw here, let the project creation succeed even if assignments fail
      } else {
        console.log('Intern assignments created successfully');
      }
    } else {
      console.log('No interns to assign');
    }

    // Update local state immediately
    setProjects(prev => [data, ...prev]);
    
    // Also reload projects to get updated data with assignments
    await loadProjects();
    return data;
  };

  const updateProject = async (projectId, updates) => {
    // Build update object with only provided fields
    const updateData = {};
    if (updates.name !== undefined) updateData.title = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.adminRemarks !== undefined) updateData.admin_remarks = updates.adminRemarks;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    // Handle intern assignments if provided
    if (updates.assignedInterns !== undefined) {
      // First, delete existing assignments
      await supabase
        .from('project_assignments')
        .delete()
        .eq('project_id', projectId);

      // Then add new assignments
      if (updates.assignedInterns.length > 0) {
        const assignments = updates.assignedInterns.map(internId => ({
          project_id: projectId,
          intern_id: parseInt(internId)
        }));

        const { error: assignmentError } = await supabase
          .from('project_assignments')
          .insert(assignments);

        if (assignmentError) {
          console.error('Error updating project assignments:', assignmentError);
        }
      }
    }

    // Reload projects to get updated data with assignments
    await loadProjects();
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
          status: status
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

  // NEW: Get interns by batch ID (UUID) - CRITICAL FOR BATCH PAGES
  const getInternsByBatchId = async (batchId) => {
    if (!batchId) return [];
    
    const { data, error } = await supabase
      .from('interns')
      .select(`
        *,
        streams (id, name),
        batches (id, name)
      `)
      .eq('batch_id', batchId)
      .eq('status', 'active');
    
    if (error) {
      console.error('Error loading interns by batch ID:', error);
      return [];
    }
    
    // Transform data to match UI expectations
    return (data || []).map(intern => ({
      ...intern,
      domain: intern.streams?.name || '',
      batch: intern.batches?.name || '',
      stream_id: intern.streams?.id || null,
      batch_id: intern.batches?.id || null,
      joinedDate: intern.joined_date ? new Date(intern.joined_date).toLocaleDateString() : '',
      additionalDetails: intern.additional_details || '' // Map database field to UI field
    }));
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
    return projects.filter(project => project.batch_id === batchId);
  };

  const getProjectById = (batchId, projectId) => {
    return projects.find(project => project.id === projectId && project.batch_id === batchId);
  };

  const getPerformanceEvaluations = (streamName, batchId = 'default') => {
    // For now, return all evaluations since we're not storing stream_name and batch_id
    // You can add filtering later if needed
    return performanceEvaluations;
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
    getInternsByBatchId, // NEW: Critical for batch filtering
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