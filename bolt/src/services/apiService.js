const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error(`API request error for ${endpoint}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get request
  async get(endpoint, token = null) {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, { method: 'GET', headers });
  }

  // Post request
  async post(endpoint, body, token = null) {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  }

  // Put request
  async put(endpoint, body, token = null) {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
  }

  // Delete request
  async delete(endpoint, token = null) {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, { method: 'DELETE', headers });
  }

  // User endpoints
  async register(userData) {
    return this.post('/api/register', userData);
  }

  async login(credentials) {
    return this.post('/api/login', credentials);
  }

  async logout(token) {
    return this.post('/api/logout', {}, token);
  }

  async getCurrentUser(token) {
    return this.get('/api/user', token);
  }

  // Member dashboard endpoints
  async getMemberDashboard(token) {
    return this.get('/api/member/dashboard', token);
  }

  // Admin endpoints
  async getAdminStats(token) {
    return this.get('/api/admin/stats', token);
  }

  async getAdminUsers(token) {
    return this.get('/api/admin/users', token);
  }

  // News endpoints
  async getNews(token) {
    return this.get('/api/admin/news', token);
  }

  async createNews(newsData, token) {
    return this.post('/api/admin/news', newsData, token);
  }

  async updateNews(id, newsData, token) {
    return this.put(`/api/admin/news/${id}`, newsData, token);
  }

  async deleteNews(id, token) {
    return this.delete(`/api/admin/news/${id}`, token);
  }

  // Events endpoints
  async getEvents(token) {
    return this.get('/api/admin/events', token);
  }

  async createEvent(eventData, token) {
    return this.post('/api/admin/events', eventData, token);
  }

  async updateEvent(id, eventData, token) {
    return this.put(`/api/admin/events/${id}`, eventData, token);
  }

  async deleteEvent(id, token) {
    return this.delete(`/api/admin/events/${id}`, token);
  }

  // Stripe endpoints
  async createCheckoutSession(checkoutData) {
    return this.post('/api/create-checkout-session', checkoutData);
  }

  async processPaymentSuccess(paymentData) {
    return this.post('/api/payment-success', paymentData);
  }
}

export default new ApiService();
