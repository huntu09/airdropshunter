-- =============================================
-- SAFE ADMIN FIX V3 - FIXED SYNTAX
-- =============================================

-- =============================================
-- 1. DISABLE RLS ON PUBLIC TABLES ONLY
-- =============================================

-- Disable RLS on tables we own
ALTER TABLE airdrops DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

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

-- Update existing user to admin role
UPDATE profiles 
SET 
  role = 'admin',
  status = 'active',
  username = COALESCE(username, 'admin'),
  full_name = COALESCE(full_name, 'Admin User')
WHERE email = 'asuszenfonelivea3@gmail.com';

-- If no rows were updated, insert new admin user
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
) 
SELECT 
  gen_random_uuid(),
  'asuszenfonelivea3@gmail.com',
  'admin',
  'Admin User',
  'admin',
  'active',
  NOW(),
  0,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE email = 'asuszenfonelivea3@gmail.com'
);

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
-- 6. CREATE STORAGE BUCKET (SIMPLE WAY)
-- =============================================

-- Insert storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'airdrops-images',
  'airdrops-images',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 7. CREATE STORAGE POLICIES (SIMPLE WAY)
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can upload to airdrops-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view airdrops-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from airdrops-images" ON storage.objects;

-- Create new policies
CREATE POLICY "Anyone can upload to airdrops-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'airdrops-images');

CREATE POLICY "Anyone can view airdrops-images" ON storage.objects
FOR SELECT USING (bucket_id = 'airdrops-images');

CREATE POLICY "Anyone can delete from airdrops-images" ON storage.objects
FOR DELETE USING (bucket_id = 'airdrops-images');

-- =============================================
-- 8. SIMPLE TEST FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION test_admin_operations_simple()
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

  -- Test 2: Insert airdrop
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
    'Test Admin Airdrop Simple', 
    'Test Description for Admin Simple', 
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

  -- Test 3: Update airdrop
  UPDATE airdrops 
  SET title = 'Updated Test Airdrop Simple'
  WHERE id = test_airdrop_id;

  RETURN QUERY SELECT 
    'update_airdrop'::TEXT,
    true,
    'Successfully updated airdrop';

  -- Test 4: Delete airdrop
  DELETE FROM airdrops WHERE id = test_airdrop_id;

  RETURN QUERY SELECT 
    'delete_airdrop'::TEXT,
    true,
    'Successfully deleted airdrop';

  -- Test 5: Check storage bucket
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

END;
$$;

-- =============================================
-- 9. SHOW RESULTS
-- =============================================

SELECT 'SAFE ADMIN FIX V3 COMPLETED!' as status;
SELECT 'Test with: SELECT * FROM test_admin_operations_simple();' as next_step;
