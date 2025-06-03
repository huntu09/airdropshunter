-- =============================================
-- COMPLETE FRESH SCHEMA - AIRDROPSHUNTER
-- =============================================
-- Full reset and setup for all features
-- Last Updated: 2025-05-31
-- Description: Complete schema with all features

-- =============================================
-- CLEAN SLATE - DROP EVERYTHING
-- =============================================

-- Drop all existing tables (in correct order to avoid FK conflicts)
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS user_rewards CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS user_task_progress CASCADE;
DROP TABLE IF EXISTS airdrop_verifications CASCADE;
DROP TABLE IF EXISTS airdrop_participants CASCADE;
DROP TABLE IF EXISTS airdrop_tasks CASCADE;
DROP TABLE IF EXISTS airdrops CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS get_admin_stats() CASCADE;
DROP FUNCTION IF EXISTS process_verification(UUID, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS log_admin_action(TEXT, JSON) CASCADE;
DROP FUNCTION IF EXISTS increment_airdrop_views(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- =============================================
-- EXTENSIONS & SETUP
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
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
  CONSTRAINT check_status CHECK (status IN ('active', 'banned', 'suspended', 'pending'))
);

-- CATEGORIES TABLE
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AIRDROPS TABLE
CREATE TABLE airdrops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_amount TEXT NOT NULL,
  reward_type TEXT DEFAULT 'token',
  blockchain TEXT DEFAULT 'ethereum',
  difficulty_level TEXT DEFAULT 'easy',
  estimated_time TEXT DEFAULT '5-10 minutes',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  discord_url TEXT,
  telegram_url TEXT,
  requirements TEXT[],
  max_participants INTEGER DEFAULT 1000,
  participants_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_status CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  CONSTRAINT check_difficulty CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  CONSTRAINT check_reward_type CHECK (reward_type IN ('token', 'nft', 'other'))
);

-- AIRDROP_TASKS TABLE
CREATE TABLE airdrop_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'custom',
  required BOOLEAN DEFAULT TRUE,
  points_reward INTEGER DEFAULT 0,
  verification_method TEXT DEFAULT 'manual',
  task_data JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_task_type CHECK (task_type IN (
    'social_follow', 'social_share', 'social_like', 'join_discord', 
    'join_telegram', 'visit_website', 'connect_wallet', 'hold_token', 'custom'
  )),
  CONSTRAINT check_verification_method CHECK (verification_method IN (
    'manual', 'automatic', 'api', 'screenshot'
  ))
);

-- AIRDROP_PARTICIPANTS TABLE
CREATE TABLE airdrop_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_steps JSONB DEFAULT '{}',
  submission_data JSONB DEFAULT '{}',
  wallet_address TEXT,
  points_awarded INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(airdrop_id, user_id),
  CONSTRAINT check_participant_status CHECK (status IN ('pending', 'completed', 'rejected'))
);

-- USER_TASK_PROGRESS TABLE
CREATE TABLE user_task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES airdrop_tasks(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES airdrop_participants(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  submission_data JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, airdrop_id, task_id),
  CONSTRAINT check_verification_status CHECK (verification_status IN ('pending', 'approved', 'rejected'))
);

-- AIRDROP_VERIFICATIONS TABLE
CREATE TABLE airdrop_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_id UUID REFERENCES airdrop_participants(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES airdrop_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  submission_type TEXT NOT NULL DEFAULT 'text',
  submission_data JSONB DEFAULT '{}',
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

-- ADMIN_LOGS TABLE
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_REWARDS TABLE
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'airdrop_completion',
  points INTEGER DEFAULT 0,
  description TEXT,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE SET NULL,
  task_id UUID REFERENCES airdrop_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_reward_type CHECK (type IN (
    'airdrop_completion', 'task_completion', 'referral', 'daily_login', 'social_share', 'bonus'
  ))
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
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

-- FEEDBACK TABLE
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, airdrop_id)
);

-- NEWSLETTER_SUBSCRIBERS TABLE
CREATE TABLE newsletter_subscribers (
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

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- Airdrops indexes
CREATE INDEX idx_airdrops_status ON airdrops(status);
CREATE INDEX idx_airdrops_category ON airdrops(category);
CREATE INDEX idx_airdrops_featured ON airdrops(featured);
CREATE INDEX idx_airdrops_created_at ON airdrops(created_at);
CREATE INDEX idx_airdrops_end_date ON airdrops(end_date);

-- Tasks indexes
CREATE INDEX idx_airdrop_tasks_airdrop_id ON airdrop_tasks(airdrop_id);
CREATE INDEX idx_airdrop_tasks_active ON airdrop_tasks(active);
CREATE INDEX idx_airdrop_tasks_sort_order ON airdrop_tasks(sort_order);

-- Participants indexes
CREATE INDEX idx_airdrop_participants_user_id ON airdrop_participants(user_id);
CREATE INDEX idx_airdrop_participants_airdrop_id ON airdrop_participants(airdrop_id);
CREATE INDEX idx_airdrop_participants_status ON airdrop_participants(status);

-- Progress indexes
CREATE INDEX idx_user_task_progress_user_id ON user_task_progress(user_id);
CREATE INDEX idx_user_task_progress_airdrop_id ON user_task_progress(airdrop_id);
CREATE INDEX idx_user_task_progress_completed_at ON user_task_progress(completed_at);

-- Verifications indexes
CREATE INDEX idx_airdrop_verifications_status ON airdrop_verifications(status);
CREATE INDEX idx_airdrop_verifications_user_id ON airdrop_verifications(user_id);
CREATE INDEX idx_airdrop_verifications_airdrop_id ON airdrop_verifications(airdrop_id);

-- Admin logs indexes
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

-- Categories indexes
CREATE INDEX idx_categories_active ON categories(active);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, username, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    CASE 
      WHEN NEW.email IN ('asuszenfonelivea3@gmail.com', 'admin@airdropshunter.com') THEN 'admin'
      ELSE 'user'
    END,
    'active'
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
    'active_users', (SELECT COUNT(*) FROM profiles WHERE status = 'active'),
    'total_airdrops', (SELECT COUNT(*) FROM airdrops),
    'active_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'active'),
    'pending_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'pending'),
    'completed_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'completed'),
    'total_tasks', (SELECT COUNT(*) FROM airdrop_tasks),
    'active_tasks', (SELECT COUNT(*) FROM airdrop_tasks WHERE active = true),
    'total_participants', (SELECT COUNT(*) FROM airdrop_participants),
    'completed_participants', (SELECT COUNT(*) FROM airdrop_participants WHERE status = 'completed'),
    'pending_verifications', (SELECT COUNT(*) FROM airdrop_verifications WHERE status = 'pending'),
    'approved_verifications', (SELECT COUNT(*) FROM airdrop_verifications WHERE status = 'approved'),
    'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'new_users_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_month', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'featured_airdrops', (SELECT COUNT(*) FROM airdrops WHERE featured = true),
    'total_points_awarded', (SELECT COALESCE(SUM(points), 0) FROM user_rewards),
    'newsletter_subscribers', (SELECT COUNT(*) FROM newsletter_subscribers WHERE subscribed = true)
  ) INTO stats;
  
  RETURN stats;
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

-- Function to increment airdrop views
CREATE OR REPLACE FUNCTION increment_airdrop_views(airdrop_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE airdrops
  SET views_count = views_count + 1,
      updated_at = NOW()
  WHERE id = airdrop_id_param;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin',
      false
    )
  );
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
    verified_by = auth.uid(),
    updated_at = NOW()
  WHERE id = verification_id;
  
  -- If approved, update progress and award points
  IF new_status = 'approved' THEN
    -- Get task details
    SELECT * INTO task_record 
    FROM airdrop_tasks 
    WHERE id = verification_record.task_id;
    
    -- Update user task progress
    UPDATE user_task_progress
    SET 
      completed_at = NOW(),
      verification_status = 'approved',
      verified_by = auth.uid(),
      verified_at = NOW(),
      updated_at = NOW()
    WHERE user_id = verification_record.user_id 
    AND task_id = verification_record.task_id;
    
    -- Award points
    INSERT INTO user_rewards (user_id, type, points, description, airdrop_id, task_id)
    VALUES (
      verification_record.user_id,
      'task_completion',
      COALESCE(task_record.points_reward, 0),
      'Task completed: ' || task_record.title,
      verification_record.airdrop_id,
      verification_record.task_id
    );
    
    -- Update user total points
    UPDATE profiles
    SET 
      points = points + COALESCE(task_record.points_reward, 0),
      total_points = total_points + COALESCE(task_record.points_reward, 0),
      updated_at = NOW()
    WHERE id = verification_record.user_id;
  END IF;
  
  RETURN json_build_object('success', true, 'status', new_status);
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airdrops_updated_at BEFORE UPDATE ON airdrops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airdrop_tasks_updated_at BEFORE UPDATE ON airdrop_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airdrop_participants_updated_at BEFORE UPDATE ON airdrop_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_task_progress_updated_at BEFORE UPDATE ON user_task_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_airdrop_verifications_updated_at BEFORE UPDATE ON airdrop_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles 
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any profile" ON profiles 
  FOR UPDATE USING (is_admin());

-- Categories policies
CREATE POLICY "Anyone can view active categories" ON categories 
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage categories" ON categories 
  FOR ALL USING (is_admin());

-- Airdrops policies
CREATE POLICY "Anyone can view active airdrops" ON airdrops 
  FOR SELECT USING (status IN ('active', 'completed'));

CREATE POLICY "Admins can view all airdrops" ON airdrops 
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage airdrops" ON airdrops 
  FOR ALL USING (is_admin());

CREATE POLICY "Creators can manage own airdrops" ON airdrops 
  FOR ALL USING (created_by = auth.uid());

-- Tasks policies
CREATE POLICY "Anyone can view active tasks" ON airdrop_tasks 
  FOR SELECT USING (
    active = true AND EXISTS (
      SELECT 1 FROM airdrops WHERE id = airdrop_tasks.airdrop_id AND status IN ('active', 'completed')
    )
  );

CREATE POLICY "Admins can manage tasks" ON airdrop_tasks 
  FOR ALL USING (is_admin());

-- Participants policies
CREATE POLICY "Users can view their participation" ON airdrop_participants 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join airdrops" ON airdrop_participants 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" ON airdrop_participants 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all participants" ON airdrop_participants 
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage participants" ON airdrop_participants 
  FOR ALL USING (is_admin());

-- Progress policies
CREATE POLICY "Users can view their progress" ON user_task_progress 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their progress" ON user_task_progress 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their progress" ON user_task_progress 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON user_task_progress 
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage progress" ON user_task_progress 
  FOR ALL USING (is_admin());

-- Verifications policies
CREATE POLICY "Users can view their verifications" ON airdrop_verifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verifications" ON airdrop_verifications 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their verifications" ON airdrop_verifications 
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all verifications" ON airdrop_verifications 
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage verifications" ON airdrop_verifications 
  FOR ALL USING (is_admin());

-- Admin logs policies
CREATE POLICY "Admins can view logs" ON admin_logs 
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert logs" ON admin_logs 
  FOR INSERT WITH CHECK (is_admin());

-- Rewards policies
CREATE POLICY "Users can view their rewards" ON user_rewards 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage rewards" ON user_rewards 
  FOR ALL USING (is_admin());

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage notifications" ON notifications 
  FOR ALL USING (is_admin());

-- Feedback policies
CREATE POLICY "Users can view their feedback" ON feedback 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their feedback" ON feedback 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their feedback" ON feedback 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback" ON feedback 
  FOR SELECT USING (is_admin());

-- Newsletter policies
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers 
  FOR SELECT USING (is_admin());

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Subscribers can update own subscription" ON newsletter_subscribers 
  FOR UPDATE USING (true);

-- =============================================
-- DEFAULT DATA
-- =============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('DeFi', 'defi', 'Decentralized Finance projects', 'coins', '#10B981', 1),
('NFT', 'nft', 'Non-Fungible Token projects', 'image', '#8B5CF6', 2),
('Gaming', 'gaming', 'Blockchain gaming projects', 'gamepad-2', '#F59E0B', 3),
('Layer 1', 'layer1', 'Layer 1 blockchain projects', 'layers', '#3B82F6', 4),
('Layer 2', 'layer2', 'Layer 2 scaling solutions', 'layers', '#6366F1', 5),
('Metaverse', 'metaverse', 'Virtual world projects', 'globe', '#EC4899', 6),
('Launchpad', 'launchpad', 'Token launch platforms', 'rocket', '#EF4444', 7),
('DAO', 'dao', 'Decentralized Autonomous Organizations', 'users', '#8B5CF6', 8),
('AI', 'ai', 'Artificial Intelligence projects', 'brain', '#06B6D4', 9),
('Social', 'social', 'Social and community projects', 'users', '#84CC16', 10),
('Infrastructure', 'infrastructure', 'Blockchain infrastructure projects', 'database', '#0EA5E9', 11),
('Other', 'other', 'Other blockchain projects', 'more-horizontal', '#6B7280', 12);

-- Create admin user (will be created when they first login)
-- The trigger will automatically set them as admin based on email

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
GRANT EXECUTE ON FUNCTION increment_airdrop_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'COMPLETE FRESH SCHEMA INSTALLATION FINISHED!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'All tables created successfully:';
  RAISE NOTICE '✅ profiles - User profiles and authentication';
  RAISE NOTICE '✅ categories - Airdrop categories';
  RAISE NOTICE '✅ airdrops - Main airdrop data';
  RAISE NOTICE '✅ airdrop_tasks - Tasks within airdrops';
  RAISE NOTICE '✅ airdrop_participants - User participation';
  RAISE NOTICE '✅ user_task_progress - Task completion tracking';
  RAISE NOTICE '✅ airdrop_verifications - Verification submissions';
  RAISE NOTICE '✅ admin_logs - Admin action logging';
  RAISE NOTICE '✅ user_rewards - Points and rewards system';
  RAISE NOTICE '✅ notifications - User notifications';
  RAISE NOTICE '✅ feedback - User feedback system';
  RAISE NOTICE '✅ newsletter_subscribers - Newsletter management';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions and triggers created:';
  RAISE NOTICE '✅ handle_new_user() - Auto profile creation';
  RAISE NOTICE '✅ get_admin_stats() - Dashboard statistics';
  RAISE NOTICE '✅ process_verification() - Verification workflow';
  RAISE NOTICE '✅ log_admin_action() - Admin logging';
  RAISE NOTICE '✅ increment_airdrop_views() - View tracking';
  RAISE NOTICE '✅ is_admin() - Admin role checking';
  RAISE NOTICE '';
  RAISE NOTICE 'Security features:';
  RAISE NOTICE '✅ Row Level Security enabled on all tables';
  RAISE NOTICE '✅ Proper RLS policies for users and admins';
  RAISE NOTICE '✅ Admin auto-detection for specified emails';
  RAISE NOTICE '';
  RAISE NOTICE 'Default data inserted:';
  RAISE NOTICE '✅ 12 default categories';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin emails configured:';
  RAISE NOTICE '✅ asuszenfonelivea3@gmail.com';
  RAISE NOTICE '✅ admin@airdropshunter.com';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready to use! Register with admin email to get admin access.';
  RAISE NOTICE '==============================================';
END;
$$;
