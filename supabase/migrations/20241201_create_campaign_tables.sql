-- Campaign Bounded Context用のテーブル定義
-- メッセージ配信機能の実装に必要なテーブルを作成

-- ============================================================================
-- 1. メッセージテンプレート管理テーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL DEFAULT 'other',
  content JSONB NOT NULL DEFAULT '[]',
  placeholders TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_message_templates_account_id ON message_templates(account_id);
CREATE INDEX idx_message_templates_category ON message_templates(account_id, category);
CREATE INDEX idx_message_templates_usage_count ON message_templates(account_id, usage_count DESC);

-- ============================================================================
-- 2. 配信対象セグメント管理テーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS target_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  estimated_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_target_segments_account_id ON target_segments(account_id);
CREATE INDEX idx_target_segments_estimated_count ON target_segments(account_id, estimated_count DESC);

-- ============================================================================
-- 3. LINEユーザー管理テーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS line_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(255) NOT NULL,
  line_user_id VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  picture_url TEXT,
  status_message TEXT,
  language VARCHAR(10) DEFAULT 'ja',
  gender VARCHAR(20),
  age INTEGER,
  region VARCHAR(10),
  is_friend BOOLEAN DEFAULT true,
  blocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(account_id, line_user_id)
);

-- インデックス
CREATE INDEX idx_line_users_account_id ON line_users(account_id);
CREATE INDEX idx_line_users_account_friend ON line_users(account_id, is_friend, blocked_at);
CREATE INDEX idx_line_users_demographic ON line_users(account_id, gender, age, region) WHERE is_friend = true AND blocked_at IS NULL;

-- ============================================================================
-- 4. メッセージキャンペーン管理テーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('broadcast', 'narrowcast')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  content JSONB NOT NULL DEFAULT '[]',
  template_id UUID REFERENCES message_templates(id),
  segment_id UUID REFERENCES target_segments(id),
  placeholder_data JSONB DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  estimated_recipients INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_campaigns_account_id ON campaigns(account_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(status, scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_campaigns_sent_at ON campaigns(account_id, sent_at DESC) WHERE sent_at IS NOT NULL;
CREATE INDEX idx_campaigns_template_id ON campaigns(template_id);
CREATE INDEX idx_campaigns_segment_id ON campaigns(segment_id);

-- ============================================================================
-- 5. 配信バッチ管理テーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  batch_number INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  user_ids TEXT[] NOT NULL DEFAULT '{}',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, batch_number)
);

-- インデックス
CREATE INDEX idx_delivery_batches_campaign_id ON delivery_batches(campaign_id);
CREATE INDEX idx_delivery_batches_status ON delivery_batches(status);
CREATE INDEX idx_delivery_batches_scheduled_at ON delivery_batches(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_delivery_batches_completed_at ON delivery_batches(completed_at DESC) WHERE completed_at IS NOT NULL;

-- ============================================================================
-- 6. 配信ログテーブル
-- ============================================================================
CREATE TABLE IF NOT EXISTS delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES delivery_batches(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  line_user_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'failed')),
  error_code VARCHAR(100),
  error_message TEXT,
  line_response JSONB,
  delivered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  INDEX idx_delivery_logs_batch_id (batch_id),
  INDEX idx_delivery_logs_campaign_id (campaign_id),
  INDEX idx_delivery_logs_status (status),
  INDEX idx_delivery_logs_delivered_at (delivered_at DESC),
  INDEX idx_delivery_logs_user_status (line_user_id, status, delivered_at DESC)
);

-- ============================================================================
-- 7. トリガー関数：updated_at自動更新
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_atトリガーを設定
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_target_segments_updated_at BEFORE UPDATE ON target_segments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_line_users_updated_at BEFORE UPDATE ON line_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_batches_updated_at BEFORE UPDATE ON delivery_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. RLS (Row Level Security) 設定
-- ============================================================================

-- メッセージテンプレート
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own templates" ON message_templates FOR SELECT USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can insert own templates" ON message_templates FOR INSERT WITH CHECK (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can update own templates" ON message_templates FOR UPDATE USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can delete own templates" ON message_templates FOR DELETE USING (account_id = current_setting('app.account_id'));

-- 配信対象セグメント
ALTER TABLE target_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own segments" ON target_segments FOR SELECT USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can insert own segments" ON target_segments FOR INSERT WITH CHECK (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can update own segments" ON target_segments FOR UPDATE USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can delete own segments" ON target_segments FOR DELETE USING (account_id = current_setting('app.account_id'));

-- LINEユーザー
ALTER TABLE line_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own line_users" ON line_users FOR SELECT USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can insert own line_users" ON line_users FOR INSERT WITH CHECK (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can update own line_users" ON line_users FOR UPDATE USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can delete own line_users" ON line_users FOR DELETE USING (account_id = current_setting('app.account_id'));

-- キャンペーン
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can insert own campaigns" ON campaigns FOR INSERT WITH CHECK (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (account_id = current_setting('app.account_id'));
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE USING (account_id = current_setting('app.account_id'));

-- 配信バッチ（キャンペーンの所有者のみアクセス可能）
ALTER TABLE delivery_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own batches" ON delivery_batches FOR SELECT USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = delivery_batches.campaign_id AND campaigns.account_id = current_setting('app.account_id'))
);
CREATE POLICY "Users can insert own batches" ON delivery_batches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = delivery_batches.campaign_id AND campaigns.account_id = current_setting('app.account_id'))
);
CREATE POLICY "Users can update own batches" ON delivery_batches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = delivery_batches.campaign_id AND campaigns.account_id = current_setting('app.account_id'))
);
CREATE POLICY "Users can delete own batches" ON delivery_batches FOR DELETE USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = delivery_batches.campaign_id AND campaigns.account_id = current_setting('app.account_id'))
);

-- 配信ログ（キャンペーンの所有者のみアクセス可能）
ALTER TABLE delivery_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON delivery_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = delivery_logs.campaign_id AND campaigns.account_id = current_setting('app.account_id'))
);
CREATE POLICY "Users can insert own logs" ON delivery_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = delivery_logs.campaign_id AND campaigns.account_id = current_setting('app.account_id'))
);

-- ============================================================================
-- 9. 分析用ビュー
-- ============================================================================

-- キャンペーン統計ビュー
CREATE VIEW campaign_statistics AS
SELECT 
  c.account_id,
  c.id as campaign_id,
  c.name,
  c.type,
  c.status,
  c.sent_at,
  c.sent_count,
  c.failed_count,
  (c.sent_count + c.failed_count) as total_attempted,
  CASE 
    WHEN (c.sent_count + c.failed_count) > 0 
    THEN ROUND((c.sent_count::DECIMAL / (c.sent_count + c.failed_count)) * 100, 2)
    ELSE 0 
  END as success_rate,
  COUNT(db.id) as batch_count,
  AVG(EXTRACT(EPOCH FROM (db.completed_at - db.started_at)) / 60) as avg_batch_duration_minutes
FROM campaigns c
LEFT JOIN delivery_batches db ON c.id = db.campaign_id
WHERE c.status IN ('sent', 'failed')
GROUP BY c.account_id, c.id, c.name, c.type, c.status, c.sent_at, c.sent_count, c.failed_count;

-- 月別配信統計ビュー
CREATE VIEW monthly_delivery_stats AS
SELECT 
  account_id,
  DATE_TRUNC('month', sent_at) as month,
  COUNT(*) as campaign_count,
  SUM(sent_count) as total_sent,
  SUM(failed_count) as total_failed,
  ROUND(AVG(sent_count + failed_count)) as avg_recipients_per_campaign,
  ROUND((SUM(sent_count)::DECIMAL / NULLIF(SUM(sent_count + failed_count), 0)) * 100, 2) as overall_success_rate
FROM campaigns
WHERE sent_at IS NOT NULL
GROUP BY account_id, DATE_TRUNC('month', sent_at)
ORDER BY account_id, month DESC;

-- ============================================================================
-- 10. 初期データ挿入（サンプルデータ）
-- ============================================================================

-- サンプルメッセージテンプレート
INSERT INTO message_templates (account_id, name, description, category, content, placeholders) VALUES 
('demo-account-id', 'お知らせテンプレート', '一般的なお知らせ用テンプレート', 'notification', 
 '[{"type":"text","payload":{"text":"{{userName}}様\n\n{{title}}\n\n{{content}}\n\nご不明な点がございましたらお気軽にお問い合わせください。"}}]', 
 ARRAY['userName', 'title', 'content']),
('demo-account-id', 'キャンペーン告知', 'プロモーション用テンプレート', 'promotion', 
 '[{"type":"text","payload":{"text":"🎉 {{campaignTitle}} 🎉\n\n{{description}}\n\n期間：{{period}}\n詳細：{{url}}"}}]', 
 ARRAY['campaignTitle', 'description', 'period', 'url']);

-- サンプル配信セグメント
INSERT INTO target_segments (account_id, name, description, criteria, estimated_count) VALUES 
('demo-account-id', '20代女性', '20代の女性ユーザー', 
 '{"genders":["female"],"ageRange":{"min":20,"max":29}}', 150),
('demo-account-id', '関東エリア', '関東地方のユーザー', 
 '{"regions":["JP-13","JP-14","JP-11","JP-12","JP-08","JP-09","JP-10"]}', 320),
('demo-account-id', 'VIPユーザー', '高活動ユーザー（カスタム条件）', 
 '{"custom":{"activity_level":"high","last_interaction_days":7}}', 80);

-- コメント
COMMENT ON TABLE message_templates IS 'メッセージテンプレート管理テーブル';
COMMENT ON TABLE target_segments IS '配信対象セグメント管理テーブル';
COMMENT ON TABLE line_users IS 'LINEユーザー管理テーブル';
COMMENT ON TABLE campaigns IS 'メッセージキャンペーン管理テーブル';
COMMENT ON TABLE delivery_batches IS '配信バッチ管理テーブル';
COMMENT ON TABLE delivery_logs IS '配信ログテーブル';