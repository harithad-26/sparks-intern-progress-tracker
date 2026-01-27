import React from 'react';
import { useInterns } from '../context/InternContext';
import SummaryCards from '../components/SummaryCards';
import InternCard from '../components/InternCard';
import './Dashboard.css';

const Dashboard = ({ onViewIntern, searchTerm }) => {
  const { getAllInterns, searchInterns } = useInterns();

  // Get interns safely (avoid mutating original array)
  const allInterns = searchTerm
    ? [...searchInterns(searchTerm)]
    : [...getAllInterns()];

  const recentInterns = allInterns
    .sort((a, b) => new Date(b.joinedDate) - new Date(a.joinedDate))
    .slice(0, searchTerm ? allInterns.length : 6);



  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with your intern management system.</p>
      </div>

      <SummaryCards />



      <div className="dashboard-section">
        <div className="section-header">
          <h2>
            {searchTerm
              ? `Search Results (${recentInterns.length})`
              : 'Recent Interns'}
          </h2>
          {!searchTerm && (
            <button className="btn btn-secondary">View All</button>
          )}
        </div>

        <div className="interns-grid">
          {recentInterns.map((intern) => (
            <InternCard
              key={intern.id}
              intern={intern}
              onViewDetails={onViewIntern}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
