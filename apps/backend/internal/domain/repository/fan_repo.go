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

	// CountActiveByUserID アクティブなファン数をカウント（指定日数以内に最終インタラクションがあるファン）
	CountActiveByUserID(ctx context.Context, userID uuid.UUID, days int) (int, error)

	// CountNewByUserID 新規ファン数をカウント（指定日数以内にフォローしたファン）
	CountNewByUserID(ctx context.Context, userID uuid.UUID, days int) (int, error)
}
