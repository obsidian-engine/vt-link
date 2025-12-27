package http

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/message"
)

type SchedulerHandler struct {
	usecase         message.Usecase
	schedulerSecret string
}

type RunSchedulerRequest struct {
	Limit int `json:"limit"`
}

type RunSchedulerResponse struct {
	ProcessedCount int `json:"processed_count"`
}

func NewSchedulerHandler(usecase message.Usecase, schedulerSecret string) *SchedulerHandler {
	return &SchedulerHandler{
		usecase:         usecase,
		schedulerSecret: schedulerSecret,
	}
}

// Run handles POST /api/scheduler/run
func (h *SchedulerHandler) Run(c echo.Context) error {
	// 認証: X-Scheduler-Secret ヘッダーの検証
	secret := c.Request().Header.Get("X-Scheduler-Secret")
	if secret == "" || secret != h.schedulerSecret {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	var req RunSchedulerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	// デフォルト値設定
	if req.Limit <= 0 {
		req.Limit = 100
	}

	input := &message.SchedulerInput{
		Now:   time.Now(),
		Limit: req.Limit,
	}

	processedCount, err := h.usecase.RunScheduler(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	response := RunSchedulerResponse{
		ProcessedCount: processedCount,
	}

	return c.JSON(http.StatusOK, response)
}
