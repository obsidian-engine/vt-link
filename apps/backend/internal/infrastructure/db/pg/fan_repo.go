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

type FanRepository struct {
	db *db.DB
}

func NewFanRepository(db *db.DB) repository.FanRepository {
	return &FanRepository{db: db}
}

func (r *FanRepository) Create(ctx context.Context, fan *model.Fan) error {
	query := `
		INSERT INTO fans (id, user_id, line_user_id, display_name, picture_url, followed_at, last_interaction_at, is_blocked, tags, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	executor := db.GetExecutor(ctx, r.db)
	_, err := executor.ExecContext(ctx, query,
		fan.ID,
		fan.UserID,
		fan.LineUserID,
		fan.DisplayName,
		fan.PictureURL,
		fan.FollowedAt,
		fan.LastInteractionAt,
		fan.IsBlocked,
		fan.Tags,
		fan.CreatedAt,
		fan.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create fan: %w", err)
	}

	return nil
}

func (r *FanRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.Fan, error) {
	query := `
		SELECT id, user_id, line_user_id, display_name, picture_url, followed_at, last_interaction_at, is_blocked, tags, created_at, updated_at
		FROM fans
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var fan model.Fan
	err := sqlx.GetContext(ctx, executor, &fan, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("fan not found")
		}
		return nil, fmt.Errorf("failed to find fan: %w", err)
	}

	return &fan, nil
}

func (r *FanRepository) FindByUserIDAndLineUserID(ctx context.Context, userID uuid.UUID, lineUserID string) (*model.Fan, error) {
	query := `
		SELECT id, user_id, line_user_id, display_name, picture_url, followed_at, last_interaction_at, is_blocked, tags, created_at, updated_at
		FROM fans
		WHERE user_id = $1 AND line_user_id = $2
	`

	executor := db.GetExecutor(ctx, r.db)

	var fan model.Fan
	err := sqlx.GetContext(ctx, executor, &fan, query, userID, lineUserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("fan not found")
		}
		return nil, fmt.Errorf("failed to find fan: %w", err)
	}

	return &fan, nil
}

func (r *FanRepository) FindByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*model.Fan, error) {
	query := `
		SELECT id, user_id, line_user_id, display_name, picture_url, followed_at, last_interaction_at, is_blocked, tags, created_at, updated_at
		FROM fans
		WHERE user_id = $1
		ORDER BY followed_at DESC
		LIMIT $2 OFFSET $3
	`

	executor := db.GetExecutor(ctx, r.db)

	var fans []*model.Fan
	err := sqlx.SelectContext(ctx, executor, &fans, query, userID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to find fans by user: %w", err)
	}

	return fans, nil
}

func (r *FanRepository) CountByUserID(ctx context.Context, userID uuid.UUID) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM fans
		WHERE user_id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var count int
	err := sqlx.GetContext(ctx, executor, &count, query, userID)
	if err != nil {
		return 0, fmt.Errorf("failed to count fans: %w", err)
	}

	return count, nil
}

func (r *FanRepository) Update(ctx context.Context, fan *model.Fan) error {
	query := `
		UPDATE fans
		SET display_name = $2, picture_url = $3, last_interaction_at = $4, is_blocked = $5, tags = $6, updated_at = $7
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query,
		fan.ID,
		fan.DisplayName,
		fan.PictureURL,
		fan.LastInteractionAt,
		fan.IsBlocked,
		fan.Tags,
		fan.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update fan: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("fan not found")
	}

	return nil
}

func (r *FanRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM fans WHERE id = $1`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query, id)

	if err != nil {
		return fmt.Errorf("failed to delete fan: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("fan not found")
	}

	return nil
}

func (r *FanRepository) CountActiveByUserID(ctx context.Context, userID uuid.UUID, days int) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM fans
		WHERE user_id = $1
		AND last_interaction_at > NOW() - INTERVAL '1 day' * $2
	`

	executor := db.GetExecutor(ctx, r.db)

	var count int
	err := sqlx.GetContext(ctx, executor, &count, query, userID, days)
	if err != nil {
		return 0, fmt.Errorf("failed to count active fans: %w", err)
	}

	return count, nil
}

func (r *FanRepository) CountNewByUserID(ctx context.Context, userID uuid.UUID, days int) (int, error) {
	query := `
		SELECT COUNT(*)
		FROM fans
		WHERE user_id = $1
		AND followed_at > NOW() - INTERVAL '1 day' * $2
	`

	executor := db.GetExecutor(ctx, r.db)

	var count int
	err := sqlx.GetContext(ctx, executor, &count, query, userID, days)
	if err != nil {
		return 0, fmt.Errorf("failed to count new fans: %w", err)
	}

	return count, nil
}
