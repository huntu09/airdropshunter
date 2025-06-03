-- =============================================
-- PRODUCTION SCHEMA - FINAL VERSION (COMPLETE)
-- =============================================
-- Last Updated: 2025-05-30
-- Author: v0 AI Assistant
-- Description: Complete schema for Airdrops Hunter application

-- =============================================
-- EXTENSIONS & SETUP
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- PROFILES TABLE
-- Stores user profiles and roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  wallet_address TEXT,
  telegram_username TEXT,
  twitter_username TEXT,
  discord_username TEXT,
  bio TEXT,
  points INTEGER DEFAULT 0,
  completed_airdrops INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_role CHECK (role IN ('user', 'admin', 'moderator'))
);

-- AIRDROPS TABLE
-- Stores all airdrop information
CREATE TABLE IF NOT EXISTS airdrops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL,
  value TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  website_url TEXT,
  twitter_url TEXT,
  discord_url TEXT,
  telegram_url TEXT,
  requirements TEXT[],
  steps JSONB,
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AIRDROP_PARTICIPANTS TABLE
-- Tracks user participation in airdrops
CREATE TABLE IF NOT EXISTS airdrop_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airdrop_id UUID REFERENCES airdrops NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_steps JSONB DEFAULT '{}',
  submission_data JSONB,
  wallet_address TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(airdrop_id, user_id)
);

-- CATEGORIES TABLE
-- Stores airdrop categories
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

-- ADMIN_LOGS TABLE
-- Audit trail for admin actions
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_REWARDS TABLE
-- Tracks user rewards and points
CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  reward_type TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  description TEXT,
  airdrop_id UUID REFERENCES airdrops,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FEEDBACK TABLE
-- User feedback on airdrops
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  airdrop_id UUID REFERENCES airdrops NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, airdrop_id)
);

-- NEWSLETTER_SUBSCRIBERS TABLE
-- Email newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrops ENABLE ROW LEVEL SECURITY;
ALTER TABLE airdrop_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for airdrops (more flexible)
CREATE POLICY "Anyone can view active airdrops" ON airdrops FOR SELECT USING (status = 'active' OR status = 'completed');
CREATE POLICY "Admins can view all airdrops" ON airdrops FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage airdrops" ON airdrops FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for participants
CREATE POLICY "Users can view their participation" ON airdrop_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can join airdrops" ON airdrop_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their participation" ON airdrop_participants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all participants" ON airdrop_participants FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage participants" ON airdrop_participants FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for categories
CREATE POLICY "Anyone can view active categories" ON categories FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for admin logs
CREATE POLICY "Admins can view logs" ON admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert logs" ON admin_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for user rewards
CREATE POLICY "Users can view their rewards" ON user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage rewards" ON user_rewards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for feedback
CREATE POLICY "Users can view their feedback" ON feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their feedback" ON feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their feedback" ON feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all feedback" ON feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for newsletter subscribers
CREATE POLICY "Admins can view subscribers" ON newsletter_subscribers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

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
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_admins', (SELECT COUNT(*) FROM profiles WHERE role = 'admin'),
    'total_airdrops', (SELECT COUNT(*) FROM airdrops),
    'active_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'active'),
    'pending_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'pending'),
    'completed_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'completed'),
    'total_participants', (SELECT COUNT(*) FROM airdrop_participants),
    'new_users_today', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE),
    'new_users_week', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'new_users_month', (SELECT COUNT(*) FROM profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'featured_airdrops', (SELECT COUNT(*) FROM airdrops WHERE featured = true),
    'total_points_awarded', (SELECT COALESCE(SUM(points), 0) FROM user_rewards)
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Function to update airdrop participants count
CREATE OR REPLACE FUNCTION update_airdrop_participants_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE airdrops
    SET participants_count = participants_count + 1
    WHERE id = NEW.airdrop_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE airdrops
    SET participants_count = participants_count - 1
    WHERE id = OLD.airdrop_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to award points to users
CREATE OR REPLACE FUNCTION award_user_points(
  user_id_param UUID,
  points_param INTEGER,
  description_param TEXT,
  airdrop_id_param UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Add points to user_rewards table
  INSERT INTO user_rewards (user_id, reward_type, points, description, airdrop_id)
  VALUES (user_id_param, 'points', points_param, description_param, airdrop_id_param);
  
  -- Update user's total points
  UPDATE profiles
  SET points = points + points_param
  WHERE id = user_id_param;
END;
$$;

-- Function to mark airdrop as completed
CREATE OR REPLACE FUNCTION complete_airdrop_participation(
  user_id_param UUID,
  airdrop_id_param UUID,
  submission_data_param JSONB DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  already_completed BOOLEAN;
  points_to_award INTEGER;
BEGIN
  -- Check if already completed
  SELECT EXISTS (
    SELECT 1 FROM airdrop_participants
    WHERE user_id = user_id_param
    AND airdrop_id = airdrop_id_param
    AND status = 'completed'
  ) INTO already_completed;
  
  -- If not completed, mark as completed and award points
  IF NOT already_completed THEN
    -- Update participant status
    UPDATE airdrop_participants
    SET 
      status = 'completed',
      completed_at = NOW(),
      submission_data = submission_data_param
    WHERE 
      user_id = user_id_param AND
      airdrop_id = airdrop_id_param;
    
    -- Determine points based on difficulty
    SELECT 
      CASE 
        WHEN difficulty_level = 'easy' THEN 10
        WHEN difficulty_level = 'medium' THEN 25
        WHEN difficulty_level = 'hard' THEN 50
        ELSE 10
      END INTO points_to_award
    FROM airdrops
    WHERE id = airdrop_id_param;
    
    -- Award points
    PERFORM award_user_points(
      user_id_param,
      points_to_award,
      'Completed airdrop participation',
      airdrop_id_param
    );
    
    -- Update user's completed airdrops count
    UPDATE profiles
    SET completed_airdrops = completed_airdrops + 1
    WHERE id = user_id_param;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin_user BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id_param AND role = 'admin'
  ) INTO is_admin_user;
  
  RETURN is_admin_user;
END;
$$;

-- Function to promote user to admin
CREATE OR REPLACE FUNCTION promote_to_admin(email_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE email = email_param
  ) INTO user_exists;
  
  IF user_exists THEN
    -- Update user role to admin
    UPDATE profiles
    SET role = 'admin'
    WHERE email = email_param;
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
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
  SET views_count = views_count + 1
  WHERE id = airdrop_id_param;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_participant_change
  AFTER INSERT OR DELETE ON airdrop_participants
  FOR EACH ROW EXECUTE FUNCTION update_airdrop_participants_count();

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

-- Make asuszenfonelivea3@gmail.com an admin if they exist
DO $$
BEGIN
  PERFORM promote_to_admin('asuszenfonelivea3@gmail.com');
EXCEPTION WHEN OTHERS THEN
  -- Do nothing if error
END $$;

-- =============================================
-- PERMISSIONS
-- =============================================

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
