package history

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type ListHistoryInput struct {
	UserID uuid.UUID `json:"user_id"`
	Limit  int       `json:"limit"`
	Offset int       `json:"offset"`
}

type Usecase interface {
	// ListHistory 配信履歴一覧を取得
	ListHistory(ctx context.Context, input *ListHistoryInput) ([]*model.MessageHistory, error)

	// GetHistory 配信履歴を取得
	GetHistory(ctx context.Context, id uuid.UUID) (*model.MessageHistory, error)

	// GetStats 配信履歴統計情報を取得
	GetStats(ctx context.Context, userID uuid.UUID) (*model.HistoryStats, error)
}
