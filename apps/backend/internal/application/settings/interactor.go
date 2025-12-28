package settings

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/shared/errx"
)

type Interactor struct {
	settingsRepo repository.UserSettingsRepository
}

func NewInteractor(
	settingsRepo repository.UserSettingsRepository,
) Usecase {
	return &Interactor{
		settingsRepo: settingsRepo,
	}
}

func (i *Interactor) GetSettings(ctx context.Context, userID uuid.UUID) (*model.UserSettings, error) {
	settings, err := i.settingsRepo.FindByUserID(ctx, userID)
	if err != nil {
		// 設定が存在しない場合はデフォルト設定を作成
		if errors.Is(err, sql.ErrNoRows) || errors.Is(err, errx.ErrNotFound) {
			newSettings := model.NewUserSettings(userID)
			if err := i.settingsRepo.Upsert(ctx, newSettings); err != nil {
				log.Printf("Failed to create default user settings: %v", err)
				return nil, errx.ErrInternalServer
			}
			return newSettings, nil
		}

		log.Printf("Failed to get user settings: %v", err)
		return nil, errx.ErrInternalServer
	}

	return settings, nil
}

func (i *Interactor) UpdateSettings(ctx context.Context, input *UpdateSettingsInput) (*model.UserSettings, error) {
	// 既存設定を取得（存在しない場合は作成）
	settings, err := i.GetSettings(ctx, input.UserID)
	if err != nil {
		return nil, err
	}

	// フィールドを更新
	settings.UpdateFields(input.DefaultReplyDelay, input.NotificationEnabled, input.Timezone, input.Language)

	// Upsert実行
	err = i.settingsRepo.Upsert(ctx, settings)
	if err != nil {
		log.Printf("Failed to update user settings: %v", err)
		return nil, errx.ErrInternalServer
	}

	return settings, nil
}
