package service

import (
	"context"
)

type Pusher interface {
	// PushText テキストメッセージを送信
	PushText(ctx context.Context, text string) error

	// PushMessage より詳細なメッセージを送信
	PushMessage(ctx context.Context, title, body string) error
}