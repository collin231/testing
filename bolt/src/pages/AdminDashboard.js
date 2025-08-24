import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import NewsManagement from '../components/NewsManagement';
import EventsManagement from '../components/EventsManagement';
import UserManagement from '../components/UserManagement';
import LoadingSpinner from '../components/LoadingSpinner';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalNews: 0,
    upcomingEvents: 0,
    totalRevenue: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const { adminUser, logout } = useAdminAuth();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/stats');
      const data = await response.json();
      console.log('Admin stats received:', data);
      setStats(data);
      window.showToast('Dashboard stats loaded successfully', 'success');
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      window.showToast('Failed to load dashboard stats', 'error');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-container">
        <div className="admin-header">
          <div className="admin-header-content">
            <h1>Admin Dashboard</h1>
            <div className="admin-user-info">
              <span>Welcome, {adminUser?.full_name || 'Admin'}</span>
              <button onClick={handleLogout} className="logout-button">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="admin-sidebar">
          <nav className="admin-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              News Management
            </button>
            <button
              className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              Events Management
            </button>
            <button
              className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
          </nav>
        </div>

        <div className="admin-main-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <h2>Dashboard Overview</h2>
              {statsLoading ? (
                <div className="overview-loading">
                  <LoadingSpinner size="large" text="Loading dashboard statistics..." />
                </div>
              ) : (
                <div className="overview-stats">
                  <div className="stat-card">
                    <h3>Total Members</h3>
                    <p className="stat-number">{stats.totalMembers}</p>
                  </div>
                  <div className="stat-card">
                    <h3>News Articles</h3>
                    <p className="stat-number">{stats.totalNews}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Upcoming Events</h3>
                    <p className="stat-number">{stats.upcomingEvents}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Revenue</h3>
                    <p className="stat-number">MZN {stats.totalRevenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'news' && (
            <div className="news-tab">
              <NewsManagement />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="events-tab">
              <EventsManagement />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <UserManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
