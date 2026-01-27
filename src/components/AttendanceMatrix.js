/**
 * AttendanceMatrix Component
 * 
 * Features:
 * - Month-Year dropdown (September 2025 - December 2030)
 * - 4 weeks per month (Week 1-4)
 * - Mark attendance section (input)
 * - Save attendance per month
 * - View saved records section (read-only)
 * - Excel export functionality
 * - Supports both Batch and Stream filtering
 * 
 * Data Structure:
 * attendance = {
 *   "Batch1_AppDevelopment": {
 *     "January-2026": {
 *       "INT001": {
 *         week1: "Present",
 *         week2: "Absent",
 *         week3: "Present", 
 *         week4: "Half Day"
 *       }
 *     }
 *   }
 * }
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, Save, Download } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import './AttendanceMatrix.css';

const AttendanceMatrix = ({ batchId, streamName }) => {
  const { getAllInterns, getInternsByBatch, getInternsByStream } = useInterns();
  const [selectedMonthYear, setSelectedMonthYear] = useState('September 2025');
  const [attendanceData, setAttendanceData] = useState({});

  // Get interns filtered by batch or stream
  const getFilteredInterns = () => {
    if (batchId) {
      return getInternsByBatch(`Batch ${batchId}`);
    } else if (streamName) {
      return getInternsByStream(streamName);
    }
    return getAllInterns();
  };

  const interns = getFilteredInterns();
  const allAvailableInterns = getAllInterns(); // Get all interns for export

  // Generate Month-Year dropdown options from September 2025 to December 2030
  const generateMonthYearOptions = () => {
    const options = [];
    const startYear = 2025;
    const startMonth = 8; // September (0-indexed)
    const endYear = 2030;
    const endMonth = 11; // December (0-indexed)

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let year = startYear; year <= endYear; year++) {
      const monthStart = year === startYear ? startMonth : 0;
      const monthEnd = year === endYear ? endMonth : 11;
      
      for (let month = monthStart; month <= monthEnd; month++) {
        options.push(`${monthNames[month]} ${year}`);
      }
    }

    return options;
  };

  const monthYearOptions = generateMonthYearOptions();

  // Generate 4 weeks for the selected month
  const generateWeeksForMonth = () => {
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  };

  const weeks = generateWeeksForMonth();

  const attendanceOptions = [
    { value: '', label: 'Not Set', color: '#d1d5db' },
    { value: 'present', label: 'Present', color: '#10b981' },
    { value: 'absent', label: 'Absent', color: '#ef4444' },
    { value: 'half-day', label: 'Half Day', color: '#f59e0b' }
  ];

  // Get context key for data storage
  const getContextKey = () => {
    if (batchId) return `Batch${batchId}`;
    if (streamName) return streamName.replace(/\s+/g, '');
    return 'All';
  };

  // Get attendance key for specific intern and week
  const getAttendanceKey = (internId, week) => `${internId}_${week.replace(' ', '')}`;

  // Handle attendance change
  const handleAttendanceChange = (internId, week, status) => {
    const key = getAttendanceKey(internId, week);
    setAttendanceData(prev => ({
      ...prev,
      [key]: status
    }));
  };

  // Get attendance status for intern and week
  const getAttendanceStatus = (internId, week) => {
    const key = getAttendanceKey(internId, week);
    return attendanceData[key] || '';
  };

  // Get status color
  const getStatusColor = (status) => {
    const option = attendanceOptions.find(opt => opt.value === status);
    return option ? option.color : '#d1d5db';
  };

  // Save attendance data
  const handleSaveAttendance = () => {
    const contextKey = getContextKey();
    const monthKey = selectedMonthYear.replace(' ', '-');
    
    // Transform attendance data to the specified format
    const transformedData = {};
    interns.forEach(intern => {
      transformedData[intern.id] = {};
      weeks.forEach((week, index) => {
        const weekKey = `week${index + 1}`;
        const attendanceKey = getAttendanceKey(intern.id, week);
        transformedData[intern.id][weekKey] = attendanceData[attendanceKey] || '';
      });
    });

    // Save to localStorage with the new structure
    const storageKey = `attendance_${contextKey}_${monthKey}`;
    const dataToSave = {
      ...transformedData,
      savedAt: new Date().toISOString(),
      context: contextKey,
      monthYear: selectedMonthYear
    };

    localStorage.setItem(storageKey, JSON.stringify(dataToSave));

    alert(`Attendance for ${selectedMonthYear} saved successfully!`);
  };

  // Load saved attendance data
  const loadAttendanceData = () => {
    const contextKey = getContextKey();
    const monthKey = selectedMonthYear.replace(' ', '-');
    const storageKey = `attendance_${contextKey}_${monthKey}`;
    
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // Transform back to component format
      const transformedData = {};
      Object.keys(parsedData).forEach(internId => {
        if (internId !== 'savedAt' && internId !== 'context' && internId !== 'monthYear') {
          const internData = parsedData[internId];
          weeks.forEach((week, index) => {
            const weekKey = `week${index + 1}`;
            const attendanceKey = getAttendanceKey(internId, week);
            if (internData[weekKey]) {
              transformedData[attendanceKey] = internData[weekKey];
            }
          });
        }
      });
      
      setAttendanceData(transformedData);
    } else {
      setAttendanceData({});
    }
  };

  // Load data when month changes
  useEffect(() => {
    loadAttendanceData();
  }, [selectedMonthYear]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="attendance-matrix-container">
      {/* Month-Year Selector */}
      <div className="attendance-header">
        <div className="month-selector">
          <select 
            value={selectedMonthYear}
            onChange={(e) => setSelectedMonthYear(e.target.value)}
            className="month-dropdown"
          >
            {monthYearOptions.map(monthYear => (
              <option key={monthYear} value={monthYear}>{monthYear}</option>
            ))}
          </select>
          <ChevronDown size={16} className="dropdown-icon" />
        </div>
        
        <div className="header-actions">
          <button 
            className="btn btn-secondary export-btn"
            onClick={() => {
              const contextKey = getContextKey();
              
              // Debug: Check what's in localStorage
              console.log('=== DEBUGGING EXPORT ===');
              console.log('Current context key:', contextKey);
              console.log('Available interns:', allAvailableInterns);
              console.log('Current attendance data:', attendanceData);
              
              // First, save current month's data if it has any attendance marked
              const hasCurrentData = Object.keys(attendanceData).some(key => attendanceData[key]);
              console.log('Has current data to save:', hasCurrentData);
              
              if (hasCurrentData) {
                const monthKey = selectedMonthYear.replace(' ', '-');
                const transformedData = {};
                interns.forEach(intern => {
                  transformedData[intern.id] = {};
                  weeks.forEach((week, index) => {
                    const weekKey = `week${index + 1}`;
                    const attendanceKey = getAttendanceKey(intern.id, week);
                    transformedData[intern.id][weekKey] = attendanceData[attendanceKey] || '';
                  });
                });

                const storageKey = `attendance_${contextKey}_${monthKey}`;
                const dataToSave = {
                  ...transformedData,
                  savedAt: new Date().toISOString(),
                  context: contextKey,
                  monthYear: selectedMonthYear
                };
                localStorage.setItem(storageKey, JSON.stringify(dataToSave));
                console.log('Saved current data to:', storageKey, dataToSave);
              }
              
              // Debug: List all localStorage keys
              console.log('All localStorage keys:');
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                console.log(`  ${i}: ${key}`);
                if (key && key.startsWith('attendance_')) {
                  const data = localStorage.getItem(key);
                  console.log(`    Data:`, JSON.parse(data));
                }
              }
              
              // Collect ALL saved attendance records from localStorage (all contexts)
              const allRecords = {};
              
              // Scan localStorage for ALL attendance records
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('attendance_')) {
                  const data = localStorage.getItem(key);
                  if (data) {
                    try {
                      const parsedData = JSON.parse(data);
                      // Extract context and month from key
                      const keyParts = key.replace('attendance_', '').split('_');
                      const context = keyParts[0];
                      const monthKey = keyParts.slice(1).join('_').replace('-', ' ');
                      
                      if (!allRecords[context]) {
                        allRecords[context] = {};
                      }
                      allRecords[context][monthKey] = parsedData;
                    } catch (e) {
                      console.warn('Failed to parse attendance data:', key);
                    }
                  }
                }
              }
              
              console.log('All records collected:', allRecords);
              
              // Check if there's any data to export
              if (Object.keys(allRecords).length === 0) {
                alert('No attendance data found to export. Please mark some attendance and save it first.');
                return;
              }
              
              // Create CSV content with the required structure
              let csvContent = '';
              const exportDate = new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
              }); // DD/MM/YYYY format
              
              // Process each context (Batch/Stream)
              Object.entries(allRecords).forEach(([context, months]) => {
                console.log('Processing context:', context, 'with months:', Object.keys(months));
                
                // Sort months chronologically
                const sortedMonths = Object.keys(months).sort((a, b) => {
                  const dateA = new Date(a);
                  const dateB = new Date(b);
                  return dateA - dateB;
                });
                
                sortedMonths.forEach((monthYear) => {
                  const record = months[monthYear];
                  
                  // Add blank line between months (except for first month)
                  if (csvContent.length > 0) {
                    csvContent += '\n';
                  }
                  
                  // Add month header
                  csvContent += `${monthYear} – ${context}\n`;
                  csvContent += 'Date,Batch/Stream,Intern Name,Week 1,Week 2,Week 3,Week 4\n';
                  
                  // Get intern entries (exclude metadata)
                  const internEntries = Object.entries(record).filter(([key]) => 
                    key !== 'savedAt' && key !== 'context' && key !== 'monthYear'
                  );
                  
                  console.log('Processing month:', monthYear, 'Context:', context);
                  console.log('Intern entries found:', internEntries.length);
                  console.log('Record data:', record);
                  
                  if (internEntries.length === 0) {
                    // If no saved data, show message
                    csvContent += `${exportDate},${context},"No attendance data recorded",NA,NA,NA,NA\n`;
                  } else {
                    // Add attendance data for each intern
                    internEntries.forEach(([internId, data]) => {
                      // Find intern from all available interns using proper ID matching
                      const intern = allAvailableInterns.find(i => i.id.toString() === internId.toString());
                      
                      console.log('Processing intern ID:', internId, 'Found intern:', intern);
                      console.log('Intern data:', data);
                      
                      let internName = 'Unknown Intern';
                      if (intern) {
                        internName = intern.name;
                      } else {
                        // Try to find by ID as number
                        const internById = allAvailableInterns.find(i => i.id === parseInt(internId));
                        if (internById) {
                          internName = internById.name;
                        } else {
                          internName = `Intern ID: ${internId}`;
                        }
                      }
                      
                      // Format status values - P/A/NA as requested
                      const formatStatus = (status) => {
                        switch(status) {
                          case 'present': return 'P';
                          case 'absent': return 'A';
                          case 'half-day': return 'P'; // Convert half-day to Present
                          case '': return 'NA'; // Not marked
                          default: return 'NA';
                        }
                      };
                      
                      csvContent += `${exportDate},${context},"${internName}",`;
                      csvContent += `${formatStatus(data.week1)},`;
                      csvContent += `${formatStatus(data.week2)},`;
                      csvContent += `${formatStatus(data.week3)},`;
                      csvContent += `${formatStatus(data.week4)}\n`;
                    });
                  }
                });
              });

              console.log('Final CSV Content:', csvContent);

              // Create and download file
              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              const url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              
              const currentDate = new Date().toISOString().split('T')[0];
              const filename = `Attendance_All_Records_${currentDate}.csv`;
              link.setAttribute('download', filename);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              // Show success message
              const totalContexts = Object.keys(allRecords).length;
              const totalMonths = Object.values(allRecords).reduce((sum, months) => sum + Object.keys(months).length, 0);
              alert(`Successfully exported attendance data for ${totalContexts} batch/stream(s) across ${totalMonths} month(s) as ${filename}`);
            }}
          >
            <Download size={16} />
            Export Attendance
          </button>
        </div>
      </div>

      {/* Mark Attendance Section */}
      <div className="attendance-section">
        <h3 className="section-title">Mark Attendance - {selectedMonthYear}</h3>
        
        <div className="attendance-matrix-card">
          <div className="matrix-container">
            <div className="matrix-scroll">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th className="intern-name-header sticky-column">Intern Name</th>
                    {weeks.map(week => (
                      <th key={week} className="week-header">{week}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {interns.map(intern => (
                    <tr key={intern.id} className="intern-row">
                      <td className="intern-name-cell sticky-column">
                        {intern.name}
                      </td>
                      {weeks.map(week => (
                        <td key={week} className="attendance-cell">
                          <div className="attendance-selector">
                            <div 
                              className="status-indicator"
                              style={{ backgroundColor: getStatusColor(getAttendanceStatus(intern.id, week)) }}
                            />
                            <select
                              value={getAttendanceStatus(intern.id, week)}
                              onChange={(e) => handleAttendanceChange(intern.id, week, e.target.value)}
                              className="attendance-dropdown"
                            >
                              {attendanceOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="matrix-footer">
            <div className="footer-left">
              <div className="legend">
                <span className="legend-title">Legend:</span>
                {attendanceOptions.slice(1).map(option => (
                  <div key={option.value} className="legend-item">
                    <div 
                      className="legend-dot"
                      style={{ backgroundColor: option.color }}
                    />
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="footer-actions">
              <span className="save-note">Attendance is saved per month</span>
              <button 
                className="btn btn-primary save-btn"
                onClick={handleSaveAttendance}
              >
                <Save size={16} />
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMatrix;