package audience

import (
	"context"
	"log"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/shared/errx"
)

type Interactor struct {
	fanRepo     repository.FanRepository
	segmentRepo repository.SegmentRepository
}

func NewInteractor(
	fanRepo repository.FanRepository,
	segmentRepo repository.SegmentRepository,
) Usecase {
	return &Interactor{
		fanRepo:     fanRepo,
		segmentRepo: segmentRepo,
	}
}

func (i *Interactor) ListFans(ctx context.Context, input *ListFansInput) (*FanListResponse, error) {
	// デフォルト値設定
	page := input.Page
	if page < 1 {
		page = 1
	}
	limit := input.Limit
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	// ファン一覧取得
	fans, err := i.fanRepo.FindByUserID(ctx, input.UserID, limit, offset)
	if err != nil {
		log.Printf("Failed to list fans: %v", err)
		return nil, errx.ErrInternalServer
	}

	// 総数取得
	total, err := i.fanRepo.CountByUserID(ctx, input.UserID)
	if err != nil {
		log.Printf("Failed to count fans: %v", err)
		return nil, errx.ErrInternalServer
	}

	totalPages := (total + limit - 1) / limit

	return &FanListResponse{
		Fans:       fans,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, nil
}

func (i *Interactor) GetFan(ctx context.Context, id uuid.UUID) (*model.Fan, error) {
	fan, err := i.fanRepo.FindByID(ctx, id)
	if err != nil {
		log.Printf("Failed to get fan: %v", err)
		return nil, errx.ErrNotFound
	}

	return fan, nil
}

func (i *Interactor) UpdateFanTags(ctx context.Context, input *UpdateFanTagsInput) (*model.Fan, error) {
	fan, err := i.fanRepo.FindByID(ctx, input.ID)
	if err != nil {
		log.Printf("Failed to find fan for tag update: %v", err)
		return nil, errx.ErrNotFound
	}

	fan.UpdateTags(input.Tags)

	err = i.fanRepo.Update(ctx, fan)
	if err != nil {
		log.Printf("Failed to update fan tags: %v", err)
		return nil, errx.ErrInternalServer
	}

	return fan, nil
}

func (i *Interactor) BlockFan(ctx context.Context, input *BlockFanInput) (*model.Fan, error) {
	fan, err := i.fanRepo.FindByID(ctx, input.ID)
	if err != nil {
		log.Printf("Failed to find fan for blocking: %v", err)
		return nil, errx.ErrNotFound
	}

	fan.Block()

	err = i.fanRepo.Update(ctx, fan)
	if err != nil {
		log.Printf("Failed to block fan: %v", err)
		return nil, errx.ErrInternalServer
	}

	return fan, nil
}

func (i *Interactor) UnblockFan(ctx context.Context, input *BlockFanInput) (*model.Fan, error) {
	fan, err := i.fanRepo.FindByID(ctx, input.ID)
	if err != nil {
		log.Printf("Failed to find fan for unblocking: %v", err)
		return nil, errx.ErrNotFound
	}

	fan.Unblock()

	err = i.fanRepo.Update(ctx, fan)
	if err != nil {
		log.Printf("Failed to unblock fan: %v", err)
		return nil, errx.ErrInternalServer
	}

	return fan, nil
}

func (i *Interactor) DeleteFan(ctx context.Context, id uuid.UUID) error {
	err := i.fanRepo.Delete(ctx, id)
	if err != nil {
		log.Printf("Failed to delete fan: %v", err)
		return errx.ErrNotFound
	}

	return nil
}

func (i *Interactor) GetStats(ctx context.Context, userID uuid.UUID) (*model.AudienceStats, error) {
	// 総ファン数
	totalFans, err := i.fanRepo.CountByUserID(ctx, userID)
	if err != nil {
		log.Printf("Failed to count total fans: %v", err)
		return nil, errx.ErrInternalServer
	}

	// アクティブファン数（30日以内）
	activeFans, err := i.fanRepo.CountActiveByUserID(ctx, userID, 30)
	if err != nil {
		log.Printf("Failed to count active fans: %v", err)
		return nil, errx.ErrInternalServer
	}

	// 新規ファン数（7日以内）
	newFansThisWeek, err := i.fanRepo.CountNewByUserID(ctx, userID, 7)
	if err != nil {
		log.Printf("Failed to count new fans this week: %v", err)
		return nil, errx.ErrInternalServer
	}

	// ブロック済みファン数（仮実装：0固定、後で拡張可能）
	blockedFans := 0

	// エンゲージメント率計算
	engagementRate := 0.0
	if totalFans > 0 {
		engagementRate = float64(activeFans) / float64(totalFans) * 100
	}

	return &model.AudienceStats{
		TotalFans:       totalFans,
		ActiveFans:      activeFans,
		NewFansThisWeek: newFansThisWeek,
		BlockedFans:     blockedFans,
		EngagementRate:  engagementRate,
	}, nil
}

func (i *Interactor) GetSegments(ctx context.Context, userID uuid.UUID) ([]*model.Segment, error) {
	segments, err := i.segmentRepo.List(ctx, userID)
	if err != nil {
		log.Printf("Failed to get segments: %v", err)
		return nil, errx.ErrInternalServer
	}

	return segments, nil
}
