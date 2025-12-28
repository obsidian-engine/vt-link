package http

import (
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/autoreply"
	"vt-link/backend/internal/domain/model"
)

type AutoReplyHandler struct {
	usecase autoreply.Usecase
}

type CreateRuleRequest struct {
	Type         model.AutoReplyRuleType `json:"type" validate:"required"`
	Name         string                  `json:"name" validate:"required"`
	Keywords     []string                `json:"keywords"`
	MatchType    *model.MatchType        `json:"matchType"`
	ReplyMessage string                  `json:"replyMessage" validate:"required"`
	Priority     int                     `json:"priority"`
}

type UpdateRuleRequest struct {
	Name         *string          `json:"name"`
	Keywords     []string         `json:"keywords"`
	MatchType    *model.MatchType `json:"matchType"`
	ReplyMessage *string          `json:"replyMessage"`
	IsEnabled    *bool            `json:"isEnabled"`
	Priority     *int             `json:"priority"`
}

type BulkUpdateRuleItem struct {
	ID        string `json:"id" validate:"required"`
	IsEnabled bool   `json:"isEnabled"`
}

type BulkUpdateRulesRequest struct {
	Updates []BulkUpdateRuleItem `json:"updates" validate:"required"`
}

func NewAutoReplyHandler(usecase autoreply.Usecase) *AutoReplyHandler {
	return &AutoReplyHandler{
		usecase: usecase,
	}
}

// CreateRule handles POST /api/v1/autoreply/rules
func (h *AutoReplyHandler) CreateRule(c echo.Context) error {
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

	var req CreateRuleRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	input := &autoreply.CreateRuleInput{
		UserID:       userID,
		Type:         req.Type,
		Name:         req.Name,
		Keywords:     req.Keywords,
		MatchType:    req.MatchType,
		ReplyMessage: req.ReplyMessage,
		Priority:     req.Priority,
	}

	rule, err := h.usecase.CreateRule(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, rule)
}

// ListRules handles GET /api/v1/autoreply/rules
func (h *AutoReplyHandler) ListRules(c echo.Context) error {
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

	rules, err := h.usecase.ListRules(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, rules)
}

// UpdateRule handles PUT /api/v1/autoreply/rules/:id
func (h *AutoReplyHandler) UpdateRule(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid rule ID",
		})
	}

	var req UpdateRuleRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	input := &autoreply.UpdateRuleInput{
		ID:           id,
		Name:         req.Name,
		Keywords:     req.Keywords,
		MatchType:    req.MatchType,
		ReplyMessage: req.ReplyMessage,
		IsEnabled:    req.IsEnabled,
		Priority:     req.Priority,
	}

	rule, err := h.usecase.UpdateRule(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, rule)
}

// DeleteRule handles DELETE /api/v1/autoreply/rules/:id
func (h *AutoReplyHandler) DeleteRule(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid rule ID",
		})
	}

	err = h.usecase.DeleteRule(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.NoContent(http.StatusNoContent)
}

// BulkUpdateRules handles PATCH /api/v1/autoreply/rules/bulk
func (h *AutoReplyHandler) BulkUpdateRules(c echo.Context) error {
	var req BulkUpdateRulesRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	if len(req.Updates) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "updates array is required",
		})
	}

	updates := make([]autoreply.BulkUpdateRuleInput, len(req.Updates))
	for i, item := range req.Updates {
		id, err := uuid.Parse(item.ID)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "invalid rule ID: " + item.ID,
			})
		}
		updates[i] = autoreply.BulkUpdateRuleInput{
			ID:        id,
			IsEnabled: item.IsEnabled,
		}
	}

	input := &autoreply.BulkUpdateInput{
		Updates: updates,
	}

	err := h.usecase.BulkUpdateRules(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "rules updated successfully",
		"count":   len(req.Updates),
	})
}

// HandleWebhook handles POST /webhook
func (h *AutoReplyHandler) HandleWebhook(c echo.Context) error {
	signature := c.Request().Header.Get("X-Line-Signature")
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "failed to read request body",
		})
	}

	input := &autoreply.WebhookInput{
		Signature: signature,
		Body:      body,
	}

	err = h.usecase.ProcessWebhook(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.NoContent(http.StatusOK)
}
