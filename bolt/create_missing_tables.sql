-- =====================================================
-- Anamola Party Website - Missing Tables Creation Script
-- =====================================================
-- This script creates the missing database tables needed for:
-- 1. Event registrations and user activities tracking
-- 2. Contact form submissions
-- 3. Party merchandise and store functionality
-- 4. Enhanced user experience and analytics
--
-- Run this script in your Supabase SQL editor to enable
-- all the new features we've implemented.
-- =====================================================

-- Create missing tables for full functionality

-- Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- User Activities table
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('news_view', 'event_registration', 'profile_update', 'login', 'logout')),
    details JSONB DEFAULT '{}' CHECK (jsonb_typeof(details) = 'object'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(name) > 0),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    subject TEXT NOT NULL CHECK (length(subject) > 0),
    message TEXT NOT NULL CHECK (length(message) > 0),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Merchandise table
CREATE TABLE IF NOT EXISTS merchandise (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_activity_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_merchandise_status ON merchandise(status);
CREATE INDEX IF NOT EXISTS idx_merchandise_price ON merchandise(price);
CREATE INDEX IF NOT EXISTS idx_merchandise_name ON merchandise(name);

-- Enable Row Level Security
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_registrations
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own event registrations' AND tablename = 'event_registrations') THEN
        CREATE POLICY "Users can view their own event registrations" ON event_registrations
            FOR SELECT USING (auth.uid() IN (
                SELECT auth_user_id FROM users WHERE id = user_id
            ));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own event registrations' AND tablename = 'event_registrations') THEN
        CREATE POLICY "Users can insert their own event registrations" ON event_registrations
            FOR INSERT WITH CHECK (auth.uid() IN (
                SELECT auth_user_id FROM users WHERE id = user_id
            ));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own event registrations' AND tablename = 'event_registrations') THEN
        CREATE POLICY "Users can update their own event registrations" ON event_registrations
            FOR UPDATE USING (auth.uid() IN (
                SELECT auth_user_id FROM users WHERE id = user_id
            ));
    END IF;
END $$;

-- RLS Policies for user_activities
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own activities' AND tablename = 'user_activities') THEN
        CREATE POLICY "Users can view their own activities" ON user_activities
            FOR SELECT USING (auth.uid() IN (
                SELECT auth_user_id FROM users WHERE id = user_id
            ));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own activities' AND tablename = 'user_activities') THEN
        CREATE POLICY "Users can insert their own activities" ON user_activities
            FOR INSERT WITH CHECK (auth.uid() IN (
                SELECT auth_user_id FROM users WHERE id = user_id
            ));
    END IF;
END $$;

-- RLS Policies for contact_messages (public access for submissions, admin for viewing)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can submit contact messages' AND tablename = 'contact_messages') THEN
        CREATE POLICY "Anyone can submit contact messages" ON contact_messages
            FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all contact messages' AND tablename = 'contact_messages') THEN
        CREATE POLICY "Admins can view all contact messages" ON contact_messages
            FOR SELECT USING (auth.role() = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update contact messages' AND tablename = 'contact_messages') THEN
        CREATE POLICY "Admins can update contact messages" ON contact_messages
            FOR UPDATE USING (auth.role() = 'service_role');
    END IF;
END $$;

-- RLS Policies for merchandise (public read, admin write)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view merchandise' AND tablename = 'merchandise') THEN
        CREATE POLICY "Anyone can view merchandise" ON merchandise
            FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage merchandise' AND tablename = 'merchandise') THEN
        CREATE POLICY "Admins can manage merchandise" ON merchandise
            FOR ALL USING (auth.role() = 'service_role');
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON event_registrations TO authenticated;
GRANT ALL ON user_activities TO authenticated;
GRANT ALL ON contact_messages TO authenticated;
GRANT ALL ON merchandise TO authenticated;
GRANT ALL ON event_registrations TO service_role;
GRANT ALL ON user_activities TO service_role;
GRANT ALL ON contact_messages TO service_role;
GRANT ALL ON merchandise TO service_role;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_event_registrations_updated_at ON event_registrations;
CREATE TRIGGER update_event_registrations_updated_at
    BEFORE UPDATE ON event_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_merchandise_updated_at ON merchandise;
CREATE TRIGGER update_merchandise_updated_at
    BEFORE UPDATE ON merchandise
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample merchandise data (only if table is empty)
INSERT INTO merchandise (name, description, price, image_url, stock_quantity)
SELECT * FROM (VALUES
    ('Anamola T-Shirt', 'Official party t-shirt with logo', 250.00, '👕', 100),
    ('Anamola Cap', 'Party branded baseball cap', 150.00, '🧢', 75),
    ('Anamola Mug', 'Ceramic mug with party branding', 100.00, '☕', 50),
    ('Anamola Stickers', 'Set of 10 party stickers', 50.00, '🏷️', 200)
) AS v(name, description, price, image_url, stock_quantity)
WHERE NOT EXISTS (SELECT 1 FROM merchandise WHERE name = v.name);
