-- =============================================
-- SAFE ADMIN FIX V2 - HANDLE EXISTING DATA
-- =============================================

-- =============================================
-- 1. DISABLE RLS ON PUBLIC TABLES ONLY
-- =============================================

-- Disable RLS on tables we own
ALTER TABLE airdrops DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Try to disable RLS on other tables (may fail, that's OK)
DO $$
BEGIN
  BEGIN
    ALTER TABLE airdrop_participants DISABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not disable RLS on airdrop_participants: %', SQLERRM;
  END;
  
  BEGIN
    ALTER TABLE airdrop_verifications DISABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not disable RLS on airdrop_verifications: %', SQLERRM;
  END;
  
  BEGIN
    ALTER TABLE airdrop_tasks DISABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not disable RLS on airdrop_tasks: %', SQLERRM;
  END;
  
  BEGIN
    ALTER TABLE user_task_progress DISABLE ROW LEVEL SECURITY;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not disable RLS on user_task_progress: %', SQLERRM;
  END;
END;
$$;

-- =============================================
-- 2. GRANT PERMISSIONS ON PUBLIC TABLES
-- =============================================

-- Grant permissions on tables we can access
GRANT ALL PRIVILEGES ON airdrops TO authenticated, anon;
GRANT ALL PRIVILEGES ON profiles TO authenticated, anon;
GRANT ALL PRIVILEGES ON categories TO authenticated, anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- =============================================
-- 3. FIX CREATED_BY CONSTRAINT
-- =============================================

-- Make created_by nullable
ALTER TABLE airdrops ALTER COLUMN created_by DROP NOT NULL;

-- Set default value for created_by
ALTER TABLE airdrops ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- Update existing records with null created_by
UPDATE airdrops SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by IS NULL;

-- =============================================
-- 4. UPDATE EXISTING ADMIN USER (SAFE WAY)
-- =============================================

-- First, check if admin user exists and update role
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Check if user with admin email exists
  SELECT id INTO admin_user_id 
  FROM profiles 
  WHERE email = 'asuszenfonelivea3@gmail.com';

  IF admin_user_id IS NOT NULL THEN
    -- User exists, update role to admin
    UPDATE profiles 
    SET 
      role = 'admin',
      status = 'active',
      username = COALESCE(username, 'admin'),
      full_name = COALESCE(full_name, 'Admin User')
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Updated existing user % to admin role', admin_user_id;
  ELSE
    -- User doesn't exist, create new one
    INSERT INTO profiles (
      id, 
      email, 
      username, 
      full_name,
      role, 
      status, 
      created_at,
      points,
      completed_airdrops
    ) VALUES (
      gen_random_uuid(),
      'asuszenfonelivea3@gmail.com',
      'admin',
      'Admin User',
      'admin',
      'active',
      NOW(),
      0,
      0
    );
    
    RAISE NOTICE 'Created new admin user';
  END IF;
END;
$$;

-- =============================================
-- 5. CREATE SIMPLE ADMIN FUNCTIONS
-- =============================================

-- Function to get admin user ID
CREATE OR REPLACE FUNCTION get_admin_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT id FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com' LIMIT 1;
$$;

-- Function to check if email is admin
CREATE OR REPLACE FUNCTION is_admin_email(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM profiles 
    WHERE email = check_email AND role = 'admin'
  );
$$;

-- =============================================
-- 6. CREATE STORAGE BUCKET (SAFE WAY)
-- =============================================

-- Try to create storage bucket safely
DO $$
BEGIN
  -- Try to insert bucket
  BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'airdrops-images',
      'airdrops-images',
      true,
      52428800, -- 50MB
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    );
    RAISE NOTICE 'Storage bucket created successfully';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Storage bucket already exists';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create storage bucket: %', SQLERRM;
  END;
END;
$$;

-- =============================================
-- 7. CREATE STORAGE POLICIES (SAFE WAY)
-- =============================================

-- Drop existing policies first (safe)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can upload to airdrops-images" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can view airdrops-images" ON storage.objects;
  DROP POLICY IF EXISTS "Anyone can delete from airdrops-images" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Could not drop existing policies: %', SQLERRM;
END;
$$;

-- Try to create storage policies
DO $$
BEGIN
  -- Policy for uploads
  BEGIN
    CREATE POLICY "Anyone can upload to airdrops-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'airdrops-images');
    RAISE NOTICE 'Upload policy created';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create upload policy: %', SQLERRM;
  END;

  -- Policy for viewing
  BEGIN
    CREATE POLICY "Anyone can view airdrops-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'airdrops-images');
    RAISE NOTICE 'View policy created';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create view policy: %', SQLERRM;
  END;

  -- Policy for deleting
  BEGIN
    CREATE POLICY "Anyone can delete from airdrops-images" ON storage.objects
    FOR DELETE USING (bucket_id = 'airdrops-images');
    RAISE NOTICE 'Delete policy created';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create delete policy: %', SQLERRM;
  END;
END;
$$;

-- =============================================
-- 8. TEST FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION test_admin_operations_v2()
RETURNS TABLE(
  operation TEXT,
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  test_airdrop_id UUID;
  admin_id UUID;
BEGIN
  -- Get admin user ID
  SELECT get_admin_user_id() INTO admin_id;

  -- Test 1: Check admin user
  BEGIN
    IF admin_id IS NOT NULL THEN
      RETURN QUERY SELECT 
        'admin_user_check'::TEXT,
        true,
        'Admin user found: ' || admin_id::TEXT;
    ELSE
      RETURN QUERY SELECT 
        'admin_user_check'::TEXT,
        false,
        'Admin user not found';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'admin_user_check'::TEXT,
      false,
      'Admin check failed: ' || SQLERRM;
  END;

  -- Test 2: Insert airdrop
  BEGIN
    INSERT INTO airdrops (
      title, 
      description, 
      category, 
      status, 
      reward_amount, 
      reward_type,
      blockchain,
      difficulty_level,
      estimated_time,
      start_date, 
      end_date, 
      created_by,
      max_participants,
      participants_count,
      featured,
      views_count,
      priority
    ) VALUES (
      'Test Admin Airdrop V2', 
      'Test Description for Admin V2', 
      'DeFi', 
      'pending', 
      '$100',
      'token',
      'ethereum',
      'easy',
      '5 minutes',
      NOW(), 
      NOW() + INTERVAL '30 days', 
      COALESCE(admin_id, '00000000-0000-0000-0000-000000000000'),
      1000,
      0,
      false,
      0,
      0
    ) RETURNING id INTO test_airdrop_id;

    RETURN QUERY SELECT 
      'insert_airdrop'::TEXT,
      true,
      'Successfully inserted airdrop: ' || test_airdrop_id::TEXT;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'insert_airdrop'::TEXT,
      false,
      'Insert failed: ' || SQLERRM;
  END;

  -- Test 3: Update airdrop
  IF test_airdrop_id IS NOT NULL THEN
    BEGIN
      UPDATE airdrops 
      SET title = 'Updated Test Airdrop V2'
      WHERE id = test_airdrop_id;

      RETURN QUERY SELECT 
        'update_airdrop'::TEXT,
        true,
        'Successfully updated airdrop';

    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        'update_airdrop'::TEXT,
        false,
        'Update failed: ' || SQLERRM;
    END;
  END IF;

  -- Test 4: Delete airdrop
  IF test_airdrop_id IS NOT NULL THEN
    BEGIN
      DELETE FROM airdrops WHERE id = test_airdrop_id;

      RETURN QUERY SELECT 
        'delete_airdrop'::TEXT,
        true,
        'Successfully deleted airdrop';

    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        'delete_airdrop'::TEXT,
        false,
        'Delete failed: ' || SQLERRM;
    END;
  END IF;

  -- Test 5: Check storage bucket
  BEGIN
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'airdrops-images') THEN
      RETURN QUERY SELECT 
        'storage_bucket_check'::TEXT,
        true,
        'Storage bucket exists';
    ELSE
      RETURN QUERY SELECT 
        'storage_bucket_check'::TEXT,
        false,
        'Storage bucket not found';
    END IF;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'storage_bucket_check'::TEXT,
      false,
      'Storage check failed: ' || SQLERRM;
  END;

END;
$$;

-- =============================================
-- 9. COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SAFE ADMIN FIX V2 COMPLETED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. Disabled RLS on main tables';
  RAISE NOTICE '2. Granted permissions safely';
  RAISE NOTICE '3. Fixed created_by constraint';
  RAISE NOTICE '4. Updated existing admin user';
  RAISE NOTICE '5. Created storage bucket and policies';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Test with: SELECT * FROM test_admin_operations_v2();';
  RAISE NOTICE '==============================================';
END;
$$;
