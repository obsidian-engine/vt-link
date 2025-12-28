package repository

import "context"

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

type LineReplier interface {
	Reply(ctx context.Context, replyToken, text string) error
}
