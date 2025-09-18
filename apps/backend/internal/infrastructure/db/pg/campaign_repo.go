package pg

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
	"github.com/google/uuid"
)

type CampaignRepository struct {
	db *db.DB
}

func NewCampaignRepository(db *db.DB) repository.CampaignRepository {
	return &CampaignRepository{db: db}
}

func (r *CampaignRepository) Create(ctx context.Context, campaign *model.Campaign) error {
	query := `
		INSERT INTO campaigns (id, title, body, status, scheduled_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	executor := db.GetExecutor(ctx, r.db)
	_, err := executor.ExecContext(ctx, query,
		campaign.ID,
		campaign.Title,
		campaign.Body,
		campaign.Status,
		campaign.ScheduledAt,
		campaign.CreatedAt,
		campaign.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create campaign: %w", err)
	}

	return nil
}

func (r *CampaignRepository) FindByID(ctx context.Context, id uuid.UUID) (*model.Campaign, error) {
	query := `
		SELECT id, title, body, status, scheduled_at, created_at, updated_at
		FROM campaigns
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)

	var campaign model.Campaign
	err := executor.GetContext(ctx, &campaign, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("campaign not found")
		}
		return nil, fmt.Errorf("failed to find campaign: %w", err)
	}

	return &campaign, nil
}

func (r *CampaignRepository) List(ctx context.Context, limit, offset int) ([]*model.Campaign, error) {
	query := `
		SELECT id, title, body, status, scheduled_at, created_at, updated_at
		FROM campaigns
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	executor := db.GetExecutor(ctx, r.db)

	var campaigns []*model.Campaign
	err := executor.SelectContext(ctx, &campaigns, query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to list campaigns: %w", err)
	}

	return campaigns, nil
}

func (r *CampaignRepository) Update(ctx context.Context, campaign *model.Campaign) error {
	query := `
		UPDATE campaigns
		SET title = $2, body = $3, status = $4, scheduled_at = $5, updated_at = $6
		WHERE id = $1
	`

	executor := db.GetExecutor(ctx, r.db)
	result, err := executor.ExecContext(ctx, query,
		campaign.ID,
		campaign.Title,
		campaign.Body,
		campaign.Status,
		campaign.ScheduledAt,
		campaign.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to update campaign: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("campaign not found")
	}

	return nil
}

func (r *CampaignRepository) FindScheduledCampaigns(ctx context.Context, until time.Time, limit int) ([]*model.Campaign, error) {
	query := `
		SELECT id, title, body, status, scheduled_at, created_at, updated_at
		FROM campaigns
		WHERE status = 'scheduled' AND scheduled_at <= $1
		ORDER BY scheduled_at ASC
		LIMIT $2
	`

	executor := db.GetExecutor(ctx, r.db)

	var campaigns []*model.Campaign
	err := executor.SelectContext(ctx, &campaigns, query, until, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to find scheduled campaigns: %w", err)
	}

	return campaigns, nil
}