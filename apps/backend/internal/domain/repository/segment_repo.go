package repository

import (
	"context"

	"vt-link/backend/internal/domain/model"
)

// SegmentRepository セグメントリポジトリ
type SegmentRepository interface {
	// List セグメント一覧を取得
	List(ctx context.Context) ([]*model.Segment, error)
}
