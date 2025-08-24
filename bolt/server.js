require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Supabase clients
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Validation middleware
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRequired = (data, fields) => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  return { valid: true };
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Token verification failed' });
  }
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user is admin (you can implement your own admin logic)
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('auth_user_id', req.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Admin verification failed' });
  }
};

// ===== USER AUTHENTICATION ENDPOINTS =====

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, dateOfBirth, address, city, province, postalCode, occupation, educationLevel, contactPreference } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['email', 'password', 'fullName']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    // Create user profile
    const memberId = `MEMBER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        full_name: fullName,
        phone,
        date_of_birth: dateOfBirth,
        address,
        city,
        province,
        postal_code: postalCode,
        occupation,
        education_level: educationLevel,
        contact_preference: contactPreference,
        member_id: memberId,
        membership_status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: profile
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['email', 'password']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: profile,
      profile: profile,
      session: authData.session
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// User Logout
app.post('/api/logout', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Logout failed' });
    }

    res.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get Current User
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', req.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({ success: true, user: profile });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ===== STRIPE PAYMENT ENDPOINTS =====

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { email, fullName, membershipType = 'Standard Membership' } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['email', 'fullName']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mzn',
            product_data: {
              name: membershipType,
              description: 'Anamola Party Membership',
            },
            unit_amount: 10000, // 100 MZN in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/register`,
      customer_email: email,
      metadata: {
        email,
        fullName,
        membershipType
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Payment Success Webhook
app.post('/api/payment-success', async (req, res) => {
  try {
    const { sessionId, email, fullName, membershipType } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['sessionId', 'email', 'fullName']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Generate member ID and password
    const memberId = `MEMBER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const password = Math.random().toString(36).substr(2, 12);

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(500).json({ error: 'Failed to create user account' });
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authData.user.id,
        email,
        full_name: fullName,
        member_id: memberId,
        membership_status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Create membership record
    const { error: membershipError } = await supabaseAdmin
      .from('memberships')
      .insert({
        user_id: profile.id,
        membership_type: membershipType,
        amount: 100,
        currency: 'MZN',
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        stripe_session_id: sessionId
      });

    if (membershipError) {
      console.error('Membership creation error:', membershipError);
      // Don't fail the whole process for this
    }

    res.json({
      success: true,
      message: 'Payment successful and account created',
      user: profile,
      password
    });

  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// ===== MEMBER DASHBOARD ENDPOINTS =====

// Get Member Dashboard Data
app.get('/api/member/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // Get upcoming events
    const { data: upcomingEvents } = await supabaseAdmin
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(5);

    // Get recent news
    const { data: recentNews } = await supabaseAdmin
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get user's membership data
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get user's event registrations
    const { data: eventRegistrations } = await supabaseAdmin
      .from('event_registrations')
      .select('*')
      .eq('user_id', profile.id);

    // Get user's activities
    const { data: userActivities } = await supabaseAdmin
      .from('user_activities')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      profile,
      membership: membership || null,
      stats: {
        eventsAttended: eventRegistrations?.length || 0,
        totalEvents: upcomingEvents?.length || 0,
        totalNews: recentNews?.length || 0
      },
      upcomingEvents: upcomingEvents || [],
      recentNews: recentNews || [],
      eventRegistrations: eventRegistrations || [],
      userActivities: userActivities || []
    });

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ===== ADMIN DASHBOARD ENDPOINTS =====

// Get Admin Stats
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total members
    const { count: totalMembers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get total news articles
    const { count: totalNews } = await supabaseAdmin
      .from('news')
      .select('*', { count: 'exact', head: true });

    // Get upcoming events count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: upcomingEvents } = await supabaseAdmin
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('start_date', today.toISOString());

    // Get total revenue
    const { data: memberships } = await supabaseAdmin
      .from('memberships')
      .select('amount, currency, payment_status')
      .eq('payment_status', 'completed');

    const totalRevenue = memberships?.reduce((sum, membership) => {
      return sum + (membership.amount || 0);
    }, 0) || 0;

    res.json({
      success: true,
      stats: {
        totalMembers: totalMembers || 0,
        totalNews: totalNews || 0,
        upcomingEvents: upcomingEvents || 0,
        totalRevenue: totalRevenue
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get All Users
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        memberships (
          membership_type,
          payment_status,
          amount,
          currency
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Users fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({
      success: true,
      users: users || []
    });

  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ===== NEWS MANAGEMENT ENDPOINTS =====

// Get All News
app.get('/api/admin/news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: news, error } = await supabaseAdmin
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('News fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch news' });
    }

    res.json({
      success: true,
      news: news || []
    });

  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Create News
app.post('/api/admin/news', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, status = 'draft' } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['title', 'content']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    const { data: news, error } = await supabaseAdmin
      .from('news')
      .insert({
        title,
        content,
        status,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('News creation error:', error);
      return res.status(500).json({ error: 'Failed to create news article' });
    }

    res.status(201).json({
      success: true,
      message: 'News article created successfully',
      news
    });

  } catch (error) {
    console.error('News creation error:', error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});

// Update News
app.put('/api/admin/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, status } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['title', 'content']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    const { data: news, error } = await supabaseAdmin
      .from('news')
      .update({
        title,
        content,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('News update error:', error);
      return res.status(500).json({ error: 'Failed to update news article' });
    }

    res.json({
      success: true,
      message: 'News article updated successfully',
      news
    });

  } catch (error) {
    console.error('News update error:', error);
    res.status(500).json({ error: 'Failed to update news article' });
  }
});

// Delete News
app.delete('/api/admin/news/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('News deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete news article' });
    }

    res.json({
      success: true,
      message: 'News article deleted successfully'
    });

  } catch (error) {
    console.error('News deletion error:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

// ===== EVENTS MANAGEMENT ENDPOINTS =====

// Get All Events
app.get('/api/admin/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Events fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    res.json({
      success: true,
      events: events || []
    });

  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create Event
app.post('/api/admin/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, start_date, end_date, location, status = 'upcoming' } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['title', 'description', 'start_date', 'end_date', 'location']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .insert({
        title,
        description,
        start_date,
        end_date,
        location,
        status,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Event creation error:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update Event
app.put('/api/admin/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, start_date, end_date, location, status } = req.body;

    // Validate required fields
    const validation = validateRequired(req.body, ['title', 'description', 'start_date', 'end_date', 'location']);
    if (!validation.valid) {
      return res.status(400).json({ error: `Missing required fields: ${validation.missing.join(', ')}` });
    }

    const { data: event, error } = await supabaseAdmin
      .from('events')
      .update({
        title,
        description,
        start_date,
        end_date,
        location,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Event update error:', error);
      return res.status(500).json({ error: 'Failed to update event' });
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event
    });

  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete Event
app.delete('/api/admin/events/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Event deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete event' });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ===== STRIPE WEBHOOK =====

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Handle successful payment
    console.log('Payment successful for session:', session.id);
  }

  res.json({ received: true });
});

// ===== ERROR HANDLING MIDDLEWARE =====

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===== 404 HANDLER =====

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ===== SERVER STARTUP =====

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💳 Stripe mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
  console.log(`🔑 Stripe Secret Key loaded: ${process.env.STRIPE_SECRET_KEY ? 'YES' : 'NO'}`);
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL || 'NOT SET'}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Environment variables loaded:', {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'LOADED' : 'NOT SET',
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY ? 'LOADED' : 'NOT SET',
      SUPABASE_URL: process.env.SUPABASE_URL ? 'LOADED' : 'NOT SET'
    });
  }
});
