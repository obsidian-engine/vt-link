package http

import (
	"net/http"

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
	stats, err := h.usecase.GetStats(c.Request().Context())
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
	campaigns, err := h.usecase.GetCampaigns(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data": campaigns,
	})
}
