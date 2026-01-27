import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { InternProvider, useInterns } from './context/InternContext';
import { supabase } from './lib/supabase';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import AllInterns from './pages/AllInterns';
import StreamDetail from './pages/StreamDetail';
import BatchDetail from './pages/BatchDetail';
import Settings from './pages/Settings';
import Batches from './pages/Batches';
import ArchivedItems from './pages/ArchivedItems';

import AddInternModal from './components/AddInternModal';
import AddStreamModal from './components/AddStreamModal';
import InternDetailsPanel from './components/InternDetailsPanel';
import './App.css';

const AppContent = ({ onLogout }) => {
  const { updateIntern, deleteIntern, addCustomStream } = useInterns();
  const [showAddInternModal, setShowAddInternModal] = useState(false);
  const [showAddStreamModal, setShowAddStreamModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showInternDetails, setShowInternDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
      // Reset all local state
      setShowAddInternModal(false);
      setShowAddStreamModal(false);
      setSelectedIntern(null);
      setShowInternDetails(false);
      setSidebarOpen(false);
      setSearchTerm('');
      
      // Clear any localStorage data if needed
      // localStorage.clear(); // Uncomment if you want to clear all stored data
      
      // Call the parent logout function to set isAuthenticated to false
      onLogout();
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddStream = (newStream) => {
    // Add the new stream to the context
    const result = addCustomStream(newStream);
    if (result) {
      console.log('New stream added:', newStream);
    } else {
      alert(`Stream "${newStream.name}" already exists!`);
    }
  };

  const handleUpdateIntern = (updatedIntern) => {
    updateIntern(updatedIntern.id, updatedIntern);
    setSelectedIntern(updatedIntern); // Update the selected intern to reflect changes
  };

  const handleDeleteIntern = (internId) => {
    deleteIntern(internId);
    setSelectedIntern(null);
    setShowInternDetails(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const getCurrentStream = () => {
    const path = location.pathname;
    if (path.startsWith('/stream/')) {
      return path.split('/stream/')[1];
    }
    return null;
  };

  return (
    <div className="app">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onAddStream={() => setShowAddStreamModal(true)}
      />
      <div className="main-content">
        <TopBar 
          onAddIntern={() => setShowAddInternModal(true)}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
          onSearch={handleSearch}
          searchTerm={searchTerm}
        />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Dashboard 
              onViewIntern={(intern) => {
                setSelectedIntern(intern);
                setShowInternDetails(true);
              }}
              searchTerm={searchTerm}
            />} />
            <Route path="/interns" element={<AllInterns 
              onViewIntern={(intern) => {
                setSelectedIntern(intern);
                setShowInternDetails(true);
              }}
              searchTerm={searchTerm}
            />} />
            <Route path="/stream/:domain" element={<StreamDetail />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/batch/:batchId" element={<BatchDetail />} />
            <Route path="/archived" element={<ArchivedItems />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>

      
      {showAddInternModal && (
        <AddInternModal 
          onClose={() => setShowAddInternModal(false)}
          currentDomain={getCurrentStream()}
        />
      )}
      
      {showAddStreamModal && (
        <AddStreamModal 
          onClose={() => setShowAddStreamModal(false)}
          onAddStream={handleAddStream}
        />
      )}
      
      {showInternDetails && selectedIntern && (
        <InternDetailsPanel 
          intern={selectedIntern} 
          onClose={() => setShowInternDetails(false)}
          onUpdateIntern={handleUpdateIntern}
          onDeleteIntern={handleDeleteIntern}
        />
      )}
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const test = async () => {
      const { data, error } = await supabase.from('test').select('*')
      console.log('Supabase connection test:', data, error)
    }
    test()
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <InternProvider>
      <Router>
        <AppContent onLogout={handleLogout} />
      </Router>
    </InternProvider>
  );
}

export default App;