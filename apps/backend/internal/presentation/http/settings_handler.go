package http

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/settings"
)

type SettingsHandler struct {
	usecase settings.Usecase
}

type UpdateSettingsRequest struct {
	DefaultReplyDelay   *int    `json:"defaultReplyDelay"`
	NotificationEnabled *bool   `json:"notificationEnabled"`
	Timezone            *string `json:"timezone"`
	Language            *string `json:"language"`
}

func NewSettingsHandler(usecase settings.Usecase) *SettingsHandler {
	return &SettingsHandler{
		usecase: usecase,
	}
}

// GetSettings handles GET /api/v1/settings
func (h *SettingsHandler) GetSettings(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userIDStr, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "invalid user ID",
		})
	}

	userSettings, err := h.usecase.GetSettings(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok":   true,
		"data": userSettings,
	})
}

// UpdateSettings handles PUT /api/v1/settings
func (h *SettingsHandler) UpdateSettings(c echo.Context) error {
	// Get user ID from context
	userIDStr, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "invalid user ID",
		})
	}

	var req UpdateSettingsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	input := &settings.UpdateSettingsInput{
		UserID:              userID,
		DefaultReplyDelay:   req.DefaultReplyDelay,
		NotificationEnabled: req.NotificationEnabled,
		Timezone:            req.Timezone,
		Language:            req.Language,
	}

	userSettings, err := h.usecase.UpdateSettings(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok":   true,
		"data": userSettings,
	})
}
