package repository

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

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
