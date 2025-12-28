package repository

import (
	"context"

	"vt-link/backend/internal/domain/model"
)

// CampaignRepository キャンペーンリポジトリ
type CampaignRepository interface {
	// List キャンペーン一覧を取得
	List(ctx context.Context) ([]*model.Campaign, error)
}
