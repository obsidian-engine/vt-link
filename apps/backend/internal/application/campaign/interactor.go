package campaign

import (
	"context"
	"fmt"
	"log"

	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/domain/service"
	"vt-link/backend/internal/shared/clock"
	"vt-link/backend/internal/shared/errx"
	"github.com/google/uuid"
)

type Interactor struct {
	campaignRepo repository.CampaignRepository
	txManager    repository.TxManager
	pusher       service.Pusher
	clock        clock.Clock
}

func NewInteractor(
	campaignRepo repository.CampaignRepository,
	txManager repository.TxManager,
	pusher service.Pusher,
	clock clock.Clock,
) Usecase {
	return &Interactor{
		campaignRepo: campaignRepo,
		txManager:    txManager,
		pusher:       pusher,
		clock:        clock,
	}
}

func (i *Interactor) CreateCampaign(ctx context.Context, input *CreateCampaignInput) (*model.Campaign, error) {
	if input.Title == "" || input.Body == "" {
		return nil, errx.ErrInvalidInput
	}

	campaign := model.NewCampaign(input.Title, input.Body)

	err := i.campaignRepo.Create(ctx, campaign)
	if err != nil {
		log.Printf("Failed to create campaign: %v", err)
		return nil, errx.ErrInternalServer
	}

	return campaign, nil
}

func (i *Interactor) ListCampaigns(ctx context.Context, input *ListCampaignsInput) ([]*model.Campaign, error) {
	limit := input.Limit
	if limit <= 0 || limit > 100 {
		limit = 100 // デフォルト100件、最大100件
	}

	offset := input.Offset
	if offset < 0 {
		offset = 0
	}

	campaigns, err := i.campaignRepo.List(ctx, limit, offset)
	if err != nil {
		log.Printf("Failed to list campaigns: %v", err)
		return nil, errx.ErrInternalServer
	}

	return campaigns, nil
}

func (i *Interactor) GetCampaign(ctx context.Context, id uuid.UUID) (*model.Campaign, error) {
	campaign, err := i.campaignRepo.FindByID(ctx, id)
	if err != nil {
		log.Printf("Failed to find campaign: %v", err)
		return nil, errx.ErrNotFound
	}

	return campaign, nil
}

func (i *Interactor) SendCampaign(ctx context.Context, input *SendCampaignInput) error {
	return i.txManager.WithinTx(ctx, func(ctx context.Context) error {
		campaign, err := i.campaignRepo.FindByID(ctx, input.ID)
		if err != nil {
			log.Printf("Failed to find campaign for send: %v", err)
			return errx.ErrNotFound
		}

		if !campaign.CanSend() {
			return errx.NewAppError("CANNOT_SEND", "Campaign cannot be sent", 400)
		}

		// LINE Push送信
		message := fmt.Sprintf("%s\n\n%s", campaign.Title, campaign.Body)
		err = i.pusher.PushText(ctx, message)
		if err != nil {
			log.Printf("Failed to push message: %v", err)
			campaign.MarkAsFailed()
			i.campaignRepo.Update(ctx, campaign)
			return errx.NewAppError("PUSH_FAILED", "Failed to send message", 500)
		}

		// 送信成功
		campaign.MarkAsSent()
		err = i.campaignRepo.Update(ctx, campaign)
		if err != nil {
			log.Printf("Failed to update campaign status: %v", err)
			return errx.ErrInternalServer
		}

		return nil
	})
}

func (i *Interactor) RunScheduler(ctx context.Context, input *SchedulerInput) (int, error) {
	limit := input.Limit
	if limit <= 0 || limit > 50 {
		limit = 50 // デフォルト50件、最大50件（Vercel Functions のタイムアウト対策）
	}

	campaigns, err := i.campaignRepo.FindScheduledCampaigns(ctx, input.Now, limit)
	if err != nil {
		log.Printf("Failed to find scheduled campaigns: %v", err)
		return 0, errx.ErrInternalServer
	}

	sentCount := 0
	for _, campaign := range campaigns {
		sendInput := &SendCampaignInput{ID: campaign.ID}
		err := i.SendCampaign(ctx, sendInput)
		if err != nil {
			log.Printf("Failed to send scheduled campaign %s: %v", campaign.ID, err)
			continue
		}
		sentCount++
	}

	log.Printf("Scheduler processed %d campaigns, sent %d successfully", len(campaigns), sentCount)
	return sentCount, nil
}