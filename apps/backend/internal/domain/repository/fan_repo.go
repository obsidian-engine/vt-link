package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type FanRepository interface {
	// Create 新しいファンを作成
	Create(ctx context.Context, fan *model.Fan) error

	// FindByID IDでファンを取得
	FindByID(ctx context.Context, id uuid.UUID) (*model.Fan, error)

	// FindByUserIDAndLineUserID ユーザーIDとLINEユーザーIDでファンを取得
	FindByUserIDAndLineUserID(ctx context.Context, userID uuid.UUID, lineUserID string) (*model.Fan, error)

	// FindByUserID ユーザーIDでファン一覧を取得（ページネーション対応）
	FindByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*model.Fan, error)

	// CountByUserID ユーザーIDでファン数をカウント
	CountByUserID(ctx context.Context, userID uuid.UUID) (int, error)

	// Update ファン情報を更新
	Update(ctx context.Context, fan *model.Fan) error

	// Delete ファンを削除
	Delete(ctx context.Context, id uuid.UUID) error
}
