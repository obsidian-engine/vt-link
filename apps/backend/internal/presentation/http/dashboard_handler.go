package http

import (
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/dashboard"
	"vt-link/backend/internal/infrastructure/db"
)

// DashboardHandler ダッシュボードハンドラー
type DashboardHandler struct {
	usecase dashboard.Usecase
	db      *db.DB
}

// NewDashboardHandler Dashboardハンドラーを生成
func NewDashboardHandler(usecase dashboard.Usecase, database *db.DB) *DashboardHandler {
	return &DashboardHandler{
		usecase: usecase,
		db:      database,
	}
}

// getUserIDFromLineUserID converts LINE user ID to internal UUID
// TODO: Move this to a proper repository layer
func (h *DashboardHandler) getUserIDFromLineUserID(lineUserID string) (uuid.UUID, error) {
	var userID uuid.UUID
	err := h.db.QueryRow("SELECT id FROM users WHERE line_user_id = $1", lineUserID).Scan(&userID)
	if err != nil {
		return uuid.Nil, fmt.Errorf("user not found: %w", err)
	}
	return userID, nil
}

// GetStats handles GET /api/v1/dashboard/stats
func (h *DashboardHandler) GetStats(c echo.Context) error {
	// Get LINE user ID from context (set by JWT middleware)
	lineUserID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	// Convert LINE user ID to internal UUID
	userID, err := h.getUserIDFromLineUserID(lineUserID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "user not found",
		})
	}

	stats, err := h.usecase.GetStats(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": stats,
	})
}

// GetCampaigns handles GET /api/v1/campaigns
func (h *DashboardHandler) GetCampaigns(c echo.Context) error {
	// Get LINE user ID from context (set by JWT middleware)
	lineUserID, ok := c.Get("userID").(string)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	// Convert LINE user ID to internal UUID
	userID, err := h.getUserIDFromLineUserID(lineUserID)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "user not found",
		})
	}

	campaigns, err := h.usecase.GetCampaigns(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": campaigns,
	})
}
