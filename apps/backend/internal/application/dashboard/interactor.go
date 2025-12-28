package dashboard

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
)

type dashboardInteractor struct {
	dashboardRepo repository.DashboardRepository
	campaignRepo  repository.CampaignRepository
}

// NewDashboardInteractor Dashboardインタラクターを生成
func NewDashboardInteractor(
	dashboardRepo repository.DashboardRepository,
	campaignRepo repository.CampaignRepository,
) Usecase {
	return &dashboardInteractor{
		dashboardRepo: dashboardRepo,
		campaignRepo:  campaignRepo,
	}
}

// GetStats ダッシュボード統計情報を取得
func (i *dashboardInteractor) GetStats(ctx context.Context, userID uuid.UUID) (*model.DashboardStats, error) {
	stats, err := i.dashboardRepo.GetStats(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get dashboard stats: %w", err)
	}
	return stats, nil
}

// GetCampaigns キャンペーン一覧を取得
func (i *dashboardInteractor) GetCampaigns(ctx context.Context, userID uuid.UUID) ([]*model.Campaign, error) {
	campaigns, err := i.campaignRepo.List(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get campaigns: %w", err)
	}
	return campaigns, nil
}
