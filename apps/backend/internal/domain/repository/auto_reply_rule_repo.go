package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

// BulkUpdateItem 一括更新用のアイテム
type BulkUpdateItem struct {
	ID        uuid.UUID
	IsEnabled bool
}

type AutoReplyRuleRepository interface {
	// Create 新しい自動返信ルールを作成
	Create(ctx context.Context, rule *model.AutoReplyRule) error

	// FindByID IDで自動返信ルールを取得
	FindByID(ctx context.Context, id uuid.UUID) (*model.AutoReplyRule, error)

	// FindByUserID ユーザーIDで自動返信ルールを取得（priority昇順）
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*model.AutoReplyRule, error)

	// Update 自動返信ルールを更新
	Update(ctx context.Context, rule *model.AutoReplyRule) error

	// BulkUpdateEnabled 複数ルールの有効/無効を一括更新
	BulkUpdateEnabled(ctx context.Context, items []BulkUpdateItem) error

	// Delete 自動返信ルールを削除
	Delete(ctx context.Context, id uuid.UUID) error
}
