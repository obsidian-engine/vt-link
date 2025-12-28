package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	authApp "vt-link/backend/internal/application/auth"
	"vt-link/backend/internal/infrastructure/auth"
)

type AuthHandler struct {
	authUsecase authApp.Usecase
}

type LoginRequest struct {
	Code  string `json:"code" validate:"required"`
	State string `json:"state" validate:"required"`
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

func NewAuthHandler(authUsecase authApp.Usecase) *AuthHandler {
	return &AuthHandler{
		authUsecase: authUsecase,
	}
}

// GenerateState handles GET /auth/state
func (h *AuthHandler) GenerateState(c echo.Context) error {
	output, err := h.authUsecase.GenerateState(c.Request().Context())
	if err != nil {
		c.Logger().Errorf("Failed to generate state: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to generate state",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"state": output.State,
	})
}

// Login handles POST /auth/login
func (h *AuthHandler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	// Note: state validation is performed on the frontend side using sessionStorage.
	// Backend only receives the state for API consistency and potential future use.

	// Call usecase
	output, err := h.authUsecase.Login(c.Request().Context(), &authApp.LoginInput{
		Code:  req.Code,
		State: req.State,
	})
	if err != nil {
		c.Logger().Errorf("Login failed: %v", err)
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "authentication failed",
		})
	}

	// Set tokens in HttpOnly cookies (Presentation layer responsibility)
	auth.SetAccessTokenCookie(c, output.AccessToken)
	auth.SetRefreshTokenCookie(c, output.RefreshToken)
	auth.SetCSRFTokenCookie(c, output.CSRFToken)

	// Return response
	return c.JSON(http.StatusOK, LoginResponse{
		User: User{
			ID:          output.UserID,
			DisplayName: output.DisplayName,
			PictureURL:  output.PictureURL,
			Email:       output.Email,
		},
		CSRFToken: output.CSRFToken,
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
	// Get refresh token from cookie
	refreshToken, err := auth.GetRefreshTokenFromCookie(c)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "refresh token not found",
		})
	}

	// Call usecase
	output, err := h.authUsecase.Refresh(c.Request().Context(), refreshToken)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "invalid refresh token",
		})
	}

	// Set new tokens in HttpOnly cookies (Presentation layer responsibility)
	auth.SetAccessTokenCookie(c, output.AccessToken)
	auth.SetCSRFTokenCookie(c, output.CSRFToken)

	// Return response
	return c.JSON(http.StatusOK, RefreshResponse{
		CSRFToken: output.CSRFToken,
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
