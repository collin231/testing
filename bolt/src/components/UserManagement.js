import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Users data received:', data);
      console.log('Sample user:', data[0]);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setUsers(data);
        if (data.length > 0) {
          window.showToast(`Loaded ${data.length} users successfully`, 'success');
        }
      } else {
        console.error('Expected array but got:', typeof data, data);
        setUsers([]);
        window.showToast('Error: Invalid data format received', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]); // Set empty array on error
      window.showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!userId) {
      console.error('No user ID provided for status change');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUsers(Array.isArray(users) ? users.map(user => 
          user?.id === userId 
            ? { ...user, membership_status: newStatus }
            : user
        ) : []);
        window.showToast(`User status updated to ${newStatus}`, 'success');
      } else {
        window.showToast('Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      window.showToast('Error updating user status', 'error');
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!user || typeof user !== 'object') return false;
    
    const searchLower = (searchTerm || '').toLowerCase();
    const statusLower = (statusFilter || 'all').toLowerCase();
    
    const matchesSearch = user.full_name?.toLowerCase().includes(searchLower) ||
                         user.email?.toLowerCase().includes(searchLower) ||
                         user.member_id?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusLower === 'all' || user?.membership_status?.toLowerCase() === statusLower;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadgeClass = (status) => {
    if (!status || typeof status !== 'string') return 'status-unknown';
    
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'suspended': return 'status-suspended';
      default: return 'status-unknown';
    }
  };

  const getMembershipInfo = (user) => {
    // Safety check for user object
    if (!user || typeof user !== 'object') {
      return { type: 'No Membership', amount: 0, currency: 'MZN' };
    }
    
    // Check if user has direct membership info from backend
    if (user.membership_type && user.membership_amount) {
      return { 
        type: user.membership_type, 
        amount: user.membership_amount, 
        currency: user.membership_currency || 'MZN' 
      };
    }
    
    // Fallback to checking memberships array
    if (!Array.isArray(user.memberships) || user.memberships.length === 0) {
      return { type: 'No Membership', amount: 0, currency: 'MZN' };
    }
    
    const latestMembership = Array.isArray(user.memberships) && user.memberships.length > 0 ? user.memberships[0] : null;
    if (!latestMembership) {
      return { type: 'No Membership', amount: 0, currency: 'MZN' };
    }
    return {
      type: latestMembership.membership_type || 'Unknown',
      amount: latestMembership.amount || 0,
      currency: latestMembership.currency || 'MZN'
    };
  };

  if (loading) {
    return (
      <div className="users-loading">
        <LoadingSpinner size="large" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="users-header">
        <h2>User Management</h2>
        <div className="users-stats">
          <span className="stat-item">
            <strong>Total Users:</strong> {Array.isArray(users) ? users.length : 0}
          </span>
          <span className="stat-item">
            <strong>Active:</strong> {Array.isArray(users) ? users.filter(u => u && typeof u === 'object' && u?.membership_status === 'active').length : 0}
          </span>
          <span className="stat-item">
            <strong>Inactive:</strong> {Array.isArray(users) ? users.filter(u => u && typeof u === 'object' && u?.membership_status === 'inactive').length : 0}
          </span>
        </div>
      </div>

      <div className="users-controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by name, email, or member ID..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value || '')}
            className="search-input"
          />
        </div>
        <div className="status-filter">
          <select
            value={statusFilter || 'all'}
            onChange={(e) => setStatusFilter(e.target.value || 'all')}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        {!Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div className="header-cell">Member Info</div>
              <div className="header-cell">Contact</div>
              <div className="header-cell">Membership</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>
            
            {Array.isArray(filteredUsers) && filteredUsers.map((user) => {
              // Safety check for user object
              if (!user || typeof user !== 'object') {
                return null;
              }
              
              const membershipInfo = getMembershipInfo(user);
              return (
                <div key={user.id || Math.random()} className="table-row">
                  <div className="table-cell member-info">
                    <div className="member-photo">
                      {user?.profile_picture_url ? (
                        <img src={user.profile_picture_url} alt={user?.full_name || 'User'} />
                      ) : (
                        <div className="photo-placeholder">
                          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="member-details">
                      <h4>{user?.full_name || 'Unknown Name'}</h4>
                      <p className="member-id">ID: {user?.member_id || 'N/A'}</p>
                      <p className="join-date">
                        Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="table-cell contact-info">
                    <p className="email">{user?.email || 'No email'}</p>
                    {user?.phone && <p className="phone">{user.phone}</p>}
                    {user?.city && user?.province && <p className="location">{user.city}, {user.province}</p>}
                  </div>
                  
                  <div className="table-cell membership-info">
                    <p className="membership-type">{membershipInfo.type}</p>
                    <p className="membership-amount">
                      {membershipInfo.amount > 0 
                        ? `${membershipInfo.currency} ${membershipInfo.amount}`
                        : 'No payment'
                      }
                    </p>
                  </div>
                  
                  <div className="table-cell status-cell">
                    <span className={`status-badge ${getStatusBadgeClass(user?.membership_status)}`}>
                      {user?.membership_status || 'unknown'}
                    </span>
                  </div>
                  
                  <div className="table-cell actions">
                    <select
                      value={user?.membership_status || 'unknown'}
                      onChange={(e) => handleStatusChange(user?.id, e.target.value || 'unknown')}
                      className="status-select"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
