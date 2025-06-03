-- Create activity_feed table for live activity tracking
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('user_action', 'system_event', 'achievement')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(type);

-- Enable RLS
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for activity_feed
CREATE POLICY "Users can view all activity" ON activity_feed
  FOR SELECT USING (true);

CREATE POLICY "System can insert activity" ON activity_feed
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT SELECT ON activity_feed TO authenticated;
GRANT SELECT ON activity_feed TO anon;
GRANT ALL ON activity_feed TO service_role;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  user_id_param UUID,
  action_param TEXT,
  details_param TEXT,
  type_param TEXT DEFAULT 'user_action',
  metadata_param JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO activity_feed (user_id, action, details, type, metadata)
  VALUES (user_id_param, action_param, details_param, type_param, metadata_param)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log system events
CREATE OR REPLACE FUNCTION log_system_event(
  action_param TEXT,
  details_param TEXT,
  metadata_param JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO activity_feed (user_id, action, details, type, metadata)
  VALUES (NULL, action_param, details_param, 'system_event', metadata_param)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for user registration activity
CREATE OR REPLACE FUNCTION log_user_registration() RETURNS TRIGGER AS $$
BEGIN
  PERFORM log_user_activity(
    NEW.id,
    'user_registered',
    'New user joined the platform: ' || COALESCE(NEW.email, 'Unknown'),
    'user_action',
    jsonb_build_object('email', NEW.email, 'role', NEW.role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for airdrop participation
CREATE OR REPLACE FUNCTION log_airdrop_participation() RETURNS TRIGGER AS $$
DECLARE
  airdrop_title TEXT;
BEGIN
  -- Get airdrop title
  SELECT title INTO airdrop_title FROM airdrops WHERE id = NEW.airdrop_id;
  
  PERFORM log_user_activity(
    NEW.user_id,
    'airdrop_joined',
    'Joined airdrop: ' || COALESCE(airdrop_title, 'Unknown Airdrop'),
    'user_action',
    jsonb_build_object('airdrop_id', NEW.airdrop_id, 'airdrop_title', airdrop_title)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for task completion
CREATE OR REPLACE FUNCTION log_task_completion() RETURNS TRIGGER AS $$
DECLARE
  task_title TEXT;
  airdrop_title TEXT;
BEGIN
  -- Get task and airdrop info
  SELECT at.title, a.title 
  INTO task_title, airdrop_title 
  FROM airdrop_tasks at
  JOIN airdrops a ON a.id = at.airdrop_id
  WHERE at.id = NEW.task_id;
  
  PERFORM log_user_activity(
    NEW.user_id,
    'task_submitted',
    'Submitted task: ' || COALESCE(task_title, 'Unknown Task') || ' for ' || COALESCE(airdrop_title, 'Unknown Airdrop'),
    'user_action',
    jsonb_build_object(
      'task_id', NEW.task_id, 
      'task_title', task_title,
      'airdrop_id', NEW.airdrop_id,
      'airdrop_title', airdrop_title,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for achievements
CREATE OR REPLACE FUNCTION log_achievement() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_points > OLD.total_points THEN
    PERFORM log_user_activity(
      NEW.user_id,
      'points_earned',
      'Earned ' || (NEW.total_points - OLD.total_points) || ' points! Total: ' || NEW.total_points,
      'achievement',
      jsonb_build_object(
        'points_earned', NEW.total_points - OLD.total_points,
        'total_points', NEW.total_points,
        'previous_points', OLD.total_points
      )
    );
  END IF;
  
  -- Check for rank changes
  IF NEW.current_rank != OLD.current_rank THEN
    PERFORM log_user_activity(
      NEW.user_id,
      'rank_changed',
      'Rank updated from #' || OLD.current_rank || ' to #' || NEW.current_rank,
      'achievement',
      jsonb_build_object(
        'old_rank', OLD.current_rank,
        'new_rank', NEW.current_rank
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS user_registration_activity ON profiles;
CREATE TRIGGER user_registration_activity
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_user_registration();

DROP TRIGGER IF EXISTS airdrop_participation_activity ON airdrop_participants;
CREATE TRIGGER airdrop_participation_activity
  AFTER INSERT ON airdrop_participants
  FOR EACH ROW
  EXECUTE FUNCTION log_airdrop_participation();

DROP TRIGGER IF EXISTS task_completion_activity ON airdrop_verifications;
CREATE TRIGGER task_completion_activity
  AFTER INSERT ON airdrop_verifications
  FOR EACH ROW
  EXECUTE FUNCTION log_task_completion();

DROP TRIGGER IF EXISTS achievement_activity ON user_rewards;
CREATE TRIGGER achievement_activity
  AFTER UPDATE ON user_rewards
  FOR EACH ROW
  EXECUTE FUNCTION log_achievement();

-- Insert some sample activity data
INSERT INTO activity_feed (user_id, action, details, type, metadata) VALUES
(NULL, 'system_startup', 'Real-time activity system initialized', 'system_event', '{"version": "1.0"}'),
(NULL, 'feature_launch', 'Live activity feed feature launched', 'system_event', '{"feature": "activity_feed"}');

-- Enable realtime for activity_feed table
-- Note: This needs to be done in Supabase dashboard under Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
