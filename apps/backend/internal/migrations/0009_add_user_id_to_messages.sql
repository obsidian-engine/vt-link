-- +goose Up
-- +goose StatementBegin

-- WARNING: このマイグレーションは既存データがある環境では注意が必要
-- 既存のmessagesレコードは全て最初のユーザーに関連付けられます
-- 本番環境では以下を実施してください：
-- 1. 既存messagesテーブルが空であることを確認
-- 2. データがある場合、適切なuser_idマッピングスクリプトを別途実行
-- 3. このマイグレーションは新規環境用として実行

-- messagesテーブルにuser_idカラムを追加
ALTER TABLE messages
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 既存データ用のデフォルト値設定（最初のユーザーIDを使用）
-- CRITICAL: 本番環境では適切なデータマイグレーションが必要
-- 既存レコードが大量にある場合、UPDATEに時間がかかる可能性があります
-- 10万件以上の場合はバッチ処理版の使用を検討してください
UPDATE messages
SET user_id = (SELECT id FROM users LIMIT 1)
WHERE user_id IS NULL;

-- NOT NULL制約を追加
ALTER TABLE messages
ALTER COLUMN user_id SET NOT NULL;

-- インデックス追加（パフォーマンス最適化）
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- インデックス削除
DROP INDEX IF EXISTS idx_messages_user_id;

-- user_idカラム削除
ALTER TABLE messages
DROP COLUMN IF EXISTS user_id;

-- +goose StatementEnd
