-- Admin Database Schema for Anamola Website
-- Run these commands in your Supabase SQL Editor

-- 1. News Articles Table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  image_url TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  location_details TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  registration_required BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  featured BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Event Registrations Table
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- 4. User Activities Table
CREATE TABLE IF NOT EXISTS public.user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'payment', 'news_view', 'event_registration', 'profile_update')),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Admin Logs Table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_news_status_published ON public.news(status, published_at);
CREATE INDEX IF NOT EXISTS idx_news_featured ON public.news(featured);
CREATE INDEX IF NOT EXISTS idx_news_author ON public.news(author_id);
CREATE INDEX IF NOT EXISTS idx_events_date_status ON public.events(date, status);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user ON public.event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type ON public.user_activities(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_action ON public.admin_logs(admin_user_id, action);

-- 7. Create Updated At Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Row Level Security Policies
-- News Table RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News are viewable by everyone" ON public.news
    FOR SELECT USING (status = 'published');

CREATE POLICY "News are insertable by authenticated users" ON public.news
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "News are updatable by author or admin" ON public.news
    FOR UPDATE USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() AND membership_status = 'admin'
        )
    );

CREATE POLICY "News are deletable by author or admin" ON public.news
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() AND membership_status = 'admin'
        )
    );

-- Events Table RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Events are insertable by authenticated users" ON public.events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Events are updatable by creator or admin" ON public.events
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() AND membership_status = 'admin'
        )
    );

CREATE POLICY "Events are deletable by creator or admin" ON public.events
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() AND membership_status = 'admin'
        )
    );

-- Event Registrations Table RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registrations" ON public.event_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON public.event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON public.event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations" ON public.event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() AND membership_status = 'admin'
        )
    );

-- User Activities Table RLS
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities" ON public.user_activities
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activities" ON public.user_activities
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all activities" ON public.user_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() AND membership_status = 'admin'
        )
    );

-- Admin Logs Table RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin logs" ON public.admin_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE auth_user_id = auth.uid() AND membership_status = 'admin'
        )
    );

CREATE POLICY "System can insert admin logs" ON public.admin_logs
    FOR INSERT WITH CHECK (true);

-- 9. Grant Permissions
GRANT ALL PRIVILEGES ON public.news TO authenticated;
GRANT ALL PRIVILEGES ON public.events TO authenticated;
GRANT ALL PRIVILEGES ON public.event_registrations TO authenticated;
GRANT ALL PRIVILEGES ON public.user_activities TO authenticated;
GRANT ALL PRIVILEGES ON public.admin_logs TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 10. Insert Sample Data (Optional)
-- Uncomment these lines if you want to add sample data for testing

/*
INSERT INTO public.news (title, content, excerpt, status, featured, published_at) VALUES
('Welcome to Anamola', 'Welcome to our new website and community platform.', 'Welcome message for new members.', 'published', true, NOW()),
('Upcoming Party Meeting', 'Join us for our monthly party meeting this weekend.', 'Monthly party meeting announcement.', 'published', false, NOW());

INSERT INTO public.events (title, description, date, location, max_participants, registration_required) VALUES
('Monthly Party Meeting', 'Monthly gathering to discuss party matters and plan future activities.', NOW() + INTERVAL '7 days', 'Party Headquarters', 50, true),
('Community Outreach', 'Volunteer event to connect with local communities.', NOW() + INTERVAL '14 days', 'Various Locations', 100, false);
*/
