package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type RichMenuRepository interface {
	// Create 新しいリッチメニューを作成
	Create(ctx context.Context, menu *model.RichMenu) error

	// FindByID IDでリッチメニューを取得
	FindByID(ctx context.Context, id uuid.UUID) (*model.RichMenu, error)

	// FindByUserID ユーザーIDでリッチメニューを取得（1アカウント1メニュー）
	FindByUserID(ctx context.Context, userID uuid.UUID) (*model.RichMenu, error)

	// Update リッチメニューを更新
	Update(ctx context.Context, menu *model.RichMenu) error

	// Delete リッチメニューを削除
	Delete(ctx context.Context, id uuid.UUID) error

	// SetActive リッチメニューの有効/無効を設定
	SetActive(ctx context.Context, id uuid.UUID, isActive bool) error
}
