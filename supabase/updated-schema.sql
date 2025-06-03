-- Updated Airdrops table schema for better consistency
-- Drop existing table and recreate with proper structure

DROP TABLE IF EXISTS airdrops CASCADE;

CREATE TABLE airdrops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  reward_amount TEXT NOT NULL,
  reward_type TEXT DEFAULT 'token' CHECK (reward_type IN ('token', 'nft', 'other')),
  blockchain TEXT DEFAULT 'ethereum',
  difficulty_level TEXT DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
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
  views_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated Categories table
DROP TABLE IF EXISTS categories CASCADE;

CREATE TABLE categories (
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

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('DeFi', 'defi', 'Decentralized Finance projects', 'coins', '#10B981', 1),
('NFT', 'nft', 'Non-Fungible Token projects', 'image', '#8B5CF6', 2),
('Gaming', 'gaming', 'Blockchain gaming projects', 'gamepad-2', '#F59E0B', 3),
('Layer 1', 'layer1', 'Layer 1 blockchain projects', 'layers', '#3B82F6', 4),
('Layer 2', 'layer2', 'Layer 2 scaling solutions', 'zap', '#06B6D4', 5),
('AI', 'ai', 'Artificial Intelligence projects', 'brain', '#EC4899', 6),
('Social', 'social', 'Social media and community projects', 'users', '#EF4444', 7),
('Other', 'other', 'Other blockchain projects', 'more-horizontal', '#6B7280', 8);

-- Updated Airdrop Tasks table
DROP TABLE IF EXISTS airdrop_tasks CASCADE;

CREATE TABLE airdrop_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('social_follow', 'social_like', 'social_share', 'join_discord', 'join_telegram', 'visit_website', 'connect_wallet', 'hold_token', 'custom')),
  required BOOLEAN DEFAULT TRUE,
  points_reward INTEGER DEFAULT 0,
  verification_method TEXT DEFAULT 'automatic' CHECK (verification_method IN ('automatic', 'manual', 'api')),
  task_data JSONB,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated User Task Progress table
DROP TABLE IF EXISTS user_task_progress CASCADE;

CREATE TABLE user_task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  airdrop_id UUID REFERENCES airdrops(id) ON DELETE CASCADE,
  task_id UUID REFERENCES airdrop_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  submission_data JSONB,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Create indexes for better performance
CREATE INDEX idx_airdrops_status ON airdrops(status);
CREATE INDEX idx_airdrops_category ON airdrops(category);
CREATE INDEX idx_airdrops_featured ON airdrops(featured);
CREATE INDEX idx_airdrops_created_at ON airdrops(created_at);
CREATE INDEX idx_airdrop_tasks_airdrop_id ON airdrop_tasks(airdrop_id);
CREATE INDEX idx_user_task_progress_user_id ON user_task_progress(user_id);
CREATE INDEX idx_user_task_progress_airdrop_id ON user_task_progress(airdrop_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_airdrops_updated_at BEFORE UPDATE ON airdrops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_airdrop_tasks_updated_at BEFORE UPDATE ON airdrop_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
