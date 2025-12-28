package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type UserSettingsRepository interface {
	// FindByUserID ユーザーIDで設定を取得
	FindByUserID(ctx context.Context, userID uuid.UUID) (*model.UserSettings, error)

	// Upsert 設定を作成または更新
	Upsert(ctx context.Context, settings *model.UserSettings) error
}
