-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN line_bot_user_id VARCHAR(255);
CREATE INDEX idx_users_line_bot_user_id ON users(line_bot_user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_users_line_bot_user_id;
ALTER TABLE users DROP COLUMN IF EXISTS line_bot_user_id;
-- +goose StatementEnd
