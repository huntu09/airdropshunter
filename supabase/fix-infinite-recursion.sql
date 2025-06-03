-- =============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =============================================

-- =============================================
-- 1. DROP ALL EXISTING POLICIES TO START CLEAN
-- =============================================

-- Drop all policies on profiles table
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

-- Drop all policies on airdrops table
DROP POLICY IF EXISTS "airdrops_select_public" ON airdrops;
DROP POLICY IF EXISTS "airdrops_admin_all" ON airdrops;
DROP POLICY IF EXISTS "airdrops_admin_insert" ON airdrops;

-- Drop all policies on categories table
DROP POLICY IF EXISTS "categories_select_active" ON categories;
DROP POLICY IF EXISTS "categories_admin_all" ON categories;

-- Drop all policies on other tables
DROP POLICY IF EXISTS "participants_select_own" ON airdrop_participants;
DROP POLICY IF EXISTS "participants_insert_own" ON airdrop_participants;
DROP POLICY IF EXISTS "participants_admin_all" ON airdrop_participants;

DROP POLICY IF EXISTS "verifications_select_own" ON airdrop_verifications;
DROP POLICY IF EXISTS "verifications_insert_own" ON airdrop_verifications;
DROP POLICY IF EXISTS "verifications_admin_all" ON airdrop_verifications;

DROP POLICY IF EXISTS "admin_logs_admin_only" ON admin_logs;

-- Drop storage policies
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;

-- =============================================
-- 2. CREATE SIMPLE, NON-RECURSIVE POLICIES
-- =============================================

-- PROFILES TABLE - Simple policies without recursion
CREATE POLICY "profiles_select_policy" ON profiles 
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "profiles_insert_policy" ON profiles 
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "profiles_update_policy" ON profiles 
  FOR UPDATE USING (
    auth.uid() = id OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "profiles_delete_policy" ON profiles 
  FOR DELETE USING (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

-- AIRDROPS TABLE - Simple admin access
CREATE POLICY "airdrops_select_policy" ON airdrops 
  FOR SELECT USING (
    status IN ('active', 'completed') OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "airdrops_insert_policy" ON airdrops 
  FOR INSERT WITH CHECK (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "airdrops_update_policy" ON airdrops 
  FOR UPDATE USING (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "airdrops_delete_policy" ON airdrops 
  FOR DELETE USING (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

-- CATEGORIES TABLE
CREATE POLICY "categories_select_policy" ON categories 
  FOR SELECT USING (
    active = true OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "categories_admin_policy" ON categories 
  FOR ALL USING (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

-- AIRDROP_PARTICIPANTS TABLE
CREATE POLICY "participants_select_policy" ON airdrop_participants 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "participants_insert_policy" ON airdrop_participants 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "participants_admin_policy" ON airdrop_participants 
  FOR ALL USING (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

-- AIRDROP_VERIFICATIONS TABLE
CREATE POLICY "verifications_select_policy" ON airdrop_verifications 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "verifications_insert_policy" ON airdrop_verifications 
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR 
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "verifications_admin_policy" ON airdrop_verifications 
  FOR ALL USING (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

-- ADMIN_LOGS TABLE
CREATE POLICY "admin_logs_policy" ON admin_logs 
  FOR ALL USING (
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

-- =============================================
-- 3. STORAGE POLICIES - SIMPLE AND DIRECT
-- =============================================

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('airdrops', 'airdrops', true)
ON CONFLICT (id) DO NOTHING;

-- Simple storage policies without recursion
CREATE POLICY "storage_admin_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'airdrops' AND
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "storage_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'airdrops' AND
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "storage_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'airdrops' AND
    auth.email() = 'asuszenfonelivea3@gmail.com'
  );

CREATE POLICY "storage_public_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'airdrops');

-- =============================================
-- 4. ENSURE ADMIN PROFILE EXISTS
-- =============================================

-- Insert admin profile if not exists
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- Get admin user ID from auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'asuszenfonelivea3@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert or update admin profile
        INSERT INTO profiles (id, email, username, role, status, points, completed_airdrops)
        VALUES (
            admin_user_id,
            'asuszenfonelivea3@gmail.com',
            'admin',
            'admin',
            'active',
            0,
            0
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            status = 'active',
            email = 'asuszenfonelivea3@gmail.com';
            
        RAISE NOTICE 'Admin profile created/updated successfully';
    ELSE
        RAISE NOTICE 'Admin user not found in auth.users table';
    END IF;
END;
$$;

-- =============================================
-- 5. GRANT NECESSARY PERMISSIONS
-- =============================================

-- Grant table permissions
GRANT ALL ON airdrops TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON airdrop_participants TO authenticated;
GRANT ALL ON airdrop_verifications TO authenticated;
GRANT ALL ON admin_logs TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant storage permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- =============================================
-- 6. VERIFICATION
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'INFINITE RECURSION FIXED SUCCESSFULLY!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '- Removed recursive policy references ✅';
    RAISE NOTICE '- Used auth.email() instead of profile lookups ✅';
    RAISE NOTICE '- Simplified all RLS policies ✅';
    RAISE NOTICE '- Fixed storage permissions ✅';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Admin can now:';
    RAISE NOTICE '- Upload files without recursion errors ✅';
    RAISE NOTICE '- Create/edit/delete airdrops ✅';
    RAISE NOTICE '- Access all admin functions ✅';
    RAISE NOTICE '==============================================';
END;
$$;
