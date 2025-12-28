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
	// 総配信数を取得
	totalMessages, err := i.historyRepo.CountByUserID(ctx, userID)
	if err != nil {
		log.Printf("Failed to get total messages: %v", err)
		return nil, errx.ErrInternalServer
	}

	// 総リーチ数を取得
	totalRecipients, err := i.historyRepo.SumRecipientsByUserID(ctx, userID)
	if err != nil {
		log.Printf("Failed to get total recipients: %v", err)
		return nil, errx.ErrInternalServer
	}

	// 最終配信日時を取得
	lastSentDate, err := i.historyRepo.GetLastSentDateByUserID(ctx, userID)
	if err != nil {
		log.Printf("Failed to get last sent date: %v", err)
		return nil, errx.ErrInternalServer
	}

	// TODO: 開封率・クリック率はトラッキング機能実装後に実データに変更
	averageOpenRate := 0.0
	averageClickRate := 0.0

	return &model.HistoryStats{
		TotalMessages:    totalMessages,
		TotalRecipients:  totalRecipients,
		AverageOpenRate:  averageOpenRate,
		AverageClickRate: averageClickRate,
		LastSentDate:     lastSentDate,
	}, nil
}

