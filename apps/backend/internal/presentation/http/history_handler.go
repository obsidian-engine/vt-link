package http

import (
	"log"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/history"
)

// HistoryHandler handles HTTP requests for message history
type HistoryHandler struct {
	usecase history.Usecase
}

// NewHistoryHandler creates a new HistoryHandler instance
func NewHistoryHandler(usecase history.Usecase) *HistoryHandler {
	return &HistoryHandler{
		usecase: usecase,
	}
}

// ListHistory handles GET /api/v1/history
func (h *HistoryHandler) ListHistory(c echo.Context) error {
	// Get user ID from context (set by JWT middleware)
	userIDStr := c.Get("userID")
	if userIDStr == nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid user ID",
		})
	}

	// Parse query parameters
	limitStr := c.QueryParam("limit")
	offsetStr := c.QueryParam("offset")

	limit := DefaultLimit
	offset := DefaultOffset

	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err != nil || parsedLimit < 0 || parsedLimit > MaxLimit {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "invalid limit parameter (0-100)",
			})
		}
		limit = parsedLimit
	}

	if offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err != nil || parsedOffset < 0 {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "invalid offset parameter",
			})
		}
		offset = parsedOffset
	}

	input := &history.ListHistoryInput{
		UserID: userID,
		Limit:  limit,
		Offset: offset,
	}

	histories, err := h.usecase.ListHistory(c.Request().Context(), input)
	if err != nil {
		log.Printf("Failed to list history: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to retrieve history",
		})
	}

	return c.JSON(http.StatusOK, histories)
}

// GetHistory handles GET /api/v1/history/:id
func (h *HistoryHandler) GetHistory(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid history ID",
		})
	}

	hist, err := h.usecase.GetHistory(c.Request().Context(), id)
	if err != nil {
		log.Printf("Failed to get history: %v", err)
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "history not found",
		})
	}

	return c.JSON(http.StatusOK, hist)
}

// GetStats handles GET /api/v1/history/stats
func (h *HistoryHandler) GetStats(c echo.Context) error {
	// Get user ID from context
	userIDStr := c.Get("userID")
	if userIDStr == nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error": "unauthorized",
		})
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid user ID",
		})
	}

	stats, err := h.usecase.GetStats(c.Request().Context(), userID)
	if err != nil {
		log.Printf("Failed to get history stats: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to retrieve history stats",
		})
	}

	return c.JSON(http.StatusOK, stats)
}
