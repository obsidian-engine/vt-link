package repository

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"
)

type Pusher interface {
	// PushText テキストメッセージを送信
	PushText(ctx context.Context, text string) error

	// PushMessage より詳細なメッセージを送信
	PushMessage(ctx context.Context, title, body string) error

	// PushWithRetry 指数バックオフでリトライしながらメッセージを送信
	PushWithRetry(ctx context.Context, message string, maxRetries int) error

	// Broadcast 全ユーザーにブロードキャスト
	Broadcast(ctx context.Context, message string) error

	// MulticastByAudience オーディエンスIDのリストでマルチキャスト
	MulticastByAudience(ctx context.Context, audienceIDs []string, message string) error
}
