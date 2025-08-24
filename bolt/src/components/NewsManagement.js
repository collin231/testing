import React, { useState, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';
import './NewsManagement.css';

const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    status: 'draft',
    featured: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/news');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting news form with data:', formData);
    
    try {
      setSubmitting(true);
      const url = editingNews 
        ? `http://localhost:5000/api/admin/news/${editingNews.id}`
        : 'http://localhost:5000/api/admin/news';
      
      const method = editingNews ? 'PUT' : 'POST';
      
      console.log('Making request to:', url, 'with method:', method);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          author_id: null // Temporarily set to null to bypass foreign key constraint
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result);
        if (editingNews) {
          setNews(news.map(item => item.id === editingNews.id ? result : item));
          window.showToast('News article updated successfully!', 'success');
        } else {
          setNews([result, ...news]);
          window.showToast('News article created successfully!', 'success');
        }
        resetForm();
        setShowForm(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', errorData);
        window.showToast(`Failed to ${editingNews ? 'update' : 'create'} news article: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error saving news:', error);
      window.showToast(`Error: ${error.message || 'Failed to save news article'}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      excerpt: newsItem.excerpt || '',
      image_url: newsItem.image_url || '',
      status: newsItem.status,
      featured: newsItem.featured
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/news/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNews(news.filter(item => item.id !== id));
          window.showToast('News article deleted successfully!', 'success');
        } else {
          window.showToast('Failed to delete news article', 'error');
        }
      } catch (error) {
        console.error('Error deleting news:', error);
        window.showToast('Error deleting news article', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image_url: '',
      status: 'draft',
      featured: false
    });
    setEditingNews(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="news-loading">
        <LoadingSpinner size="large" text="Loading news articles..." />
      </div>
    );
  }

  return (
    <div className="news-management">
      <div className="news-header">
        <h2>News Management</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          Create New Article
        </button>
      </div>

      {showForm && (
        <div className="news-form-container">
          <div className="news-form">
            <h3>{editingNews ? 'Edit Article' : 'Create New Article'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Enter article title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="excerpt">Excerpt</label>
                <textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Brief summary of the article"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                  placeholder="Write your article content here"
                  rows="8"
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    />
                    Featured Article
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <LoadingSpinner size="small" color="primary" />
                      {editingNews ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingNews ? 'Update Article' : 'Create Article'
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

      <div className="news-list">
        <h3>All Articles ({news.length})</h3>
        {news.length === 0 ? (
          <div className="no-news">
            <p>No news articles found. Create your first article!</p>
          </div>
        ) : (
          <div className="news-grid">
            {news.map((newsItem) => (
              <div key={newsItem.id} className="news-card">
                <div className="news-card-header">
                  <div className="news-status">
                    <span className={`status-badge ${newsItem.status}`}>
                      {newsItem.status}
                    </span>
                    {newsItem.featured && (
                      <span className="featured-badge">Featured</span>
                    )}
                  </div>
                  <div className="news-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(newsItem)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(newsItem.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="news-card-content">
                  <h4>{newsItem.title}</h4>
                  {newsItem.excerpt && (
                    <p className="news-excerpt">{newsItem.excerpt}</p>
                  )}
                  <div className="news-meta">
                    <span className="news-author">
                      By: {newsItem.users?.full_name || 'Unknown'}
                    </span>
                    <span className="news-date">
                      {new Date(newsItem.created_at).toLocaleDateString()}
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

export default NewsManagement;
