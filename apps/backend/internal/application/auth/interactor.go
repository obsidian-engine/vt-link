package auth

import (
	"context"
	"log"

	"vt-link/backend/internal/infrastructure/auth"
	"vt-link/backend/internal/infrastructure/external"
	"vt-link/backend/internal/shared/errx"
)

type Interactor struct {
	oauthClient *external.LineOAuthClient
	jwtManager  *auth.JWTManager
	stateStore  auth.StateStore
}

func NewInteractor(
	oauthClient *external.LineOAuthClient,
	jwtManager *auth.JWTManager,
	stateStore auth.StateStore,
) Usecase {
	return &Interactor{
		oauthClient: oauthClient,
		jwtManager:  jwtManager,
		stateStore:  stateStore,
	}
}

func (i *Interactor) Login(ctx context.Context, input *LoginInput) (*LoginOutput, error) {
	// Validate state parameter to prevent CSRF attacks
	if err := i.stateStore.Validate(input.State); err != nil {
		log.Printf("State validation failed: %v", err)
		return nil, errx.NewAppError("INVALID_STATE", "Invalid or expired state parameter", 401)
	}

	if input.Code == "" {
		return nil, errx.ErrInvalidInput
	}

	// 1. Exchange authorization code for tokens
	tokenResp, err := i.oauthClient.ExchangeCode(ctx, input.Code)
	if err != nil {
		log.Printf("Failed to exchange code: %v", err)
		return nil, errx.NewAppError("OAUTH_FAILED", "Failed to exchange authorization code", 401)
	}

	// 2. Get LINE profile
	profile, err := i.oauthClient.GetProfile(ctx, tokenResp.AccessToken)
	if err != nil {
		log.Printf("Failed to get profile: %v", err)
		return nil, errx.NewAppError("PROFILE_FAILED", "Failed to get user profile", 401)
	}

	// 3. Generate JWT tokens
	accessToken, err := i.jwtManager.GenerateToken(profile.UserID)
	if err != nil {
		log.Printf("Failed to generate access token: %v", err)
		return nil, errx.ErrInternalServer
	}

	refreshToken, err := i.jwtManager.GenerateRefreshToken(profile.UserID)
	if err != nil {
		log.Printf("Failed to generate refresh token: %v", err)
		return nil, errx.ErrInternalServer
	}

	// 4. Generate CSRF token
	csrfToken, err := auth.GenerateCSRFToken()
	if err != nil {
		log.Printf("Failed to generate CSRF token: %v", err)
		return nil, errx.ErrInternalServer
	}

	// Return tokens and profile data for presentation layer to handle
	return &LoginOutput{
		UserID:       profile.UserID,
		DisplayName:  profile.DisplayName,
		PictureURL:   profile.PictureURL,
		Email:        profile.Email,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		CSRFToken:    csrfToken,
	}, nil
}

func (i *Interactor) Logout(ctx context.Context) error {
	// Cookie clearing is handled in the presentation layer
	// This method exists for API consistency
	return nil
}

func (i *Interactor) Refresh(ctx context.Context, refreshToken string) (*RefreshOutput, error) {
	if refreshToken == "" {
		return nil, errx.NewAppError("INVALID_TOKEN", "Refresh token is required", 401)
	}

	// 1. Validate refresh token
	claims, err := i.jwtManager.ValidateToken(refreshToken)
	if err != nil {
		log.Printf("Failed to validate refresh token: %v", err)
		return nil, errx.NewAppError("INVALID_TOKEN", "Invalid refresh token", 401)
	}

	// 2. Generate new access token
	accessToken, err := i.jwtManager.GenerateToken(claims.UserID)
	if err != nil {
		log.Printf("Failed to generate access token: %v", err)
		return nil, errx.ErrInternalServer
	}

	// 3. Generate new CSRF token
	csrfToken, err := auth.GenerateCSRFToken()
	if err != nil {
		log.Printf("Failed to generate CSRF token: %v", err)
		return nil, errx.ErrInternalServer
	}

	// Return new tokens for presentation layer to handle
	return &RefreshOutput{
		AccessToken: accessToken,
		CSRFToken:   csrfToken,
	}, nil
}
