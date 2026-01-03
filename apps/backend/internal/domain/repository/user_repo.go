package repository

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"

	"vt-link/backend/internal/domain/model"
)

// UserRepository ユーザーリポジトリ
type UserRepository interface {
	// FindByLineUserID LINE User IDからユーザーを検索
	FindByLineUserID(ctx context.Context, lineUserID string) (*model.User, error)

	// FindByLineBotUserID LINE Bot User IDからユーザーを検索
	FindByLineBotUserID(ctx context.Context, lineBotUserID string) (*model.User, error)

	// Create ユーザーを作成
	Create(ctx context.Context, user *model.User) error

	// Upsert ユーザーを作成または更新（LINE User IDで重複チェック）
	Upsert(ctx context.Context, user *model.User) (*model.User, error)
}
