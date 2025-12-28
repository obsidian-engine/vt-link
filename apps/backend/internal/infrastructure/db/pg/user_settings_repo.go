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

type UserSettingsRepository struct {
	db *db.DB
}

func NewUserSettingsRepository(db *db.DB) repository.UserSettingsRepository {
	return &UserSettingsRepository{db: db}
}

func (r *UserSettingsRepository) FindByUserID(ctx context.Context, userID uuid.UUID) (*model.UserSettings, error) {
	query := `
		SELECT id, user_id, default_reply_delay, notification_enabled, timezone, language, created_at, updated_at
		FROM user_settings
		WHERE user_id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var settings model.UserSettings
	err := sqlx.GetContext(ctx, executor, &settings, query, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user settings not found")
		}
		return nil, fmt.Errorf("failed to find user settings: %w", err)
	}

	return &settings, nil
}

func (r *UserSettingsRepository) Upsert(ctx context.Context, settings *model.UserSettings) error {
	query := `
		INSERT INTO user_settings (id, user_id, default_reply_delay, notification_enabled, timezone, language, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (user_id)
		DO UPDATE SET
			default_reply_delay = EXCLUDED.default_reply_delay,
			notification_enabled = EXCLUDED.notification_enabled,
			timezone = EXCLUDED.timezone,
			language = EXCLUDED.language,
			updated_at = EXCLUDED.updated_at
	`

	executor := db.GetExecutor(ctx, r.db)
	_, err := executor.ExecContext(ctx, query,
		settings.ID,
		settings.UserID,
		settings.DefaultReplyDelay,
		settings.NotificationEnabled,
		settings.Timezone,
		settings.Language,
		settings.CreatedAt,
		settings.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert user settings: %w", err)
	}

	return nil
}
