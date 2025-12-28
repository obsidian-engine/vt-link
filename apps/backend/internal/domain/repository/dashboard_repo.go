package repository

import (
	"context"

	"vt-link/backend/internal/domain/model"
)

// DashboardRepository ダッシュボードリポジトリ
type DashboardRepository interface {
	// GetStats ダッシュボード統計情報を取得
	GetStats(ctx context.Context) (*model.DashboardStats, error)
}
