package repository

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

// SegmentRepository セグメントリポジトリ
type SegmentRepository interface {
	// List セグメント一覧を取得
	List(ctx context.Context, userID uuid.UUID) ([]*model.Segment, error)
}
