package history

import (
	"context"
	"log"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/shared/errx"
)

type Interactor struct {
	historyRepo repository.MessageHistoryRepository
}

func NewInteractor(
	historyRepo repository.MessageHistoryRepository,
) Usecase {
	return &Interactor{
		historyRepo: historyRepo,
	}
}

func (i *Interactor) ListHistory(ctx context.Context, input *ListHistoryInput) ([]*model.MessageHistory, error) {
	limit := input.Limit
	if limit <= 0 || limit > 100 {
		limit = 100 // デフォルト100件、最大100件
	}

	offset := input.Offset
	if offset < 0 {
		offset = 0
	}

	histories, err := i.historyRepo.ListByUserID(ctx, input.UserID, limit, offset)
	if err != nil {
		log.Printf("Failed to list history: %v", err)
		return nil, errx.ErrInternalServer
	}

	return histories, nil
}

func (i *Interactor) GetHistory(ctx context.Context, id uuid.UUID) (*model.MessageHistory, error) {
	history, err := i.historyRepo.FindByID(ctx, id)
	if err != nil {
		log.Printf("Failed to find history: %v", err)
		return nil, errx.ErrNotFound
	}

	return history, nil
}

func (i *Interactor) GetStats(ctx context.Context, userID uuid.UUID) (*model.HistoryStats, error) {
	// TODO: 実際のDBから取得する実装に置き換え
	return &model.HistoryStats{
		TotalMessages:    127,
		TotalRecipients:  45890,
		AverageOpenRate:  42.3,
		AverageClickRate: 8.7,
		LastSentDate:     "2024-03-15",
	}, nil
}
