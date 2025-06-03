-- Create audit_logs table for tracking all admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Create function to automatically log changes
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be attached to tables to automatically log changes
    INSERT INTO audit_logs (
        user_id,
        user_email,
        action,
        resource_type,
        resource_id,
        old_values,
        new_values,
        created_at
    ) VALUES (
        auth.uid(),
        COALESCE(auth.email(), 'system'),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id::text, OLD.id::text),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers to important tables (optional - can be enabled per table)
-- CREATE TRIGGER audit_airdrops_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON airdrops
--     FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- CREATE TRIGGER audit_profiles_trigger
--     AFTER INSERT OR UPDATE OR DELETE ON profiles
--     FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Add enhanced validation functions
CREATE OR REPLACE FUNCTION validate_airdrop_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date <= NEW.start_date THEN
        RAISE EXCEPTION 'End date must be after start date';
    END IF;
    
    IF NEW.start_date < NOW() AND OLD.start_date IS NULL THEN
        RAISE EXCEPTION 'Start date cannot be in the past for new airdrops';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for airdrop date validation
CREATE TRIGGER validate_airdrop_dates_trigger
    BEFORE INSERT OR UPDATE ON airdrops
    FOR EACH ROW EXECUTE FUNCTION validate_airdrop_dates();

-- Add function for duplicate detection
CREATE OR REPLACE FUNCTION check_duplicate_airdrop_title()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM airdrops 
        WHERE LOWER(title) = LOWER(NEW.title) 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
        AND status != 'cancelled'
    ) THEN
        RAISE EXCEPTION 'An airdrop with this title already exists';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for duplicate title detection
CREATE TRIGGER check_duplicate_airdrop_title_trigger
    BEFORE INSERT OR UPDATE ON airdrops
    FOR EACH ROW EXECUTE FUNCTION check_duplicate_airdrop_title();

-- Add function for username validation
CREATE OR REPLACE FUNCTION validate_username()
RETURNS TRIGGER AS $$
BEGIN
    -- Check username format
    IF NEW.username !~ '^[a-zA-Z0-9_]{3,30}$' THEN
        RAISE EXCEPTION 'Username must be 3-30 characters and contain only letters, numbers, and underscores';
    END IF;
    
    -- Check for duplicate username
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE LOWER(username) = LOWER(NEW.username) 
        AND id != NEW.id
    ) THEN
        RAISE EXCEPTION 'Username already exists';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for username validation
CREATE TRIGGER validate_username_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION validate_username();

-- Add rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for rate limiting
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON rate_limits(user_id, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);

-- Enable RLS for rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate_limits
CREATE POLICY "Users can view own rate limits" ON rate_limits
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage rate limits" ON rate_limits
    FOR ALL USING (true);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_limit INTEGER DEFAULT 10,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    current_count INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    -- Clean old entries
    DELETE FROM rate_limits 
    WHERE window_start < (NOW() - (p_window_minutes || ' minutes')::INTERVAL);
    
    -- Get current count
    SELECT COALESCE(SUM(count), 0) INTO current_count
    FROM rate_limits
    WHERE user_id = p_user_id 
    AND action = p_action 
    AND window_start >= window_start;
    
    -- Check if limit exceeded
    IF current_count >= p_limit THEN
        RETURN FALSE;
    END IF;
    
    -- Increment counter
    INSERT INTO rate_limits (user_id, action, count, window_start)
    VALUES (p_user_id, p_action, 1, NOW())
    ON CONFLICT (user_id, action) 
    DO UPDATE SET count = rate_limits.count + 1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    airdrop_alerts BOOLEAN DEFAULT true,
    verification_updates BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for notification_preferences
CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
    FOR ALL USING (user_id = auth.uid());

-- Add updated_at trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
