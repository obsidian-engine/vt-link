package http

import (
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/audience"
)

type AudienceHandler struct {
	usecase audience.Usecase
}

type UpdateFanTagsRequest struct {
	Tags []string `json:"tags" validate:"required"`
}

func NewAudienceHandler(usecase audience.Usecase) *AudienceHandler {
	return &AudienceHandler{
		usecase: usecase,
	}
}

// ListFans handles GET /api/v1/audience/fans
func (h *AudienceHandler) ListFans(c echo.Context) error {
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

	// Get pagination parameters
	page, _ := strconv.Atoi(c.QueryParam("page"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	input := &audience.ListFansInput{
		UserID: userID,
		Page:   page,
		Limit:  limit,
	}

	result, err := h.usecase.ListFans(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok": true,
		"data": result.Fans,
		"pagination": map[string]interface{}{
			"total":      result.Total,
			"page":       result.Page,
			"limit":      result.Limit,
			"totalPages": result.TotalPages,
		},
	})
}

// GetFan handles GET /api/v1/audience/fans/:id
func (h *AudienceHandler) GetFan(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid fan ID",
		})
	}

	fan, err := h.usecase.GetFan(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok":   true,
		"data": fan,
	})
}

// UpdateFanTags handles PUT /api/v1/audience/fans/:id/tags
func (h *AudienceHandler) UpdateFanTags(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid fan ID",
		})
	}

	var req UpdateFanTagsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	input := &audience.UpdateFanTagsInput{
		ID:   id,
		Tags: req.Tags,
	}

	fan, err := h.usecase.UpdateFanTags(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok":   true,
		"data": fan,
	})
}

// BlockFan handles POST /api/v1/audience/fans/:id/block
func (h *AudienceHandler) BlockFan(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid fan ID",
		})
	}

	input := &audience.BlockFanInput{
		ID: id,
	}

	fan, err := h.usecase.BlockFan(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok":   true,
		"data": fan,
	})
}

// UnblockFan handles POST /api/v1/audience/fans/:id/unblock
func (h *AudienceHandler) UnblockFan(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid fan ID",
		})
	}

	input := &audience.BlockFanInput{
		ID: id,
	}

	fan, err := h.usecase.UnblockFan(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"ok":   true,
		"data": fan,
	})
}

// DeleteFan handles DELETE /api/v1/audience/fans/:id
func (h *AudienceHandler) DeleteFan(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid fan ID",
		})
	}

	err = h.usecase.DeleteFan(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.NoContent(http.StatusNoContent)
}
