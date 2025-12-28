package audience

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type ListFansInput struct {
	UserID uuid.UUID `json:"userId"`
	Page   int       `json:"page"`
	Limit  int       `json:"limit"`
}

type UpdateFanTagsInput struct {
	ID   uuid.UUID `json:"id"`
	Tags []string  `json:"tags"`
}

type BlockFanInput struct {
	ID uuid.UUID `json:"id"`
}

type FanListResponse struct {
	Fans       []*model.Fan `json:"data"`
	Total      int          `json:"total"`
	Page       int          `json:"page"`
	Limit      int          `json:"limit"`
	TotalPages int          `json:"totalPages"`
}

type Usecase interface {
	// ListFans ファン一覧を取得（ページネーション対応）
	ListFans(ctx context.Context, input *ListFansInput) (*FanListResponse, error)

	// GetFan ファン詳細を取得
	GetFan(ctx context.Context, id uuid.UUID) (*model.Fan, error)

	// UpdateFanTags ファンのタグを更新
	UpdateFanTags(ctx context.Context, input *UpdateFanTagsInput) (*model.Fan, error)

	// BlockFan ファンをブロック
	BlockFan(ctx context.Context, input *BlockFanInput) (*model.Fan, error)

	// UnblockFan ファンのブロックを解除
	UnblockFan(ctx context.Context, input *BlockFanInput) (*model.Fan, error)

	// DeleteFan ファンを削除
	DeleteFan(ctx context.Context, id uuid.UUID) error

	// GetStats オーディエンス統計情報を取得
	GetStats(ctx context.Context, userID uuid.UUID) (*model.AudienceStats, error)

	// GetSegments セグメント一覧を取得
	GetSegments(ctx context.Context, userID uuid.UUID) ([]*model.Segment, error)
}
