package message

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
}
