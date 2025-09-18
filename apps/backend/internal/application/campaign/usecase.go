package campaign

import (
	"context"
	"time"

	"vt-link/backend/internal/domain/model"
	"github.com/google/uuid"
)

type CreateCampaignInput struct {
	Title   string `json:"title"`
	Message string `json:"message"`
}

type ListCampaignsInput struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

type SendCampaignInput struct {
	ID uuid.UUID `json:"id"`
}

type SchedulerInput struct {
	Now   time.Time `json:"now"`
	Limit int       `json:"limit"`
}

type Usecase interface {
	// CreateCampaign キャンペーンを作成
	CreateCampaign(ctx context.Context, input *CreateCampaignInput) (*model.Campaign, error)

	// ListCampaigns キャンペーン一覧を取得
	ListCampaigns(ctx context.Context, input *ListCampaignsInput) ([]*model.Campaign, error)

	// GetCampaign キャンペーンを取得
	GetCampaign(ctx context.Context, id uuid.UUID) (*model.Campaign, error)

	// SendCampaign 即時送信
	SendCampaign(ctx context.Context, input *SendCampaignInput) error

	// RunScheduler スケジューラ実行（スケジュール済み配信の処理）
	RunScheduler(ctx context.Context, input *SchedulerInput) (int, error)
}