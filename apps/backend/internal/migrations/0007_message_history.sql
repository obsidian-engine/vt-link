-- +goose Up
-- +goose StatementBegin

CREATE TYPE message_history_status AS ENUM ('sent', 'failed', 'pending');

CREATE TABLE message_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    status message_history_status NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMP,
    recipient_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_message_history_user_id ON message_history(user_id);
CREATE INDEX idx_message_history_message_id ON message_history(message_id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS message_history;
DROP TYPE IF EXISTS message_history_status;

-- +goose StatementEnd
