package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type CampaignRepository interface {
	// Create 新しいキャンペーンを作成
	Create(ctx context.Context, campaign *model.Campaign) error

	// FindByID IDでキャンペーンを取得
	FindByID(ctx context.Context, id uuid.UUID) (*model.Campaign, error)

	// List キャンペーン一覧を取得（ページング対応）
	List(ctx context.Context, limit, offset int) ([]*model.Campaign, error)

	// Update キャンペーンを更新
	Update(ctx context.Context, campaign *model.Campaign) error

	// FindScheduledCampaigns スケジュール済みキャンペーンを取得
	FindScheduledCampaigns(ctx context.Context, until time.Time, limit int) ([]*model.Campaign, error)
}

type TxManager interface {
	// WithinTx トランザクション内で関数を実行
	WithinTx(ctx context.Context, fn func(ctx context.Context) error) error
}
