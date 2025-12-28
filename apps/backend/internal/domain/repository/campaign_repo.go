package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

// CampaignRepository キャンペーンリポジトリ
type CampaignRepository interface {
	// List キャンペーン一覧を取得
	List(ctx context.Context, userID uuid.UUID) ([]*model.Campaign, error)
}
