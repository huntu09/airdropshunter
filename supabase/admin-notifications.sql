-- Create admin_notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view notifications" ON admin_notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications" ON admin_notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Function to create admin notification
CREATE OR REPLACE FUNCTION create_admin_notification(
  title_param TEXT,
  message_param TEXT,
  type_param TEXT DEFAULT 'info'
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO admin_notifications (title, message, type)
  VALUES (title_param, message_param, type_param)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to create notification when new verification is submitted
CREATE OR REPLACE FUNCTION notify_admin_on_verification() RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_admin_notification(
    'New Verification Submission',
    'A new task verification has been submitted and requires review.',
    'info'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new verifications
DROP TRIGGER IF EXISTS verification_notification_trigger ON airdrop_verifications;
CREATE TRIGGER verification_notification_trigger
  AFTER INSERT ON airdrop_verifications
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION notify_admin_on_verification();

-- Trigger function to create notification when new user registers
CREATE OR REPLACE FUNCTION notify_admin_on_new_user() RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_admin_notification(
    'New User Registration',
    'A new user has registered: ' || NEW.email,
    'info'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS new_user_notification_trigger ON profiles;
CREATE TRIGGER new_user_notification_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_new_user();
