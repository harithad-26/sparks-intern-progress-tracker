import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { useInterns } from '../context/InternContext';
import InternCard from '../components/InternCard';
import './AllInterns.css';

const AllInterns = ({ onViewIntern, searchTerm: globalSearchTerm }) => {
  const { getAllInterns, searchInterns, getAllStreams } = useInterns();
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Use global search term if available, otherwise use local search
  const effectiveSearchTerm = globalSearchTerm || localSearchTerm;
  
  // Get all interns from context
  const allInterns = effectiveSearchTerm ? searchInterns(effectiveSearchTerm) : getAllInterns();

  // Get all available streams (default + custom streams)
  const allStreams = getAllStreams();
  const domains = ['all', ...allStreams];

  const filteredInterns = allInterns.filter(intern => {
    const matchesDomain = selectedDomain === 'all' || intern.domain === selectedDomain;
    return matchesDomain; // Search is already applied in allInterns
  });

  return (
    <div className="all-interns">
      <div className="page-header">
        <h1>All Interns</h1>
        <p>Manage and view all interns across different internship streams</p>
      </div>

      <div className="filters-section">
        <div className="search-filter">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search interns..."
            value={globalSearchTerm || localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="search-input"
            disabled={!!globalSearchTerm}
          />
        </div>

        <div className="domain-filter">
          <Filter size={20} />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="filter-select"
          >
            {domains.map(domain => (
              <option key={domain} value={domain}>
                {domain === 'all' ? 'All Internship Stream' : domain}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-info">
        <span>{filteredInterns.length} interns found</span>
      </div>

      <div className="interns-grid">
        {filteredInterns.map(intern => (
          <InternCard 
            key={intern.id} 
            intern={intern} 
            onViewDetails={onViewIntern}
          />
        ))}
      </div>

      {filteredInterns.length === 0 && (
        <div className="no-results">
          <p>No interns found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default AllInterns;