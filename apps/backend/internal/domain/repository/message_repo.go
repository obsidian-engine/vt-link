package repository

import (
	"context"
	"time"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

type MessageRepository interface {
	// Create 新しいメッセージを作成
	Create(ctx context.Context, message *model.Message) error

	// FindByID IDでメッセージを取得
	FindByID(ctx context.Context, id uuid.UUID) (*model.Message, error)

	// List メッセージ一覧を取得（ページング対応）
	List(ctx context.Context, limit, offset int) ([]*model.Message, error)

	// Update メッセージを更新
	Update(ctx context.Context, message *model.Message) error

	// FindScheduledMessages スケジュール済みメッセージを取得
	FindScheduledMessages(ctx context.Context, until time.Time, limit int) ([]*model.Message, error)

	// Delete メッセージを削除
	Delete(ctx context.Context, id uuid.UUID) error
}

type TxManager interface {
	// WithinTx トランザクション内で関数を実行
	WithinTx(ctx context.Context, fn func(ctx context.Context) error) error
}
