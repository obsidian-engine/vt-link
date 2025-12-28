package dashboard

import (
	"context"
	"time"

	"vt-link/backend/internal/domain/model"
)

type dashboardInteractor struct{}

// NewDashboardInteractor Dashboardインタラクターを生成
func NewDashboardInteractor() Usecase {
	return &dashboardInteractor{}
}

// GetStats ダッシュボード統計情報を取得
func (i *dashboardInteractor) GetStats(ctx context.Context) (*model.DashboardStats, error) {
	// TODO: 実際のDBから取得する実装に置き換え
	return &model.DashboardStats{
		FriendCount:    12340,
		SendCount:      8900,
		SendLimit:      15000,
		AverageCTR:     4.8,
		MonthlyRevenue: 540000,
	}, nil
}

// GetCampaigns キャンペーン一覧を取得
func (i *dashboardInteractor) GetCampaigns(ctx context.Context) ([]*model.Campaign, error) {
	// TODO: 実際のDBから取得する実装に置き換え
	now := time.Now()
	return []*model.Campaign{
		{
			ID:        "1",
			Name:      "夏のセール告知",
			SentCount: 5000,
			CTR:       6.2,
			CVR:       1.1,
			Status:    "active",
			CreatedAt: now.AddDate(0, 0, -7),
		},
		{
			ID:        "2",
			Name:      "新商品リリース案内",
			SentCount: 3200,
			CTR:       5.8,
			CVR:       0.9,
			Status:    "active",
			CreatedAt: now.AddDate(0, 0, -14),
		},
		{
			ID:        "3",
			Name:      "会員限定キャンペーン",
			SentCount: 4500,
			CTR:       7.1,
			CVR:       1.5,
			Status:    "ended",
			CreatedAt: now.AddDate(0, -1, 0),
		},
	}, nil
}
