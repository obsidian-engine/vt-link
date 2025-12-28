package pg

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
)

type MessageHistoryRepository struct {
	db *db.DB
}

func NewMessageHistoryRepository(db *db.DB) repository.MessageHistoryRepository {
	return &MessageHistoryRepository{db: db}
}

func (r *MessageHistoryRepository) Create(ctx context.Context, history *model.MessageHistory) error {
	query := `
		INSERT INTO message_history (id, user_id, message_id, status, sent_at, recipient_count, error_message, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	executor := db.GetExecutor(ctx, r.db)
	_, err := executor.ExecContext(ctx, query,
		history.ID,
		history.UserID,
		history.MessageID,
		history.Status,
		history.SentAt,
		history.RecipientCount,
		history.ErrorMessage,
		history.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create message history: %w", err)
	}

	return nil
}

func (r *MessageHistoryRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.MessageHistory, error) {
	query := `
		SELECT id, user_id, message_id, status, sent_at, recipient_count, error_message, created_at
		FROM message_history
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var history model.MessageHistory
	err := sqlx.GetContext(ctx, executor, &history, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("message history not found")
		}
		return nil, fmt.Errorf("failed to find message history: %w", err)
	}

	return &history, nil
}

func (r *MessageHistoryRepository) ListByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*model.MessageHistory, error) {
	query := `
		SELECT id, user_id, message_id, status, sent_at, recipient_count, error_message, created_at
		FROM message_history
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	executor := db.GetExecutor(ctx, r.db)

	var histories []*model.MessageHistory
	err := sqlx.SelectContext(ctx, executor, &histories, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list message history: %w", err)
	}

	return histories, nil
}

func (r *MessageHistoryRepository) Update(ctx context.Context, history *model.MessageHistory) error {
	query := `
		UPDATE message_history
		SET status = $2, sent_at = $3, recipient_count = $4, error_message = $5
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query,
		history.ID,
		history.Status,
		history.SentAt,
		history.RecipientCount,
		history.ErrorMessage,
	)

	if err != nil {
		return fmt.Errorf("failed to update message history: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("message history not found")
	}

	return nil
}

func (r *MessageHistoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM message_history
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query, id)

	if err != nil {
		return fmt.Errorf("failed to delete message history: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("message history not found")
	}

	return nil
}

// CountByUserID ユーザーの総配信数を取得
func (r *MessageHistoryRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM message_history
		WHERE user_id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var count int
	err := sqlx.GetContext(ctx, executor, &count, query, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to count message history: %w", err)
	}

	return count, nil
}

// SumRecipientsByUserID ユーザーの総リーチ数を取得
func (r *MessageHistoryRepository) SumRecipientsByUserID(ctx context.Context, userID uuid.UUID) (int, error) {
	query := `
		SELECT COALESCE(SUM(recipient_count), 0)
		FROM message_history
		WHERE user_id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var sum int
	err := sqlx.GetContext(ctx, executor, &sum, query, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to sum recipients: %w", err)
	}

	return sum, nil
}

// GetLastSentDateByUserID ユーザーの最終配信日時を取得
func (r *MessageHistoryRepository) GetLastSentDateByUserID(ctx context.Context, userID uuid.UUID) (string, error) {
	query := `
		SELECT COALESCE(TO_CHAR(MAX(sent_at), 'YYYY-MM-DD'), '')
		FROM message_history
		WHERE user_id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var lastSentDate string
	err := sqlx.GetContext(ctx, executor, &lastSentDate, query, userID)
	if err != nil {
		return "", fmt.Errorf("failed to get last sent date: %w", err)
	}

	return lastSentDate, nil
}

