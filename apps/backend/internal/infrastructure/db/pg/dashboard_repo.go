package pg

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
)

type DashboardRepository struct {
	db *db.DB
}

func NewDashboardRepository(database *db.DB) repository.DashboardRepository {
	return &DashboardRepository{db: database}
}

func (r *DashboardRepository) GetStats(ctx context.Context, userID uuid.UUID) (*model.DashboardStats, error) {
	executor := db.GetExecutor(ctx, r.db)

	// 友だち数取得
	var friendCount int
	friendQuery := `SELECT COUNT(*) FROM fans WHERE user_id = $1 AND is_blocked = false`
	err := sqlx.GetContext(ctx, executor, &friendCount, friendQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get friend count: %w", err)
	}

	// 当月の送信数取得
	var sendCount int
	sendQuery := `
		SELECT COALESCE(SUM(recipient_count), 0) 
		FROM message_history 
		WHERE user_id = $1 
		AND EXTRACT(MONTH FROM sent_at) = EXTRACT(MONTH FROM NOW())
		AND EXTRACT(YEAR FROM sent_at) = EXTRACT(YEAR FROM NOW())
	`
	err = sqlx.GetContext(ctx, executor, &sendCount, sendQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get send count: %w", err)
	}

	// TODO: user_settings から取得する実装に変更
	sendLimit := 15000

	// TODO: クリックトラッキング実装後に実データに変更
	averageCTR := 0.0

	// TODO: 決済連携実装後に実データに変更
	monthlyRevenue := 0

	return &model.DashboardStats{
		FriendCount:    friendCount,
		SendCount:      sendCount,
		SendLimit:      sendLimit,
		AverageCTR:     averageCTR,
		MonthlyRevenue: monthlyRevenue,
	}, nil
}
