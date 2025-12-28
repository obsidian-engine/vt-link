package pg

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
)

type CampaignRepository struct {
	db *db.DB
}

func NewCampaignRepository(database *db.DB) repository.CampaignRepository {
	return &CampaignRepository{db: database}
}

func (r *CampaignRepository) List(ctx context.Context, userID uuid.UUID) ([]*model.Campaign, error) {
	executor := db.GetExecutor(ctx, r.db)

	query := `
		SELECT 
			m.id,
			m.title AS name,
			COALESCE(SUM(mh.recipient_count), 0) AS sent_count,
			0.0 AS ctr,  -- TODO: クリックトラッキング実装後に実データに変更
			0.0 AS cvr,  -- TODO: コンバージョントラッキング実装後に実データに変更
			m.status,
			m.created_at
		FROM messages m
		LEFT JOIN message_history mh ON m.id = mh.message_id
		WHERE m.user_id = $1
		GROUP BY m.id, m.title, m.status, m.created_at
		ORDER BY m.created_at DESC
		LIMIT 10
	`

	type campaignRow struct {
		ID        uuid.UUID `db:"id"`
		Name      string    `db:"name"`
		SentCount int       `db:"sent_count"`
		CTR       float64   `db:"ctr"`
		CVR       float64   `db:"cvr"`
		Status    string    `db:"status"`
		CreatedAt time.Time `db:"created_at"`
	}

	var rows []campaignRow
	err := sqlx.SelectContext(ctx, executor, &rows, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list campaigns: %w", err)
	}

	campaigns := make([]*model.Campaign, 0, len(rows))
	for _, row := range rows {
		campaigns = append(campaigns, &model.Campaign{
			ID:        row.ID.String(),
			Name:      row.Name,
			SentCount: row.SentCount,
			CTR:       row.CTR,
			CVR:       row.CVR,
			Status:    row.Status,
			CreatedAt: row.CreatedAt,
		})
	}

	return campaigns, nil
}
