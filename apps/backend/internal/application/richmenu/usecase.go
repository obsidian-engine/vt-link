package richmenu

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
)

type CreateRichMenuInput struct {
	UserID      uuid.UUID            `json:"userId"`
	Name        string               `json:"name"`
	ChatBarText string               `json:"chatBarText"`
	ImageURL    string               `json:"imageUrl"`
	Size        model.RichMenuSize   `json:"size"`
	Areas       []model.RichMenuArea `json:"areas"`
}

type UpdateRichMenuInput struct {
	ID          uuid.UUID             `json:"id"`
	Name        *string               `json:"name"`
	ChatBarText *string               `json:"chatBarText"`
	ImageURL    *string               `json:"imageUrl"`
	Size        *model.RichMenuSize   `json:"size"`
	Areas       *[]model.RichMenuArea `json:"areas"`
}

type Usecase interface {
	// CreateRichMenu リッチメニューを作成（1アカウント1メニュー制約）
	CreateRichMenu(ctx context.Context, input *CreateRichMenuInput) (*model.RichMenu, error)

	// GetRichMenu ユーザーのリッチメニューを取得
	GetRichMenu(ctx context.Context, userID uuid.UUID) (*model.RichMenu, error)

	// UpdateRichMenu リッチメニューを更新
	UpdateRichMenu(ctx context.Context, input *UpdateRichMenuInput) (*model.RichMenu, error)

	// DeleteRichMenu リッチメニューを削除（LINEからも削除）
	DeleteRichMenu(ctx context.Context, id uuid.UUID) error

	// PublishToLINE リッチメニューをLINEに公開
	PublishToLINE(ctx context.Context, id uuid.UUID) error
}
