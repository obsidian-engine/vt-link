package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type MessageHistoryRepository interface {
	// Create 新しい配信履歴を作成
	Create(ctx context.Context, history *model.MessageHistory) error

	// FindByID IDで配信履歴を取得
	FindByID(ctx context.Context, id uuid.UUID) (*model.MessageHistory, error)

	// ListByUserID ユーザーIDで配信履歴一覧を取得
	ListByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*model.MessageHistory, error)

	// Update 配信履歴を更新
	Update(ctx context.Context, history *model.MessageHistory) error

	// Delete 配信履歴を削除
	Delete(ctx context.Context, id uuid.UUID) error
}
