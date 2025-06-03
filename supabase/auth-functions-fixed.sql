-- Admin statistics function
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_airdrops', (SELECT COUNT(*) FROM airdrops),
    'active_airdrops', (SELECT COUNT(*) FROM airdrops WHERE status = 'active'),
    'pending_verifications', (SELECT COUNT(*) FROM airdrop_verifications WHERE status = 'pending'),
    'total_participants', (SELECT COUNT(*) FROM airdrop_participants),
    'completed_participants', (SELECT COUNT(*) FROM airdrop_participants WHERE status = 'completed')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Process verification function
CREATE OR REPLACE FUNCTION process_verification(
  verification_id UUID,
  new_status TEXT,
  rejection_reason TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  verification_record RECORD;
  participant_record RECORD;
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
    
    -- Update or create participant record
    INSERT INTO airdrop_participants (airdrop_id, user_id, status, points_awarded, joined_at)
    VALUES (verification_record.airdrop_id, verification_record.user_id, 'pending', 0, NOW())
    ON CONFLICT (airdrop_id, user_id) DO NOTHING;
    
    -- Update participant points
    UPDATE airdrop_participants 
    SET points_awarded = points_awarded + task_record.points_reward
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
      ap.id,
      (SELECT COUNT(*) FROM airdrop_tasks WHERE airdrop_id = verification_record.airdrop_id AND active = true),
      1,
      task_record.points_reward,
      NOW(),
      NOW()
    FROM airdrop_participants ap 
    WHERE ap.airdrop_id = verification_record.airdrop_id 
    AND ap.user_id = verification_record.user_id
    ON CONFLICT (user_id, airdrop_id) 
    DO UPDATE SET 
      completed_tasks = user_task_progress.completed_tasks + 1,
      total_points_earned = user_task_progress.total_points_earned + task_record.points_reward,
      last_activity = NOW(),
      completion_percentage = (user_task_progress.completed_tasks + 1) * 100.0 / user_task_progress.total_tasks;
  END IF;
  
  RETURN json_build_object('success', true, 'status', new_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log admin action function
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type TEXT,
  action_details JSON DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  INSERT INTO admin_logs (admin_id, action, details, created_at)
  VALUES (auth.uid(), action_type, action_details, NOW());
  
  RETURN json_build_object('success', true, 'logged_at', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION process_verification(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action(TEXT, JSON) TO authenticated;
