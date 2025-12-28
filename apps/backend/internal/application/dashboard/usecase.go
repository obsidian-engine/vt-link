package dashboard

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

// Usecase ダッシュボード機能のユースケースインターフェース
type Usecase interface {
	// GetStats ダッシュボード統計情報を取得
	GetStats(ctx context.Context, userID uuid.UUID) (*model.DashboardStats, error)

	// GetCampaigns キャンペーン一覧を取得
	GetCampaigns(ctx context.Context, userID uuid.UUID) ([]*model.Campaign, error)
}
