package dashboard

import (
	"context"

	"vt-link/backend/internal/domain/model"
)

// Usecase ダッシュボード機能のユースケースインターフェース
type Usecase interface {
	// GetStats ダッシュボード統計情報を取得
	GetStats(ctx context.Context) (*model.DashboardStats, error)

	// GetCampaigns キャンペーン一覧を取得
	GetCampaigns(ctx context.Context) ([]*model.Campaign, error)
}
