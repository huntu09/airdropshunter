-- Fix function log_achievement untuk handle missing total_points column
CREATE OR REPLACE FUNCTION log_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if we're dealing with a table that has total_points column
  -- Only proceed if the table actually has the total_points column
  
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = TG_TABLE_NAME 
    AND table_schema = TG_TABLE_SCHEMA
    AND column_name = 'total_points'
  ) THEN
    
    -- Check for points changes (only if total_points column exists)
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
    
    -- Check for rank changes (only if current_rank column exists)
    IF EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = TG_TABLE_NAME 
      AND table_schema = TG_TABLE_SCHEMA
      AND column_name = 'current_rank'
    ) AND NEW.current_rank != OLD.current_rank THEN
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
    
  END IF;
  
  -- Always return NEW regardless of whether we processed achievements
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_achievement() TO authenticated;
GRANT EXECUTE ON FUNCTION log_achievement() TO anon;
