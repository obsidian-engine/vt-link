package auth

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"
)

type LoginInput struct {
	Code  string `json:"code"`
	State string `json:"state"`
}

type LoginOutput struct {
	UserID       string `json:"user_id"`
	DisplayName  string `json:"display_name"`
	PictureURL   string `json:"picture_url"`
	Email        string `json:"email"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	CSRFToken    string `json:"csrf_token"`
}

type RefreshOutput struct {
	AccessToken string `json:"access_token"`
	CSRFToken   string `json:"csrf_token"`
}

type GenerateStateOutput struct {
	State string `json:"state"`
}

type Usecase interface {
	// GenerateState OAuth state パラメータを生成
	GenerateState(ctx context.Context) (*GenerateStateOutput, error)

	// Login LINE OAuth認証を実行してJWTを発行
	Login(ctx context.Context, input *LoginInput) (*LoginOutput, error)

	// Logout 認証情報をクリア
	Logout(ctx context.Context) error

	// Refresh リフレッシュトークンから新しいアクセストークンを発行
	Refresh(ctx context.Context, refreshToken string) (*RefreshOutput, error)
}
