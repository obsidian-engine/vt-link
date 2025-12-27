-- +goose Up
-- +goose StatementBegin

CREATE TABLE auto_reply_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('follow', 'keyword')),
  name VARCHAR(50) NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  match_type VARCHAR(20) CHECK (match_type IN ('exact', 'partial')),
  reply_message TEXT NOT NULL CHECK (length(reply_message) <= 1000),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auto_reply_rules_user_id ON auto_reply_rules(user_id);
CREATE INDEX idx_auto_reply_rules_enabled ON auto_reply_rules(user_id, is_enabled, priority);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS auto_reply_rules;

-- +goose StatementEnd
