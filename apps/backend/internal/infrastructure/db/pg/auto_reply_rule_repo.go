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

type AutoReplyRuleRepository struct {
	db *db.DB
}

func NewAutoReplyRuleRepository(db *db.DB) repository.AutoReplyRuleRepository {
	return &AutoReplyRuleRepository{db: db}
}

func (r *AutoReplyRuleRepository) Create(ctx context.Context, rule *model.AutoReplyRule) error {
	query := `
		INSERT INTO auto_reply_rules (id, user_id, type, name, keywords, match_type, reply_message, is_enabled, priority, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	executor := db.GetExecutor(ctx, r.db)
	_, err := executor.ExecContext(ctx, query,
		rule.ID,
		rule.UserID,
		rule.Type,
		rule.Name,
		rule.Keywords,
		rule.MatchType,
		rule.ReplyMessage,
		rule.IsEnabled,
		rule.Priority,
		rule.CreatedAt,
		rule.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create auto reply rule: %w", err)
	}

	return nil
}

func (r *AutoReplyRuleRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.AutoReplyRule, error) {
	query := `
		SELECT id, user_id, type, name, keywords, match_type, reply_message, is_enabled, priority, created_at, updated_at
		FROM auto_reply_rules
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var rule model.AutoReplyRule
	err := sqlx.GetContext(ctx, executor, &rule, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("auto reply rule not found")
		}
		return nil, fmt.Errorf("failed to find auto reply rule: %w", err)
	}

	return &rule, nil
}

func (r *AutoReplyRuleRepository) FindByUserID(ctx context.Context, userID uuid.UUID) ([]*model.AutoReplyRule, error) {
	query := `
		SELECT id, user_id, type, name, keywords, match_type, reply_message, is_enabled, priority, created_at, updated_at
		FROM auto_reply_rules
		WHERE user_id = $1
		ORDER BY priority ASC
	`

	executor := db.GetExecutor(ctx, r.db)

	var rules []*model.AutoReplyRule
	err := sqlx.SelectContext(ctx, executor, &rules, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to find auto reply rules by user: %w", err)
	}

	return rules, nil
}

func (r *AutoReplyRuleRepository) Update(ctx context.Context, rule *model.AutoReplyRule) error {
	query := `
		UPDATE auto_reply_rules
		SET name = $2, keywords = $3, match_type = $4, reply_message = $5, is_enabled = $6, priority = $7, updated_at = $8
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query,
		rule.ID,
		rule.Name,
		rule.Keywords,
		rule.MatchType,
		rule.ReplyMessage,
		rule.IsEnabled,
		rule.Priority,
		rule.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update auto reply rule: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("auto reply rule not found")
	}

	return nil
}

func (r *AutoReplyRuleRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM auto_reply_rules WHERE id = $1`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query, id)

	if err != nil {
		return fmt.Errorf("failed to delete auto reply rule: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("auto reply rule not found")
	}

	return nil
}
