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

type RichMenuRepository struct {
	db *db.DB
}

func NewRichMenuRepository(db *db.DB) repository.RichMenuRepository {
	return &RichMenuRepository{db: db}
}

func (r *RichMenuRepository) Create(ctx context.Context, menu *model.RichMenu) error {
	query := `
		INSERT INTO rich_menus (id, user_id, line_rich_menu_id, name, chat_bar_text, image_url, size, areas, is_active, is_published_line, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`

	executor := db.GetExecutor(ctx, r.db)
	_, err := executor.ExecContext(ctx, query,
		menu.ID,
		menu.UserID,
		menu.LineRichMenuID,
		menu.Name,
		menu.ChatBarText,
		menu.ImageURL,
		menu.Size,
		menu.Areas,
		menu.IsActive,
		menu.IsPublishedLine,
		menu.CreatedAt,
		menu.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create rich menu: %w", err)
	}

	return nil
}

func (r *RichMenuRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.RichMenu, error) {
	query := `
		SELECT id, user_id, line_rich_menu_id, name, chat_bar_text, image_url, size, areas, is_active, is_published_line, created_at, updated_at
		FROM rich_menus
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var menu model.RichMenu
	err := sqlx.GetContext(ctx, executor, &menu, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("rich menu not found")
		}
		return nil, fmt.Errorf("failed to find rich menu: %w", err)
	}

	return &menu, nil
}

func (r *RichMenuRepository) FindByUserID(ctx context.Context, userID uuid.UUID) (*model.RichMenu, error) {
	query := `
		SELECT id, user_id, line_rich_menu_id, name, chat_bar_text, image_url, size, areas, is_active, is_published_line, created_at, updated_at
		FROM rich_menus
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`

	executor := db.GetExecutor(ctx, r.db)

	var menu model.RichMenu
	err := sqlx.GetContext(ctx, executor, &menu, query, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("rich menu not found for user")
		}
		return nil, fmt.Errorf("failed to find rich menu by user: %w", err)
	}

	return &menu, nil
}

func (r *RichMenuRepository) Update(ctx context.Context, menu *model.RichMenu) error {
	query := `
		UPDATE rich_menus
		SET line_rich_menu_id = $2, name = $3, chat_bar_text = $4, image_url = $5, size = $6, areas = $7, is_active = $8, is_published_line = $9, updated_at = $10
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query,
		menu.ID,
		menu.LineRichMenuID,
		menu.Name,
		menu.ChatBarText,
		menu.ImageURL,
		menu.Size,
		menu.Areas,
		menu.IsActive,
		menu.IsPublishedLine,
		menu.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update rich menu: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("rich menu not found")
	}

	return nil
}

func (r *RichMenuRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM rich_menus WHERE id = $1`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query, id)

	if err != nil {
		return fmt.Errorf("failed to delete rich menu: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("rich menu not found")
	}

	return nil
}

func (r *RichMenuRepository) SetActive(ctx context.Context, id uuid.UUID, isActive bool) error {
	query := `
		UPDATE rich_menus
		SET is_active = $2, updated_at = NOW()
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query, id, isActive)

	if err != nil {
		return fmt.Errorf("failed to set active status: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("rich menu not found")
	}

	return nil
}
