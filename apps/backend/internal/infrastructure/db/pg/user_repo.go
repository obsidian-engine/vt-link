package pg

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
)

type UserRepository struct {
	db *db.DB
}

func NewUserRepository(db *db.DB) repository.UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) FindByLineUserID(ctx context.Context, lineUserID string) (*model.User, error) {
	query := `
		SELECT id, line_user_id, line_bot_user_id, display_name, picture_url, email, created_at, updated_at
		FROM users
		WHERE line_user_id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var user model.User
	err := executor.QueryRowxContext(ctx, query, lineUserID).StructScan(&user)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found: %w", err)
		}
		return nil, fmt.Errorf("failed to find user: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) FindByLineBotUserID(ctx context.Context, lineBotUserID string) (*model.User, error) {
	query := `
		SELECT id, line_user_id, line_bot_user_id, display_name, picture_url, email, created_at, updated_at
		FROM users
		WHERE line_bot_user_id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var user model.User
	err := executor.QueryRowxContext(ctx, query, lineBotUserID).StructScan(&user)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found for bot user id: %w", err)
		}
		return nil, fmt.Errorf("failed to find user by bot user id: %w", err)
	}

	return &user, nil
}

func (r *UserRepository) Create(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO users (id, line_user_id, line_bot_user_id, display_name, picture_url, email, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
	`

	executor := db.GetExecutor(ctx, r.db)

	// Generate new UUID if not provided
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}

	_, err := executor.ExecContext(ctx, query,
		user.ID,
		user.LineUserID,
		user.LineBotUserID,
		user.DisplayName,
		user.PictureURL,
		user.Email,
	)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) Upsert(ctx context.Context, user *model.User) (*model.User, error) {
	query := `
		INSERT INTO users (id, line_user_id, line_bot_user_id, display_name, picture_url, email, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		ON CONFLICT (line_user_id)
		DO UPDATE SET
			line_bot_user_id = EXCLUDED.line_bot_user_id,
			display_name = EXCLUDED.display_name,
			picture_url = EXCLUDED.picture_url,
			email = EXCLUDED.email,
			updated_at = NOW()
		RETURNING id, line_user_id, line_bot_user_id, display_name, picture_url, email, created_at, updated_at
	`

	executor := db.GetExecutor(ctx, r.db)

	// Generate new UUID if not provided
	if user.ID == uuid.Nil {
		user.ID = uuid.New()
	}

	var result model.User
	err := executor.QueryRowxContext(ctx, query,
		user.ID,
		user.LineUserID,
		user.LineBotUserID,
		user.DisplayName,
		user.PictureURL,
		user.Email,
	).StructScan(&result)

	if err != nil {
		return nil, fmt.Errorf("failed to upsert user: %w", err)
	}

	return &result, nil
}
