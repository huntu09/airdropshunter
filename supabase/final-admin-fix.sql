-- =============================================
-- FINAL ADMIN FIX - BYPASS AUTH COMPLETELY
-- =============================================

-- =============================================
-- 1. DISABLE ALL RLS FOR ADMIN OPERATIONS
-- =============================================

-- Completely disable RLS on all tables
ALTER TABLE airdrops DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_progress DISABLE ROW LEVEL SECURITY;

-- Disable RLS on storage
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. GRANT FULL PERMISSIONS TO EVERYONE
-- =============================================

-- Grant all permissions to authenticated and anon
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- Grant storage permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO authenticated, anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO authenticated, anon;

-- =============================================
-- 3. CREATE STORAGE BUCKET WITH PUBLIC ACCESS
-- =============================================

-- Delete existing bucket if exists
DELETE FROM storage.buckets WHERE id = 'airdrops-images';

-- Create new bucket with full public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'airdrops-images',
  'airdrops-images',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- =============================================
-- 4. FIX CREATED_BY CONSTRAINT
-- =============================================

-- Make created_by nullable temporarily
ALTER TABLE airdrops ALTER COLUMN created_by DROP NOT NULL;

-- Set default value for created_by
ALTER TABLE airdrops ALTER COLUMN created_by SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- Update existing records with null created_by
UPDATE airdrops SET created_by = '00000000-0000-0000-0000-000000000000' WHERE created_by IS NULL;

-- =============================================
-- 5. CREATE ADMIN USER DIRECTLY
-- =============================================

-- Create admin user in profiles table
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
  '00000000-0000-0000-0000-000000000001',
  'asuszenfonelivea3@gmail.com',
  'admin',
  'Admin User',
  'admin',
  'active',
  NOW(),
  0,
  0
) ON CONFLICT (id) DO UPDATE SET
  email = 'asuszenfonelivea3@gmail.com',
  role = 'admin',
  status = 'active';

-- =============================================
-- 6. CREATE SIMPLE ADMIN CHECK FUNCTIONS
-- =============================================

-- Function to check admin by email (bypass auth)
CREATE OR REPLACE FUNCTION is_admin_by_email(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT user_email = 'asuszenfonelivea3@gmail.com';
$$;

-- Function to get admin user ID
CREATE OR REPLACE FUNCTION get_admin_user_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT '00000000-0000-0000-0000-000000000001'::UUID;
$$;

-- Grant execute permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, anon;

-- =============================================
-- 7. TEST FUNCTION WITHOUT AUTH
-- =============================================

CREATE OR REPLACE FUNCTION test_admin_operations()
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
  test_category_id UUID;
BEGIN
  -- Test 1: Insert airdrop
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
      'Test Airdrop Admin', 
      'Test Description for Admin', 
      'DeFi', 
      'pending', 
      '$100',
      'token',
      'ethereum',
      'easy',
      '5 minutes',
      NOW(), 
      NOW() + INTERVAL '30 days', 
      get_admin_user_id(),
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
      'Insert airdrop failed: ' || SQLERRM;
  END;

  -- Test 2: Update airdrop
  IF test_airdrop_id IS NOT NULL THEN
    BEGIN
      UPDATE airdrops 
      SET title = 'Updated Test Airdrop'
      WHERE id = test_airdrop_id;

      RETURN QUERY SELECT 
        'update_airdrop'::TEXT,
        true,
        'Successfully updated airdrop';

    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT 
        'update_airdrop'::TEXT,
        false,
        'Update airdrop failed: ' || SQLERRM;
    END;
  END IF;

  -- Test 3: Delete airdrop
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
        'Delete airdrop failed: ' || SQLERRM;
    END;
  END IF;

  -- Test 4: Insert category
  BEGIN
    INSERT INTO categories (
      name,
      slug,
      description,
      active,
      sort_order,
      created_at
    ) VALUES (
      'Test Category',
      'test-category',
      'Test category description',
      true,
      999,
      NOW()
    ) RETURNING id INTO test_category_id;

    RETURN QUERY SELECT 
      'insert_category'::TEXT,
      true,
      'Successfully inserted category: ' || test_category_id::TEXT;

    -- Clean up
    DELETE FROM categories WHERE id = test_category_id;

  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 
      'insert_category'::TEXT,
      false,
      'Insert category failed: ' || SQLERRM;
  END;

END;
$$;

-- =============================================
-- 8. COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'FINAL ADMIN FIX COMPLETED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '1. DISABLED ALL RLS (Row Level Security)';
  RAISE NOTICE '2. GRANTED FULL PERMISSIONS TO ALL USERS';
  RAISE NOTICE '3. CREATED PUBLIC STORAGE BUCKET';
  RAISE NOTICE '4. FIXED created_by CONSTRAINT';
  RAISE NOTICE '5. CREATED ADMIN USER DIRECTLY';
  RAISE NOTICE '6. BYPASSED AUTH COMPLETELY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Test with: SELECT * FROM test_admin_operations();';
  RAISE NOTICE '==============================================';
END;
$$;
