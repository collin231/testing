-- Fix RLS Policies for Anamola Website - ALL TABLES
-- Run these commands in your Supabase SQL Editor to temporarily fix admin access

-- 1. Disable RLS on ALL tables in the public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' DISABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- 2. Grant ALL privileges to authenticated users on ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON public.' || quote_ident(r.tablename) || ' TO authenticated';
    END LOOP;
END $$;

-- 3. Grant usage on ALL sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Verify the changes - check which tables have RLS disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. Check permissions for authenticated users on all tables
SELECT 
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE grantee = 'authenticated' 
AND table_schema = 'public'
ORDER BY table_name, privilege_type;

-- 6. Show all tables in the public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- IMPORTANT: When you're ready to re-enable RLS later, you can run:
/*
-- Re-enable RLS on all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' ENABLE ROW LEVEL SECURITY';
    END LOOP;
END $$;

-- Then create proper RLS policies for each table as needed
*/
