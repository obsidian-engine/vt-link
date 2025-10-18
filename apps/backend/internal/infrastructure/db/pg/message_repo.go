package pg

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
)

type MessageRepository struct {
	db *db.DB
}

func NewMessageRepository(db *db.DB) repository.MessageRepository {
	return &MessageRepository{db: db}
}

func (r *MessageRepository) Create(ctx context.Context, message *model.Message) error {
	query := `
		INSERT INTO messages (id, title, message, status, scheduled_at, sent_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	executor := db.GetExecutor(ctx, r.db)
	_, err := executor.ExecContext(ctx, query,
		message.ID,
		message.Title,
		message.Body,
		message.Status,
		message.ScheduledAt,
		message.SentAt,
		message.CreatedAt,
		message.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create message: %w", err)
	}

	return nil
}

func (r *MessageRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.Message, error) {
	query := `
		SELECT id, title, message, status, scheduled_at, sent_at, created_at, updated_at
		FROM messages
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var message model.Message
	err := sqlx.GetContext(ctx, executor, &message, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("message not found")
		}
		return nil, fmt.Errorf("failed to find message: %w", err)
	}

	return &message, nil
}

func (r *MessageRepository) List(ctx context.Context, limit, offset int) ([]*model.Message, error) {
	query := `
		SELECT id, title, message, status, scheduled_at, sent_at, created_at, updated_at
		FROM messages
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	executor := db.GetExecutor(ctx, r.db)

	var messages []*model.Message
	err := sqlx.SelectContext(ctx, executor, &messages, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list messages: %w", err)
	}

	return messages, nil
}

func (r *MessageRepository) Update(ctx context.Context, message *model.Message) error {
	query := `
		UPDATE messages
		SET title = $2, message = $3, status = $4, scheduled_at = $5, sent_at = $6, updated_at = $7
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query,
		message.ID,
		message.Title,
		message.Body,
		message.Status,
		message.ScheduledAt,
		message.SentAt,
		message.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update message: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("message not found")
	}

	return nil
}

func (r *MessageRepository) FindScheduledMessages(ctx context.Context, until time.Time, limit int) ([]*model.Message, error) {
	query := `
		SELECT id, title, message, status, scheduled_at, sent_at, created_at, updated_at
		FROM messages
		WHERE status = 'scheduled' AND scheduled_at <= $1
		ORDER BY scheduled_at ASC
		LIMIT $2
	`

	executor := db.GetExecutor(ctx, r.db)

	var messages []*model.Message
	err := sqlx.SelectContext(ctx, executor, &messages, query, until, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to find scheduled messages: %w", err)
	}

	return messages, nil
}
