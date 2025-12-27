package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type AutoReplyRuleRepository interface {
	// Create 新しい自動返信ルールを作成
	Create(ctx context.Context, rule *model.AutoReplyRule) error

	// FindByID IDで自動返信ルールを取得
	FindByID(ctx context.Context, id uuid.UUID) (*model.AutoReplyRule, error)

	// FindByUserID ユーザーIDで自動返信ルールを取得（priority昇順）
	FindByUserID(ctx context.Context, userID uuid.UUID) ([]*model.AutoReplyRule, error)

	// Update 自動返信ルールを更新
	Update(ctx context.Context, rule *model.AutoReplyRule) error

	// Delete 自動返信ルールを削除
	Delete(ctx context.Context, id uuid.UUID) error
}
