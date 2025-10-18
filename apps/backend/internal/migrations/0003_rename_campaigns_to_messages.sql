-- +goose Up
-- +goose StatementBegin

-- テーブル名を campaigns から messages にリネーム
ALTER TABLE campaigns RENAME TO messages;

-- インデックス名もリネーム
ALTER INDEX idx_campaigns_status RENAME TO idx_messages_status;
ALTER INDEX idx_campaigns_scheduled_at RENAME TO idx_messages_scheduled_at;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- ロールバック時は逆の操作
ALTER TABLE messages RENAME TO campaigns;

ALTER INDEX idx_messages_status RENAME TO idx_campaigns_status;
ALTER INDEX idx_messages_scheduled_at RENAME TO idx_campaigns_scheduled_at;

-- +goose StatementEnd
