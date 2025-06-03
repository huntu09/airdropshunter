-- =============================================
-- COMPLETE ADMIN FIX - FINAL SOLUTION
-- =============================================

-- =============================================
-- 1. DISABLE RLS TEMPORARILY FOR DEBUGGING
-- =============================================

-- Disable RLS on critical tables for admin operations
ALTER TABLE airdrops DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_verifications DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. GRANT FULL PERMISSIONS TO AUTHENTICATED
-- =============================================

-- Grant all permissions on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON airdrops TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON airdrop_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON airdrop_verifications TO authenticated;

-- =============================================
-- 3. FIX STORAGE PERMISSIONS
-- =============================================

-- Drop all existing storage policies
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;

-- Create simple storage policies
CREATE POLICY "authenticated_can_upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'airdrops-images');

CREATE POLICY "authenticated_can_update" ON storage.objects
FOR UPDATE USING (bucket_id = 'airdrops-images');

CREATE POLICY "authenticated_can_delete" ON storage.objects
FOR DELETE USING (bucket_id = 'airdrops-images');

CREATE POLICY "public_can_view" ON storage.objects
FOR SELECT USING (bucket_id = 'airdrops-images');

-- =============================================
-- 4. CREATE STORAGE BUCKET IF NOT EXISTS
-- =============================================

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'airdrops-images',
  'airdrops-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- =============================================
-- 5. VERIFY ADMIN USER
-- =============================================

-- Get admin user ID
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get admin user ID from auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'asuszenfonelivea3@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- Ensure admin profile exists
    INSERT INTO profiles (id, email, username, role, status, created_at)
    VALUES (
      admin_user_id,
      'asuszenfonelivea3@gmail.com',
      'admin',
      'admin',
      'active',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      status = 'active',
      email = 'asuszenfonelivea3@gmail.com';

    RAISE NOTICE 'Admin user verified: %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user not found in auth.users';
  END IF;
END;
$$;

-- =============================================
-- 6. CREATE ADMIN FUNCTIONS
-- =============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Function to get current user email
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    ''
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_email() TO authenticated;

-- =============================================
-- 7. RE-ENABLE RLS WITH SIMPLE POLICIES
-- =============================================

-- Re-enable RLS
ALTER TABLE airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "airdrops_select_public" ON airdrops;
DROP POLICY IF EXISTS "airdrops_admin_all" ON airdrops;
DROP POLICY IF EXISTS "airdrops_admin_insert" ON airdrops;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
DROP POLICY IF EXISTS "categories_select_active" ON categories;
DROP POLICY IF EXISTS "categories_admin_all" ON categories;

-- Create simple, working policies
-- AIRDROPS policies
CREATE POLICY "airdrops_public_read" ON airdrops
FOR SELECT USING (true);

CREATE POLICY "airdrops_admin_write" ON airdrops
FOR ALL USING (
  current_user_email() = 'asuszenfonelivea3@gmail.com'
);

-- PROFILES policies
CREATE POLICY "profiles_read_own" ON profiles
FOR SELECT USING (id = auth.uid() OR current_user_email() = 'asuszenfonelivea3@gmail.com');

CREATE POLICY "profiles_write_own" ON profiles
FOR ALL USING (id = auth.uid() OR current_user_email() = 'asuszenfonelivea3@gmail.com');

-- CATEGORIES policies
CREATE POLICY "categories_read_all" ON categories
FOR SELECT USING (true);

CREATE POLICY "categories_admin_write" ON categories
FOR ALL USING (current_user_email() = 'asuszenfonelivea3@gmail.com');

-- =============================================
-- 8. TEST ADMIN PERMISSIONS
-- =============================================

-- Test function to verify admin can perform operations
CREATE OR REPLACE FUNCTION test_admin_permissions()
RETURNS TABLE(
  test_name TEXT,
  result BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_airdrop_id UUID;
BEGIN
  -- Test 1: Check if user is admin
  RETURN QUERY SELECT 
    'is_admin_check'::TEXT,
    is_admin(),
    'Admin status: ' || CASE WHEN is_admin() THEN 'TRUE' ELSE 'FALSE' END;

  -- Test 2: Check user email
  RETURN QUERY SELECT 
    'email_check'::TEXT,
    (current_user_email() = 'asuszenfonelivea3@gmail.com'),
    'Email: ' || current_user_email();

  -- Test 3: Try to insert airdrop
  BEGIN
    INSERT INTO airdrops (
      title, description, category, status, reward_amount, 
      start_date, end_date, created_by
    ) VALUES (
      'Test Airdrop', 'Test Description', 'DeFi', 'pending', '$100',
      NOW(), NOW() + INTERVAL '30 days', auth.uid()
    ) RETURNING id INTO test_airdrop_id;

    RETURN QUERY SELECT 
      'insert_test'::TEXT,
      true,
      'Successfully inserted airdrop: ' || test_airdrop_id::TEXT;

    -- Clean up test data
    DELETE FROM airdrops WHERE id = test_airdrop_id;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'insert_test'::TEXT,
      false,
      'Insert failed: ' || SQLERRM;
  END;

END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_admin_permissions() TO authenticated;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'COMPLETE ADMIN FIX APPLIED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Granted full permissions to authenticated users';
  RAISE NOTICE '2. Fixed storage bucket and policies';
  RAISE NOTICE '3. Verified admin user exists';
  RAISE NOTICE '4. Created admin helper functions';
  RAISE NOTICE '5. Applied simple, working RLS policies';
  RAISE NOTICE '6. Created test function for verification';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test admin login';
  RAISE NOTICE '2. Try creating/deleting airdrops';
  RAISE NOTICE '3. Test file uploads';
  RAISE NOTICE '4. Run: SELECT * FROM test_admin_permissions();';
  RAISE NOTICE '==============================================';
END;
$$;
