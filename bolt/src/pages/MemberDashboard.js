import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MembershipCard from '../components/MembershipCard';
import './MemberDashboard.css';

const MemberDashboard = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, profile, logout, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    user: null,
    membership: null,
    upcomingEvents: [],
    recentNews: [],
    eventRegistrations: [],
    userActivities: [],
    stats: {
      eventsAttended: 0,
      upcomingEvents: 0,
      newsRead: 0,
      pointsEarned: 0
    }
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    console.log('🔐 isAuthenticated:', isAuthenticated);
    console.log('👤 user:', user ? 'Present' : 'Not present');
    console.log('📋 profile:', profile ? 'Present' : 'Not present');
    console.log('🆔 sessionId:', sessionId);
    
    // Check if user is authenticated
    if (isAuthenticated && user && profile) {
      console.log('✅ User authenticated, fetching dashboard data...');
      fetchDashboardData();
    } else {
      console.log('❌ User not authenticated, trying to fetch user data...');
      // Try to fetch user data from API
      fetchUserData();
    }
  }, [isAuthenticated, user, profile, sessionId]);

  const fetchUserData = async () => {
    try {
      console.log('🔍 Fetching user data...');
      const storedSession = localStorage.getItem('session');
      console.log('📱 Stored session in fetchUserData:', storedSession ? 'Found' : 'Not found');
      
      if (!storedSession) {
        setError('No active session found');
        setIsLoading(false);
        return;
      }

      const session = JSON.parse(storedSession);
      console.log('🔑 Session parsed in fetchUserData:', session ? 'Success' : 'Failed');
      
      const response = await fetch('http://localhost:5000/api/user', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('📡 User API Response status:', response.status);
      console.log('📡 User API Response ok:', response.ok);

      if (response.ok) {
        // Data will be updated through the auth context
        console.log('✅ User data fetched successfully');
        setIsLoading(false);
      } else {
        const errorText = await response.text();
        console.error('❌ User API Error response:', errorText);
        setError('Failed to fetch user data');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('💥 Error fetching user data:', error);
      setError('Failed to fetch user data');
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 Fetching dashboard data...');
      const storedSession = localStorage.getItem('session');
      console.log('📱 Stored session:', storedSession ? 'Found' : 'Not found');
      
      if (!storedSession) {
        setError('No active session found');
        setIsLoading(false);
        return;
      }

      const session = JSON.parse(storedSession);
      console.log('🔑 Session parsed:', session ? 'Success' : 'Failed');
      console.log('🎫 Access token:', session.access_token ? 'Present' : 'Missing');
      
      const response = await fetch('http://localhost:5000/api/member/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response ok:', response.ok);

      if (response.ok) {
        const responseData = await response.json();
        console.log('📊 Raw API data received:', responseData);
        
        // Ensure stats object is always defined with default values
        const safeData = {
          ...responseData,
          stats: {
            eventsAttended: responseData.stats?.eventsAttended || 0,
            upcomingEvents: responseData.stats?.upcomingEvents || 0,
            newsRead: responseData.stats?.newsRead || 0,
            pointsEarned: responseData.stats?.pointsEarned || 0
          }
        };
        console.log('🛡️ Safe data prepared:', safeData);
        setDashboardData(safeData);
        setIsLoading(false);
      } else {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        setError('Failed to fetch dashboard data');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data');
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST'
      });
      
      // Use the auth context to logout
      logout();
      
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      logout();
      navigate('/');
    }
  };

  const handleEventRegistration = async (eventId, eventTitle) => {
    try {
      const storedSession = localStorage.getItem('session');
      if (!storedSession) {
        setError('No active session found');
        return;
      }

      const session = JSON.parse(storedSession);
      const response = await fetch(`http://localhost:5000/api/member/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ eventTitle })
      });

      if (response.ok) {
        // Refresh dashboard data to show updated registrations
        fetchDashboardData();
        window.showToast('Successfully registered for event!', 'success');
      } else {
        const errorData = await response.json();
        window.showToast(errorData.error || 'Failed to register for event', 'error');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      window.showToast('Failed to register for event', 'error');
    }
  };

  const logActivity = async (activityType, details = {}) => {
    try {
      const storedSession = localStorage.getItem('session');
      if (!storedSession) return;

      const session = JSON.parse(storedSession);
      await fetch('http://localhost:5000/api/member/activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ activityType, details })
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading your dashboard..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !isAuthenticated || !user || !profile) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-container">
            <h2>Access Denied</h2>
            <p>{error || 'You need to be logged in to access this page.'}</p>
            <button onClick={() => navigate('/login')} className="btn btn-primary">
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure profile is defined before proceeding
  if (!profile) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-container">
            <LoadingSpinner size="large" text="Loading profile data..." />
          </div>
        </div>
      </div>
    );
  }

  const { 
    membership = null, 
    upcomingEvents = [], 
    recentNews = [], 
    eventRegistrations = [], 
    userActivities = [], 
    stats = {
      eventsAttended: 0,
      upcomingEvents: 0,
      newsRead: 0,
      pointsEarned: 0
    }
  } = dashboardData || {};

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Welcome, {profile?.full_name || 'Member'}!</h1>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="btn btn-outline">
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'membership' ? 'active' : ''}`}
            onClick={() => setActiveTab('membership')}
          >
            Membership
          </button>
          <button 
            className={`tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`tab ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            News Feed
          </button>
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                {/* Digital Membership Card */}
                <MembershipCard user={profile} membership={membership} />

                {/* Quick Stats */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                      <h3>Events Attended</h3>
                      <p>{stats?.eventsAttended || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                      <h3>Upcoming Events</h3>
                      <p>{stats?.upcomingEvents || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📰</div>
                    <div className="stat-content">
                      <h3>News Read</h3>
                      <p>{stats?.newsRead || 0}</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-content">
                      <h3>Points Earned</h3>
                      <p>{stats?.pointsEarned || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {(userActivities || []).slice(0, 3).map((activity) => (
                      <div key={activity.id} className="activity-item">
                        <div className="activity-icon">
                          {activity.activity_type === 'event_registration' && '🎉'}
                          {activity.activity_type === 'profile_update' && '📱'}
                          {activity.activity_type === 'news_view' && '📰'}
                          {activity.activity_type === 'login' && '🔐'}
                          {activity.activity_type === 'payment' && '💳'}
                        </div>
                        <div className="activity-content">
                          <h4>{activity.activity_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                          <p>{activity.details?.message || 'Activity recorded'}</p>
                          <span className="activity-time">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!userActivities || userActivities.length === 0) && (
                      <p className="no-activity">No recent activity</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'membership' && (
            <div className="membership-tab">
              <div className="membership-details">
                <h3>Membership Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Member ID:</span>
                    <span className="value">{profile?.member_id || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Full Name:</span>
                    <span className="value">{profile?.full_name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{profile?.email || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Membership Status:</span>
                    <span className={`value status ${profile?.membership_status || 'active'}`}>
                      {profile?.membership_status || 'Active'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Membership Type:</span>
                    <span className="value">{membership?.membership_type || 'Standard'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Join Date:</span>
                    <span className="value">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  {membership && (
                    <>
                      <div className="info-item">
                        <span className="label">Payment Status:</span>
                        <span className={`value status ${membership.payment_status}`}>
                          {membership.payment_status}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Amount:</span>
                        <span className="value">{membership.currency} {membership.amount}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Payment Date:</span>
                        <span className="value">
                          {membership.payment_date ? new Date(membership.payment_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="events-tab">
              <h3>Events</h3>
              
              {/* Upcoming Events */}
              <div className="events-section">
                <h4>Upcoming Events</h4>
                {(upcomingEvents && upcomingEvents.length > 0) ? (
                  <div className="events-grid">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="event-card">
                        <div className="event-header">
                          <h5>{event.title}</h5>
                          <span className={`event-status ${event.status}`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="event-content">
                          {event.short_description && (
                            <p className="event-description">{event.short_description}</p>
                          )}
                          <div className="event-details">
                            <div className="event-detail">
                              <span className="detail-label">Date:</span>
                              <span className="detail-value">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </div>
                            {event.location && (
                              <div className="event-detail">
                                <span className="detail-label">Location:</span>
                                <span className="detail-value">{event.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="event-actions">
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleEventRegistration(event.id, event.title)}
                          >
                            Register
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-events">No upcoming events</p>
                )}
              </div>

              {/* My Event Registrations */}
              <div className="events-section">
                <h4>My Event Registrations</h4>
                {(eventRegistrations && eventRegistrations.length > 0) ? (
                  <div className="registrations-list">
                    {eventRegistrations.map((registration) => (
                      <div key={registration.id} className="registration-item">
                        <div className="registration-content">
                          <h5>{registration.events?.title || 'Event'}</h5>
                          <p>Status: <span className={`status ${registration.status}`}>{registration.status}</span></p>
                          <p>Registered: {new Date(registration.registration_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-registrations">No event registrations yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="news-tab">
              <h3>News Feed</h3>
              {(recentNews && recentNews.length > 0) ? (
                <div className="news-grid">
                  {recentNews.map((article) => (
                    <div 
                      key={article.id} 
                      className="news-card"
                      onClick={() => logActivity('news_view', { news_id: article.id, news_title: article.title })}
                    >
                      <div className="news-header">
                        <h4>{article.title}</h4>
                        <span className={`news-status ${article.status}`}>
                          {article.status}
                        </span>
                      </div>
                      {article.excerpt && (
                        <p className="news-excerpt">{article.excerpt}</p>
                      )}
                      <div className="news-meta">
                        <span className="news-date">
                          {new Date(article.published_at || article.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-news">No news articles available</p>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-tab">
              <h3>Profile Information</h3>
              <div className="profile-grid">
                <div className="profile-section">
                  <h4>Personal Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Full Name:</span>
                      <span className="value">{profile?.full_name || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Email:</span>
                      <span className="value">{profile?.email || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Phone:</span>
                      <span className="value">{profile?.phone || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Date of Birth:</span>
                      <span className="value">
                        {profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Address Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Address:</span>
                      <span className="value">{profile?.address || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">City:</span>
                      <span className="value">{profile?.city || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Province:</span>
                      <span className="value">{profile?.province || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Postal Code:</span>
                      <span className="value">{profile?.postal_code || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Additional Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Occupation:</span>
                      <span className="value">{profile?.occupation || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Education Level:</span>
                      <span className="value">{profile?.education_level || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Contact Preference:</span>
                      <span className="value">{profile?.contact_preference || 'Not provided'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Member Since:</span>
                      <span className="value">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Not provided'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
