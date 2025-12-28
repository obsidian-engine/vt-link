package http

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/dashboard"
)

// DashboardHandler ダッシュボードハンドラー
type DashboardHandler struct {
	usecase dashboard.Usecase
}

// NewDashboardHandler Dashboardハンドラーを生成
func NewDashboardHandler(usecase dashboard.Usecase) *DashboardHandler {
	return &DashboardHandler{
		usecase: usecase,
	}
}

// GetStats handles GET /api/v1/dashboard/stats
func (h *DashboardHandler) GetStats(c echo.Context) error {
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
