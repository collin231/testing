import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './EventsManagement.css';

const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    image_url: '',
    date: '',
    end_date: '',
    location: '',
    location_details: '',
    max_participants: '',
    registration_required: false,
    registration_deadline: '',
    status: 'upcoming',
    featured: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url = editingEvent 
        ? `http://localhost:5000/api/admin/events/${editingEvent.id}`
        : 'http://localhost:5000/api/admin/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          created_by: null // Temporarily set to null to bypass foreign key constraint
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (editingEvent) {
          setEvents(events.map(item => item.id === editingEvent.id ? result : item));
          window.showToast('Event updated successfully!', 'success');
        } else {
          setEvents([result, ...events]);
          window.showToast('Event created successfully!', 'success');
        }
        resetForm();
        setShowForm(false);
      } else {
        window.showToast('Failed to save event', 'error');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      window.showToast('Error saving event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (eventItem) => {
    setEditingEvent(eventItem);
    setFormData({
      title: eventItem.title,
      description: eventItem.description || '',
      short_description: eventItem.short_description || '',
      image_url: eventItem.image_url || '',
      date: eventItem.date ? eventItem.date.split('T')[0] : '',
      end_date: eventItem.end_date ? eventItem.end_date.split('T')[0] : '',
      location: eventItem.location || '',
      location_details: eventItem.location_details || '',
      max_participants: eventItem.max_participants || '',
      registration_required: eventItem.registration_required || false,
      registration_deadline: eventItem.registration_deadline ? eventItem.registration_deadline.split('T')[0] : '',
      status: eventItem.status,
      featured: eventItem.featured
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/events/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setEvents(events.filter(item => item.id !== id));
          window.showToast('Event deleted successfully!', 'success');
        } else {
          window.showToast('Failed to delete event', 'error');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
        window.showToast('Error deleting event', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      short_description: '',
      image_url: '',
      date: '',
      end_date: '',
      location: '',
      location_details: '',
      max_participants: '',
      registration_required: false,
      registration_deadline: '',
      status: 'upcoming',
      featured: false
    });
    setEditingEvent(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="events-loading">
        <LoadingSpinner size="large" text="Loading events..." />
      </div>
    );
  }

  return (
    <div className="events-management">
      <div className="events-header">
        <h2>Events Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create New Event
        </button>
      </div>

      {showForm && (
        <div className="events-form-container">
          <div className="events-form">
            <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter event title"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="short_description">Short Description</label>
                  <textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    placeholder="Brief description for listings"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Full Description</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Detailed event description"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Event Date *</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="end_date">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Event location"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="image_url">Image URL</label>
                  <input
                    type="url"
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="max_participants">Max Participants</label>
                  <input
                    type="number"
                    id="max_participants"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({...formData, max_participants: e.target.value})}
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="registration_deadline">Registration Deadline</label>
                  <input
                    type="date"
                    id="registration_deadline"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({...formData, registration_deadline: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.registration_required}
                      onChange={(e) => setFormData({...formData, registration_required: e.target.checked})}
                    />
                    Registration Required
                  </label>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    />
                    Featured Event
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <LoadingSpinner size="small" color="primary" />
                      {editingEvent ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingEvent ? 'Update Event' : 'Create Event'
                  )}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="events-list">
        <h3>All Events ({events.length})</h3>
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events found. Create your first event!</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((eventItem) => (
              <div key={eventItem.id} className="event-card">
                <div className="event-card-header">
                  <div className="event-status">
                    <span className={`status-badge ${eventItem.status}`}>
                      {eventItem.status}
                    </span>
                    {eventItem.featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>
                  <div className="event-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(eventItem)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(eventItem.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="event-card-content">
                  <h4>{eventItem.title}</h4>
                  {eventItem.short_description && (
                    <p className="event-description">{eventItem.short_description}</p>
                  )}
                  <div className="event-details">
                    <div className="event-detail">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">
                        {new Date(eventItem.date).toLocaleDateString()}
                      </span>
                    </div>
                    {eventItem.location && (
                      <div className="event-detail">
                        <span className="detail-label">Location:</span>
                        <span className="detail-value">{eventItem.location}</span>
                      </div>
                    )}
                    {eventItem.max_participants && (
                      <div className="event-detail">
                        <span className="detail-label">Max Participants:</span>
                        <span className="detail-value">{eventItem.max_participants}</span>
                      </div>
                    )}
                  </div>
                  <div className="event-meta">
                    <span className="event-creator">
                      By: {eventItem.users?.full_name || 'Unknown'}
                    </span>
                    <span className="event-date">
                      Created: {new Date(eventItem.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsManagement;
