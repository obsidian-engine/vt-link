-- VTube LINE Manager Database Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE rich_menu_size AS ENUM ('full', 'half');
CREATE TYPE message_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
CREATE TYPE reply_rule_status AS ENUM ('active', 'inactive');

-- Users table (LINE Login integration)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    line_user_id VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(255),
    role user_role DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LINE Official Accounts
CREATE TABLE line_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel_id VARCHAR(20) UNIQUE NOT NULL,
    channel_secret VARCHAR(100) NOT NULL,
    channel_access_token TEXT NOT NULL,
    webhook_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rich Menus
CREATE TABLE rich_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES line_accounts(id) ON DELETE CASCADE,
    line_rich_menu_id VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    size rich_menu_size DEFAULT 'full',
    chat_bar_text VARCHAR(14),
    areas JSONB NOT NULL DEFAULT '[]',
    image_url VARCHAR(255),
    is_default BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto Reply Rules (Enhanced for Clean Architecture)
CREATE TABLE auto_reply_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES line_accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    conditions JSONB NOT NULL DEFAULT '[]',
    responses JSONB NOT NULL DEFAULT '[]',
    enabled BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    rate_limit JSONB,
    time_window JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reply Logs (for tracking bot responses)
CREATE TABLE reply_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES line_accounts(id) ON DELETE CASCADE,
    rule_id UUID NOT NULL REFERENCES auto_reply_rules(id) ON DELETE CASCADE,
    message_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    source_type VARCHAR(10) NOT NULL,
    source_id VARCHAR(50) NOT NULL,
    response_content JSONB NOT NULL,
    replied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate Limit Entries (for rate limiting)
CREATE TABLE rate_limit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Campaigns (Broadcast/Push messages)
CREATE TABLE message_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES line_accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    message_type VARCHAR(20) NOT NULL DEFAULT 'broadcast',
    content JSONB NOT NULL,
    target_users TEXT[],
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status message_status DEFAULT 'draft',
    error_message TEXT,
    sent_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message Logs (for analytics)
CREATE TABLE message_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES line_accounts(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES message_campaigns(id) ON DELETE SET NULL,
    user_line_id VARCHAR(50),
    message_type VARCHAR(20),
    content_preview TEXT,
    status VARCHAR(20),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX idx_users_line_user_id ON users(line_user_id);
CREATE INDEX idx_line_accounts_user_id ON line_accounts(user_id);
CREATE INDEX idx_line_accounts_channel_id ON line_accounts(channel_id);
CREATE INDEX idx_rich_menus_account_id ON rich_menus(account_id);
CREATE INDEX idx_rich_menus_is_default ON rich_menus(account_id, is_default) WHERE is_default = true;
CREATE INDEX idx_auto_reply_rules_account_id ON auto_reply_rules(account_id);
CREATE INDEX idx_auto_reply_rules_enabled ON auto_reply_rules(account_id, enabled) WHERE enabled = true;
CREATE INDEX idx_auto_reply_rules_priority ON auto_reply_rules(account_id, priority DESC);
CREATE INDEX idx_reply_logs_account_id ON reply_logs(account_id);
CREATE INDEX idx_reply_logs_rule_id ON reply_logs(rule_id);
CREATE INDEX idx_reply_logs_replied_at ON reply_logs(replied_at DESC);
CREATE INDEX idx_rate_limit_entries_key_created ON rate_limit_entries(key, created_at);

-- Create GIN indexes for JSONB fields
CREATE INDEX idx_auto_reply_rules_conditions ON auto_reply_rules USING GIN(conditions);
CREATE INDEX idx_auto_reply_rules_responses ON auto_reply_rules USING GIN(responses);
CREATE INDEX idx_auto_reply_rules_account_id ON auto_reply_rules(account_id);
CREATE INDEX idx_auto_reply_rules_status ON auto_reply_rules(account_id, status) WHERE status = 'active';
CREATE INDEX idx_auto_reply_keywords ON auto_reply_rules USING gin(keywords);
CREATE INDEX idx_message_campaigns_account_id ON message_campaigns(account_id);
CREATE INDEX idx_message_campaigns_status ON message_campaigns(status);
CREATE INDEX idx_message_campaigns_scheduled ON message_campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_message_logs_account_id ON message_logs(account_id);
CREATE INDEX idx_message_logs_sent_at ON message_logs(sent_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_line_accounts_updated_at BEFORE UPDATE ON line_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rich_menus_updated_at BEFORE UPDATE ON rich_menus FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auto_reply_rules_updated_at BEFORE UPDATE ON auto_reply_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_campaigns_updated_at BEFORE UPDATE ON message_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rich_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_reply_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view their own profile" ON users FOR ALL USING (line_user_id = current_setting('app.current_user_line_id')::text);

-- Account access policies
CREATE POLICY "Users can manage their accounts" ON line_accounts FOR ALL USING (user_id IN (
    SELECT id FROM users WHERE line_user_id = current_setting('app.current_user_line_id')::text
));

-- Rich menu access policies  
CREATE POLICY "Users can manage their rich menus" ON rich_menus FOR ALL USING (account_id IN (
    SELECT la.id FROM line_accounts la 
    JOIN users u ON la.user_id = u.id 
    WHERE u.line_user_id = current_setting('app.current_user_line_id')::text
));

-- Auto reply rules access policies
CREATE POLICY "Users can manage their reply rules" ON auto_reply_rules FOR ALL USING (account_id IN (
    SELECT la.id FROM line_accounts la 
    JOIN users u ON la.user_id = u.id 
    WHERE u.line_user_id = current_setting('app.current_user_line_id')::text
));

-- Message campaigns access policies
CREATE POLICY "Users can manage their campaigns" ON message_campaigns FOR ALL USING (account_id IN (
    SELECT la.id FROM line_accounts la 
    JOIN users u ON la.user_id = u.id 
    WHERE u.line_user_id = current_setting('app.current_user_line_id')::text
));

-- Message logs access policies
CREATE POLICY "Users can view their message logs" ON message_logs FOR SELECT USING (account_id IN (
    SELECT la.id FROM line_accounts la 
    JOIN users u ON la.user_id = u.id 
    WHERE u.line_user_id = current_setting('app.current_user_line_id')::text
));

-- Insert sample data for development
INSERT INTO users (line_user_id, display_name, role) VALUES 
('sample_user_001', 'Sample VTuber', 'admin');

-- Comments for documentation
COMMENT ON TABLE users IS 'LINE Login integrated user accounts';
COMMENT ON TABLE line_accounts IS 'LINE Official Account configurations';  
COMMENT ON TABLE rich_menus IS 'Rich menu configurations with layout data';
COMMENT ON TABLE auto_reply_rules IS 'Keyword-based auto reply configurations';
COMMENT ON TABLE message_campaigns IS 'Broadcast and push message campaigns';
COMMENT ON TABLE message_logs IS 'Message delivery logs for analytics';