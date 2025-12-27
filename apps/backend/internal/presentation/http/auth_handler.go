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
	User      User   `json:"user"`
	CSRFToken string `json:"csrfToken"`
}

type User struct {
	ID          string `json:"id"`
	DisplayName string `json:"displayName"`
	PictureURL  string `json:"pictureUrl"`
	Email       string `json:"email"`
}

type RefreshResponse struct {
	CSRFToken string `json:"csrfToken"`
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

	// 4. Set tokens in HttpOnly cookies
	auth.SetAccessTokenCookie(c, accessToken)
	auth.SetRefreshTokenCookie(c, refreshToken)

	// 5. Generate CSRF token
	csrfToken, err := auth.GenerateCSRFToken()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to generate CSRF token",
		})
	}
	auth.SetCSRFTokenCookie(c, csrfToken)

	// 6. Return response
	return c.JSON(http.StatusOK, LoginResponse{
		User: User{
			ID:          profile.UserID,
			DisplayName: profile.DisplayName,
			PictureURL:  profile.PictureURL,
			Email:       profile.Email,
		},
		CSRFToken: csrfToken,
	})
}

// Logout handles POST /auth/logout
func (h *AuthHandler) Logout(c echo.Context) error {
	// Clear authentication cookies
	auth.ClearAuthCookies(c)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok": true,
	})
}

// Refresh handles POST /auth/refresh
func (h *AuthHandler) Refresh(c echo.Context) error {
	// 1. Get refresh token from cookie
	refreshToken, err := auth.GetRefreshTokenFromCookie(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "refresh token not found",
		})
	}

	// 2. Validate refresh token
	claims, err := h.jwtManager.ValidateToken(refreshToken)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "invalid refresh token",
		})
	}

	// 3. Generate new access token
	accessToken, err := h.jwtManager.GenerateToken(claims.UserID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to generate access token",
		})
	}
	auth.SetAccessTokenCookie(c, accessToken)

	// 4. Generate new CSRF token
	csrfToken, err := auth.GenerateCSRFToken()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to generate CSRF token",
		})
	}
	auth.SetCSRFTokenCookie(c, csrfToken)

	// 5. Return response
	return c.JSON(http.StatusOK, RefreshResponse{
		CSRFToken: csrfToken,
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
