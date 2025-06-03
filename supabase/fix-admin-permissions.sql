-- =============================================
-- FIX ADMIN PERMISSIONS - RLS POLICIES
-- =============================================
-- This will fix all permission denied errors for admin

-- =============================================
-- 1. DROP EXISTING RESTRICTIVE POLICIES
-- =============================================

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

DROP POLICY IF EXISTS "Anyone can view active airdrops" ON airdrops;
DROP POLICY IF EXISTS "Admins can view all airdrops" ON airdrops;
DROP POLICY IF EXISTS "Admins can manage airdrops" ON airdrops;

-- =============================================
-- 2. CREATE ADMIN-FRIENDLY POLICIES
-- =============================================

-- PROFILES TABLE POLICIES
CREATE POLICY "profiles_select_own" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ADMIN CAN DO EVERYTHING ON PROFILES
CREATE POLICY "profiles_admin_all" ON profiles 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
    )
  );

-- AIRDROPS TABLE POLICIES
CREATE POLICY "airdrops_select_public" ON airdrops 
  FOR SELECT USING (status IN ('active', 'completed'));

-- ADMIN CAN DO EVERYTHING ON AIRDROPS
CREATE POLICY "airdrops_admin_all" ON airdrops 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
    )
  );

-- ADMIN CAN INSERT AIRDROPS
CREATE POLICY "airdrops_admin_insert" ON airdrops 
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
    )
  );

-- =============================================
-- 3. FIX OTHER TABLES PERMISSIONS
-- =============================================

-- CATEGORIES TABLE
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "categories_select_active" ON categories 
  FOR SELECT USING (active = true);

CREATE POLICY "categories_admin_all" ON categories 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
    )
  );

-- AIRDROP_PARTICIPANTS TABLE
CREATE POLICY "participants_select_own" ON airdrop_participants 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "participants_insert_own" ON airdrop_participants 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "participants_admin_all" ON airdrop_participants 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
    )
  );

-- AIRDROP_VERIFICATIONS TABLE
CREATE POLICY "verifications_select_own" ON airdrop_verifications 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "verifications_insert_own" ON airdrop_verifications 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "verifications_admin_all" ON airdrop_verifications 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
    )
  );

-- ADMIN_LOGS TABLE
CREATE POLICY "admin_logs_admin_only" ON admin_logs 
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
    )
  );

-- =============================================
-- 4. GRANT DIRECT TABLE PERMISSIONS
-- =============================================

-- Grant direct permissions to authenticated users
GRANT ALL ON airdrops TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON airdrop_participants TO authenticated;
GRANT ALL ON airdrop_verifications TO authenticated;
GRANT ALL ON admin_logs TO authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================
-- 5. CREATE ADMIN BYPASS FUNCTION
-- =============================================

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'asuszenfonelivea3@gmail.com',
      false
    )
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- =============================================
-- 6. VERIFY ADMIN USER EXISTS
-- =============================================

-- Ensure admin profile exists with correct role
INSERT INTO profiles (id, email, username, role, status)
SELECT 
  auth.users.id,
  auth.users.email,
  COALESCE(auth.users.raw_user_meta_data->>'username', 'admin'),
  'admin',
  'active'
FROM auth.users 
WHERE auth.users.email = 'asuszenfonelivea3@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  status = 'active',
  email = EXCLUDED.email;

-- =============================================
-- 7. STORAGE PERMISSIONS (for file uploads)
-- =============================================

-- Create storage bucket policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('airdrops', 'airdrops', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admin to upload files
CREATE POLICY "Admin can upload files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'airdrops' AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
  )
);

-- Allow admin to update files
CREATE POLICY "Admin can update files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'airdrops' AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
  )
);

-- Allow admin to delete files
CREATE POLICY "Admin can delete files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'airdrops' AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
  )
);

-- Allow public to view files
CREATE POLICY "Anyone can view files" ON storage.objects
FOR SELECT USING (bucket_id = 'airdrops');

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'ADMIN PERMISSIONS FIXED SUCCESSFULLY!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Admin can now:';
  RAISE NOTICE '- Create airdrops ✅';
  RAISE NOTICE '- Edit airdrops ✅';
  RAISE NOTICE '- Delete airdrops ✅';
  RAISE NOTICE '- Upload files ✅';
  RAISE NOTICE '- Manage all data ✅';
  RAISE NOTICE '==============================================';
END;
$$;
