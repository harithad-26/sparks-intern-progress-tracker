import React, { useState } from 'react';
import { Lock, User, Save } from 'lucide-react';
import WeekManagement from '../components/WeekManagement';
import './Settings.css';

const Settings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'Administrator'
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    // Handle password change logic here
    console.log('Password change requested');
    alert('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    // Handle profile update logic here
    console.log('Profile update requested');
    alert('Profile updated successfully!');
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="section-header">
            <User size={20} />
            <h2>Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                type="text"
                name="role"
                value={profileData.role}
                className="form-input"
                disabled
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              Update Profile
            </button>
          </form>
        </div>

        <div className="settings-section">
          <div className="section-header">
            <Lock size={20} />
            <h2>Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              <Lock size={16} />
              Change Password
            </button>
          </form>
        </div>

        <div className="settings-section">
          <WeekManagement />
        </div>
      </div>
    </div>
  );
};

export default Settings;