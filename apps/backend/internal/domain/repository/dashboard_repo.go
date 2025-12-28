package repository

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

// DashboardRepository ダッシュボードリポジトリ
type DashboardRepository interface {
	// GetStats ダッシュボード統計情報を取得
	GetStats(ctx context.Context, userID uuid.UUID) (*model.DashboardStats, error)
}
