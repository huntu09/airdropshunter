-- =============================================
-- COMPLETE SCHEMA - AIRDROPS HUNTER
-- =============================================
-- Includes all missing tables that cause errors
-- Last Updated: 2025-05-31

-- =============================================
-- EXTENSIONS & SETUP
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP EXISTING TABLES (if needed for clean install)
-- =============================================
-- Uncomment these lines if you need to recreate tables
-- DROP TABLE IF EXISTS airdrop_verifications CASCADE;
-- DROP TABLE IF EXISTS airdrop_tasks CASCADE;
-- DROP TABLE IF EXISTS user_task_progress CASCADE;
-- DROP TABLE IF EXISTS admin_logs CASCADE;

-- =============================================
-- CORE TABLES (already exist but included for completeness)
-- =============================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  avatar_url TEXT,
  wallet_address TEXT,
  telegram_username TEXT,
  twitter_username TEXT,
  discord_username TEXT,
  bio TEXT,
  points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  completed_airdrops INTEGER DEFAULT 0,
  referral_code TEXT,
  referred_by TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_role CHECK (role IN ('user', 'admin', 'moderator')),
  CONSTRAINT check_status CHECK (status IN ('active', 'banned', 'suspended'))
);

-- AIRDROPS TABLE
CREATE TABLE IF NOT EXISTS airdrops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL,
  value TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  logo_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  discord_url TEXT,
  telegram_url TEXT,
  requirements TEXT,
  steps TEXT[],
  reward_amount TEXT,
  reward_type TEXT DEFAULT 'token',
  blockchain TEXT DEFAULT 'ethereum',
  difficulty_level TEXT DEFAULT 'easy',
  estimated_time TEXT DEFAULT '5-10 minutes',
  estimated_value DECIMAL(10,2),
  featured BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_status CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  CONSTRAINT check_difficulty CHECK (difficulty_level IN ('easy', 'medium', 'hard'))
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MISSING TABLES (causing errors)
-- =============================================

-- AIRDROP_TASKS TABLE
-- Stores individual tasks within an airdrop
CREATE TABLE IF NOT EXISTS airdrop_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'custom',
  required BOOLEAN DEFAULT TRUE,
  points_reward INTEGER DEFAULT 0,
  verification_method TEXT DEFAULT 'manual',
  task_data JSONB,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_task_type CHECK (task_type IN (
    'social_follow', 'social_share', 'social_like', 'join_discord', 
    'join_telegram', 'visit_website', 'wallet_connect', 'quiz', 
    'referral', 'custom'
  )),
  CONSTRAINT check_verification_method CHECK (verification_method IN (
    'manual', 'automatic', 'api_check', 'screenshot'
  ))
);

-- AIRDROP_PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS airdrop_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_steps JSONB DEFAULT '{}',
  submission_data JSONB,
  wallet_address TEXT,
  points_awarded INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(airdrop_id, user_id),
  CONSTRAINT check_participant_status CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- AIRDROP_VERIFICATIONS TABLE
-- Stores verification submissions for airdrop tasks
CREATE TABLE IF NOT EXISTS airdrop_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES airdrop_participants(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES airdrop_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  submission_type TEXT NOT NULL DEFAULT 'text',
  submission_data JSONB,
  proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_submission_type CHECK (submission_type IN (
    'text', 'url', 'screenshot', 'wallet_address', 'social_username', 'quiz_answer'
  )),
  CONSTRAINT check_verification_status CHECK (status IN (
    'pending', 'approved', 'rejected', 'needs_review'
  ))
);

-- USER_TASK_PROGRESS TABLE
-- Tracks user progress across airdrop tasks
CREATE TABLE IF NOT EXISTS user_task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES airdrop_participants(id) ON DELETE CASCADE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  required_tasks_completed INTEGER DEFAULT 0,
  optional_tasks_completed INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0.00,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, airdrop_id)
);

-- ADMIN_LOGS TABLE (enhanced)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_REWARDS TABLE
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'airdrop_completion',
  points INTEGER DEFAULT 0,
  description TEXT,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_reward_type CHECK (type IN (
    'airdrop_completion', 'referral', 'daily_login', 'social_share'
  ))
);

-- FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, airdrop_id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_notification_type CHECK (type IN ('info', 'success', 'warning', 'error'))
);

-- NEWSLETTER_SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for airdrops
CREATE INDEX IF NOT EXISTS idx_airdrops_status ON airdrops(status);
CREATE INDEX IF NOT EXISTS idx_airdrops_category ON airdrops(category);
CREATE INDEX IF NOT EXISTS idx_airdrops_featured ON airdrops(featured);
CREATE INDEX IF NOT EXISTS idx_airdrops_created_at ON airdrops(created_at);

-- Indexes for airdrop_tasks
CREATE INDEX IF NOT EXISTS idx_airdrop_tasks_airdrop_id ON airdrop_tasks(airdrop_id);
CREATE INDEX IF NOT EXISTS idx_airdrop_tasks_active ON airdrop_tasks(active);

-- Indexes for airdrop_participants
CREATE INDEX IF NOT EXISTS idx_airdrop_participants_user_id ON airdrop_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_airdrop_participants_airdrop_id ON airdrop_participants(airdrop_id);
CREATE INDEX IF NOT EXISTS idx_airdrop_participants_status ON airdrop_participants(status);

-- Indexes for airdrop_verifications
CREATE INDEX IF NOT EXISTS idx_airdrop_verifications_status ON airdrop_verifications(status);
CREATE INDEX IF NOT EXISTS idx_airdrop_verifications_user_id ON airdrop_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_airdrop_verifications_airdrop_id ON airdrop_verifications(airdrop_id);

-- Indexes for user_task_progress
CREATE INDEX IF NOT EXISTS idx_user_task_progress_user_id ON user_task_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_task_progress_airdrop_id ON user_task_progress(airdrop_id);

-- Indexes for admin_logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Only for existing tables that need updates)
-- =============================================

-- Profiles policies (FIXED - no more infinite recursion)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user email is admin email
  RETURN (
    SELECT COALESCE(
      (SELECT email FROM auth.users WHERE id = auth.uid()) = 'asuszenfonelivea3@gmail.com',
      false
    )
  );
END;
$$;

-- Fixed policies without recursion
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Fixed admin policies using security definer function
CREATE POLICY "Admins can view all profiles" ON profiles 
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any profile" ON profiles 
  FOR UPDATE USING (is_admin());

-- Airdrops policies (update existing)
DROP POLICY IF EXISTS "Anyone can view active airdrops" ON airdrops;
DROP POLICY IF EXISTS "Admins can view all airdrops" ON airdrops;
DROP POLICY IF EXISTS "Admins can manage airdrops" ON airdrops;

CREATE POLICY "Anyone can view active airdrops" ON airdrops FOR SELECT USING (status IN ('active', 'completed'));
CREATE POLICY "Admins can view all airdrops" ON airdrops FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage airdrops" ON airdrops FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories policies (update existing)
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Note: Policies for new tables (airdrop_tasks, airdrop_verifications, etc.) 
-- will be created automatically when tables are created for the first time
-- If tables already exist, policies may already exist and cause conflicts

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email = 'asuszenfonelivea3@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_admins', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
    'total_airdrops', (SELECT COUNT(*) FROM airdrops),
    'active_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'active'),
    'pending_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'draft'),
    'completed_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'completed'),
    'total_participants', (SELECT COUNT(*) FROM airdrop_participants),
    'pending_verifications', (SELECT COUNT(*) FROM airdrop_verifications WHERE status = 'pending'),
    'completed_verifications', (SELECT COUNT(*) FROM airdrop_verifications WHERE status = 'approved'),
    'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'new_users_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_month', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'featured_airdrops', (SELECT COUNT(*) FROM airdrops WHERE featured = true),
    'total_points_awarded', (SELECT COALESCE(SUM(points), 0) FROM user_rewards)
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Function to process verification
CREATE OR REPLACE FUNCTION process_verification(
  verification_id UUID,
  new_status TEXT,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  verification_record RECORD;
  task_record RECORD;
  result JSON;
BEGIN
  -- Get verification details
  SELECT * INTO verification_record 
  FROM airdrop_verifications 
  WHERE id = verification_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Verification not found');
  END IF;
  
  -- Update verification status
  UPDATE airdrop_verifications 
  SET 
    status = new_status,
    rejection_reason = CASE WHEN new_status = 'rejected' THEN rejection_reason ELSE NULL END,
    verified_at = NOW(),
    verified_by = auth.uid()
  WHERE id = verification_id;
  
  -- If approved, update participant progress
  IF new_status = 'approved' THEN
    -- Get task details
    SELECT * INTO task_record 
    FROM airdrop_tasks 
    WHERE id = verification_record.task_id;
    
    -- Update participant points
    UPDATE airdrop_participants 
    SET points_awarded = points_awarded + COALESCE(task_record.points_reward, 0)
    WHERE airdrop_id = verification_record.airdrop_id 
    AND user_id = verification_record.user_id;
    
    -- Update user task progress
    INSERT INTO user_task_progress (
      user_id, airdrop_id, participant_id, total_tasks, completed_tasks, 
      total_points_earned, started_at, last_activity
    )
    SELECT 
      verification_record.user_id,
      verification_record.airdrop_id,
      verification_record.participant_id,
      (SELECT COUNT(*) FROM airdrop_tasks WHERE airdrop_id = verification_record.airdrop_id AND active = true),
      1,
      COALESCE(task_record.points_reward, 0),
      NOW(),
      NOW()
    ON CONFLICT (user_id, airdrop_id) 
    DO UPDATE SET 
      completed_tasks = user_task_progress.completed_tasks + 1,
      total_points_earned = user_task_progress.total_points_earned + COALESCE(task_record.points_reward, 0),
      last_activity = NOW(),
      completion_percentage = (user_task_progress.completed_tasks + 1) * 100.0 / user_task_progress.total_tasks;
  END IF;
  
  RETURN json_build_object('success', true, 'status', new_status);
END;
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type TEXT,
  action_details JSON DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_logs (admin_id, action, details, created_at)
  VALUES (auth.uid(), action_type, action_details, NOW());
  
  RETURN json_build_object('success', true, 'logged_at', NOW());
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- POLICIES FOR NEW TABLES (Only if tables are newly created)
-- =============================================

-- Check if policies need to be created for new tables
DO $$
BEGIN
  -- Only create policies if table was just created (no existing policies)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'airdrop_tasks') THEN
    -- Airdrop tasks policies
    EXECUTE 'CREATE POLICY "Anyone can view active tasks" ON airdrop_tasks FOR SELECT USING (
      active = true AND EXISTS (
        SELECT 1 FROM airdrops WHERE id = airdrop_tasks.airdrop_id AND status IN (''active'', ''completed'')
      )
    )';
    EXECUTE 'CREATE POLICY "Admins can manage tasks" ON airdrop_tasks FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'airdrop_verifications') THEN
    -- Airdrop verifications policies
    EXECUTE 'CREATE POLICY "Users can view their verifications" ON airdrop_verifications FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can submit verifications" ON airdrop_verifications FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update their verifications" ON airdrop_verifications FOR UPDATE USING (auth.uid() = user_id AND status = ''pending'')';
    EXECUTE 'CREATE POLICY "Admins can view all verifications" ON airdrop_verifications FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
    EXECUTE 'CREATE POLICY "Admins can manage verifications" ON airdrop_verifications FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_task_progress') THEN
    -- User task progress policies
    EXECUTE 'CREATE POLICY "Users can view their progress" ON user_task_progress FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update their progress" ON user_task_progress FOR UPDATE USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can insert their progress" ON user_task_progress FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins can view all progress" ON user_task_progress FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_logs') THEN
    -- Admin logs policies
    EXECUTE 'CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
    EXECUTE 'CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_rewards') THEN
    -- User rewards policies
    EXECUTE 'CREATE POLICY "Users can view their rewards" ON user_rewards FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins can manage rewards" ON user_rewards FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback') THEN
    -- Feedback policies
    EXECUTE 'CREATE POLICY "Users can view their feedback" ON feedback FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can insert their feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update their feedback" ON feedback FOR UPDATE USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins can view all feedback" ON feedback FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications') THEN
    -- Notifications policies
    EXECUTE 'CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id)';
    EXECUTE 'CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscribers') THEN
    -- Newsletter subscribers policies
    EXECUTE 'CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
    EXECUTE 'CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true)';
  END IF;

END;
$$;

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
('DeFi', 'defi', 'Decentralized Finance projects', 'coins', '#10B981'),
('NFT', 'nft', 'Non-Fungible Token projects', 'image', '#8B5CF6'),
('Gaming', 'gaming', 'Blockchain gaming projects', 'gamepad-2', '#F59E0B'),
('Layer 2', 'layer2', 'Layer 2 scaling solutions', 'layers', '#3B82F6'),
('Metaverse', 'metaverse', 'Virtual world projects', 'globe', '#EC4899'),
('Launchpad', 'launchpad', 'Token launch platforms', 'rocket', '#EF4444'),
('DAO', 'dao', 'Decentralized Autonomous Organizations', 'users', '#6366F1'),
('Infrastructure', 'infrastructure', 'Blockchain infrastructure projects', 'database', '#0EA5E9')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- PERMISSIONS
-- =============================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific function permissions
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION process_verification(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, JSON) TO authenticated;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'COMPLETE SCHEMA INSTALLATION FINISHED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '- profiles';
  RAISE NOTICE '- airdrops';
  RAISE NOTICE '- categories';
  RAISE NOTICE '- airdrop_tasks';
  RAISE NOTICE '- airdrop_participants';
  RAISE NOTICE '- airdrop_verifications';
  RAISE NOTICE '- user_task_progress';
  RAISE NOTICE '- admin_logs';
  RAISE NOTICE '- user_rewards';
  RAISE NOTICE '- feedback';
  RAISE NOTICE '- notifications';
  RAISE NOTICE '- newsletter_subscribers';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions created:';
  RAISE NOTICE '- get_admin_stats()';
  RAISE NOTICE '- process_verification()';
  RAISE NOTICE '- log_admin_action()';
  RAISE NOTICE '- handle_new_user()';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies enabled for all tables';
  RAISE NOTICE 'Indexes created for performance';
  RAISE NOTICE 'Default categories inserted';
  RAISE NOTICE '==============================================';
END;
$$;
