package settings

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type UpdateSettingsInput struct {
	UserID              uuid.UUID `json:"userId"`
	DefaultReplyDelay   *int      `json:"defaultReplyDelay"`
	NotificationEnabled *bool     `json:"notificationEnabled"`
	Timezone            *string   `json:"timezone"`
	Language            *string   `json:"language"`
}

type Usecase interface {
	// GetSettings ユーザーの設定を取得（存在しない場合はデフォルト設定を作成）
	GetSettings(ctx context.Context, userID uuid.UUID) (*model.UserSettings, error)

	// UpdateSettings 設定を更新（存在しない場合は作成）
	UpdateSettings(ctx context.Context, input *UpdateSettingsInput) (*model.UserSettings, error)
}
