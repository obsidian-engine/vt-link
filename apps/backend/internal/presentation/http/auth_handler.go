package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/infrastructure/auth"
	"vt-link/backend/internal/infrastructure/external"
)

type AuthHandler struct {
	oauthClient *external.LineOAuthClient
	jwtManager  *auth.JWTManager
}

type LoginRequest struct {
	Code string `json:"code" validate:"required"`
}

type LoginResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	User         User   `json:"user"`
}

type User struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	PictureURL  string `json:"pictureUrl"`
	Email       string `json:"email"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
}

type RefreshResponse struct {
	AccessToken string `json:"accessToken"`
}

func NewAuthHandler(oauthClient *external.LineOAuthClient, jwtManager *auth.JWTManager) *AuthHandler {
	return &AuthHandler{
		oauthClient: oauthClient,
		jwtManager:  jwtManager,
	}
}

// Login handles POST /auth/login
func (h *AuthHandler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	// 1. Exchange authorization code for tokens
	tokenResp, err := h.oauthClient.ExchangeCode(c.Request().Context(), req.Code)
	if err != nil {
		c.Logger().Errorf("Failed to exchange code: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "failed to exchange code",
		})
	}

	// 2. Get LINE profile
	profile, err := h.oauthClient.GetProfile(c.Request().Context(), tokenResp.AccessToken)
	if err != nil {
		c.Logger().Errorf("Failed to get profile: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "failed to get profile",
		})
	}

	// 3. Generate JWT tokens
	accessToken, err := h.jwtManager.GenerateToken(profile.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to generate access token",
		})
	}

	refreshToken, err := h.jwtManager.GenerateRefreshToken(profile.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to generate refresh token",
		})
	}

	// 4. Return response
	return c.JSON(http.StatusOK, LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User: User{
			ID:          profile.UserID,
			DisplayName: profile.DisplayName,
			PictureURL:  profile.PictureURL,
			Email:       profile.Email,
		},
	})
}

// Logout handles POST /auth/logout
func (h *AuthHandler) Logout(c echo.Context) error {
	// Stateless session, so no-op for now
	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok": true,
	})
}

// Refresh handles POST /auth/refresh
func (h *AuthHandler) Refresh(c echo.Context) error {
	var req RefreshRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	// 1. Validate refresh token
	claims, err := h.jwtManager.ValidateToken(req.RefreshToken)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "invalid refresh token",
		})
	}

	// 2. Generate new access token
	accessToken, err := h.jwtManager.GenerateToken(claims.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to generate access token",
		})
	}

	// 3. Return response
	return c.JSON(http.StatusOK, RefreshResponse{
		AccessToken: accessToken,
	})
}

// Me handles GET /auth/me
func (h *AuthHandler) Me(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	// For now, just return the user ID
	// In the future, fetch user details from database
	return c.JSON(http.StatusOK, map[string]interface{}{
		"user_id": userID,
	})
}
