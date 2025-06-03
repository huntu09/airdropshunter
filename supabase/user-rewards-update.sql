-- Update user_rewards table to support completed airdrops
ALTER TABLE user_rewards 
ADD COLUMN IF NOT EXISTS airdrop_id TEXT,
ADD COLUMN IF NOT EXISTS airdrop_title TEXT,
ADD COLUMN IF NOT EXISTS airdrop_logo TEXT,
ADD COLUMN IF NOT EXISTS airdrop_reward TEXT;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_rewards_airdrop_id ON user_rewards(airdrop_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_type ON user_rewards(type);

-- Update profiles table to track completed airdrops
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_airdrops INTEGER DEFAULT 0;
