-- +goose Up
-- +goose StatementBegin
ALTER TABLE campaigns ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE campaigns DROP COLUMN sent_at;
-- +goose StatementEnd