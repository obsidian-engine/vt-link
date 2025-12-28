package message

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"
	"time"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type CreateMessageInput struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

type ListMessagesInput struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}

type SendMessageInput struct {
	ID uuid.UUID `json:"id"`
}

type SchedulerInput struct {
	Now   time.Time `json:"now"`
	Limit int       `json:"limit"`
}

type UpdateMessageInput struct {
	ID          uuid.UUID  `json:"id"`
	Title       *string    `json:"title,omitempty"`
	Body        *string    `json:"body,omitempty"`
	ScheduledAt *time.Time `json:"scheduled_at,omitempty"`
}

type Usecase interface {
	// CreateMessage メッセージを作成
	CreateMessage(ctx context.Context, input *CreateMessageInput) (*model.Message, error)

	// ListMessages メッセージ一覧を取得
	ListMessages(ctx context.Context, input *ListMessagesInput) ([]*model.Message, error)

	// GetMessage メッセージを取得
	GetMessage(ctx context.Context, id uuid.UUID) (*model.Message, error)

	// SendMessage 即時送信
	SendMessage(ctx context.Context, input *SendMessageInput) error

	// RunScheduler スケジューラ実行（スケジュール済み配信の処理）
	RunScheduler(ctx context.Context, input *SchedulerInput) (int, error)

	// UpdateMessage メッセージを更新（部分更新対応）
	UpdateMessage(ctx context.Context, input *UpdateMessageInput) (*model.Message, error)

	// DeleteMessage メッセージを削除
	DeleteMessage(ctx context.Context, id uuid.UUID) error
}
