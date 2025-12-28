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

type SegmentRepository struct {
	db *db.DB
}

func NewSegmentRepository(database *db.DB) repository.SegmentRepository {
	return &SegmentRepository{db: database}
}

func (r *SegmentRepository) List(ctx context.Context, userID uuid.UUID) ([]*model.Segment, error) {
	executor := db.GetExecutor(ctx, r.db)
	
	segments := make([]*model.Segment, 0)

	// 1. アクティブユーザー（30日以内にインタラクション）
	var activeCount int
	activeQuery := `
		SELECT COUNT(*) FROM fans 
		WHERE user_id = $1 
		AND last_interaction_at > NOW() - INTERVAL '30 days'
	`
	err := sqlx.GetContext(ctx, executor, &activeCount, activeQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get active users count: %w", err)
	}
	segments = append(segments, &model.Segment{
		ID:          "active",
		Name:        "アクティブユーザー",
		Description: "30日以内にインタラクションがあったユーザー",
		Count:       activeCount,
	})

	// 2. 新規ユーザー（7日以内にフォロー）
	var newCount int
	newQuery := `
		SELECT COUNT(*) FROM fans 
		WHERE user_id = $1 
		AND followed_at > NOW() - INTERVAL '7 days'
	`
	err = sqlx.GetContext(ctx, executor, &newCount, newQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get new users count: %w", err)
	}
	segments = append(segments, &model.Segment{
		ID:          "new",
		Name:        "新規ユーザー",
		Description: "7日以内にフォローしたユーザー",
		Count:       newCount,
	})

	// 3. ブロック済みユーザー
	var blockedCount int
	blockedQuery := `
		SELECT COUNT(*) FROM fans 
		WHERE user_id = $1 
		AND is_blocked = true
	`
	err = sqlx.GetContext(ctx, executor, &blockedCount, blockedQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get blocked users count: %w", err)
	}
	segments = append(segments, &model.Segment{
		ID:          "blocked",
		Name:        "ブロック済み",
		Description: "ブロックされたユーザー",
		Count:       blockedCount,
	})

	// 4. タグベースのセグメント
	type tagSegment struct {
		Tag   string `db:"tag"`
		Count int    `db:"count"`
	}
	tagQuery := `
		SELECT unnest(tags) AS tag, COUNT(*) AS count
		FROM fans
		WHERE user_id = $1 AND array_length(tags, 1) > 0
		GROUP BY unnest(tags)
		ORDER BY count DESC
	`
	var tagSegments []tagSegment
	err = sqlx.SelectContext(ctx, executor, &tagSegments, tagQuery, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get tag segments: %w", err)
	}

	for _, ts := range tagSegments {
		segments = append(segments, &model.Segment{
			ID:          fmt.Sprintf("tag_%s", ts.Tag),
			Name:        ts.Tag,
			Description: fmt.Sprintf("タグ「%s」が付与されたユーザー", ts.Tag),
			Count:       ts.Count,
		})
	}

	return segments, nil
}
