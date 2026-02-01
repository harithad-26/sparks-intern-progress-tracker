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

const AppContent = ({ onLogout, user }) => {
  const { updateIntern, deleteIntern, addCustomStream } = useInterns();
  const [showAddInternModal, setShowAddInternModal] = useState(false);
  const [showAddStreamModal, setShowAddStreamModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showInternDetails, setShowInternDetails] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  const handleLogout = async () => {
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
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Call the parent logout function
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

  const handleUpdateIntern = async (updatedIntern) => {
    try {
      // Map the form fields to the expected format for updateIntern
      const updates = {
        name: updatedIntern.name,
        email: updatedIntern.email,
        phone: updatedIntern.phone,
        college: updatedIntern.college,
        domain: updatedIntern.domain,
        batch: updatedIntern.batch,
        academicYear: updatedIntern.academicYear,
        status: updatedIntern.status,
        additionalDetails: updatedIntern.additionalDetails // This was missing!
      };
      
      await updateIntern(updatedIntern.id, updates);
      setSelectedIntern(updatedIntern); // Update the selected intern to reflect changes
    } catch (error) {
      console.error('Error in handleUpdateIntern:', error);
      throw error; // Re-throw so the modal can handle it
    }
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
          user={user}
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        setUser(session.user);
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setIsAuthenticated(true);
          setUser(session.user);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <InternProvider>
      <Router>
        <AppContent onLogout={handleLogout} user={user} />
      </Router>
    </InternProvider>
  );
}

export default App;