package http

import (
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/message"
)

// MessageHandler handles HTTP requests for message management
type MessageHandler struct {
	usecase message.Usecase
}

// CreateMessageRequest represents the request body for creating a message
type CreateMessageRequest struct {
	Title string `json:"title" validate:"required"`
	Body  string `json:"body" validate:"required"`
}

// UpdateMessageRequest represents the request body for updating a message
type UpdateMessageRequest struct {
	Title *string `json:"title"`
	Body  *string `json:"body"`
}

// NewMessageHandler creates a new MessageHandler instance
func NewMessageHandler(usecase message.Usecase) *MessageHandler {
	return &MessageHandler{
		usecase: usecase,
	}
}

// ListMessages handles GET /api/v1/messages
func (h *MessageHandler) ListMessages(c echo.Context) error {
	// Parse query parameters
	limitStr := c.QueryParam("limit")
	offsetStr := c.QueryParam("offset")

	limit := 10 // default
	offset := 0 // default

	if limitStr != "" {
		parsedLimit, err := strconv.Atoi(limitStr)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "invalid limit parameter",
			})
		}
		limit = parsedLimit
	}

	if offsetStr != "" {
		parsedOffset, err := strconv.Atoi(offsetStr)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"error": "invalid offset parameter",
			})
		}
		offset = parsedOffset
	}

	input := &message.ListMessagesInput{
		Limit:  limit,
		Offset: offset,
	}

	messages, err := h.usecase.ListMessages(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, messages)
}

// CreateMessage handles POST /api/v1/messages
func (h *MessageHandler) CreateMessage(c echo.Context) error {
	var req CreateMessageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	input := &message.CreateMessageInput{
		Title: req.Title,
		Body:  req.Body,
	}

	msg, err := h.usecase.CreateMessage(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, msg)
}

// GetMessage handles GET /api/v1/messages/:id
func (h *MessageHandler) GetMessage(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid message ID",
		})
	}

	msg, err := h.usecase.GetMessage(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, msg)
}

// UpdateMessage handles PUT /api/v1/messages/:id
func (h *MessageHandler) UpdateMessage(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid message ID",
		})
	}

	var req UpdateMessageRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	// Note: UpdateMessageInput will be defined by dev3 in usecase.go
	input := &message.UpdateMessageInput{
		ID:    id,
		Title: req.Title,
		Body:  req.Body,
	}

	msg, err := h.usecase.UpdateMessage(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, msg)
}

// DeleteMessage handles DELETE /api/v1/messages/:id
func (h *MessageHandler) DeleteMessage(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid message ID",
		})
	}

	err = h.usecase.DeleteMessage(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.NoContent(http.StatusNoContent)
}

// SendMessage handles POST /api/v1/messages/:id/send
func (h *MessageHandler) SendMessage(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid message ID",
		})
	}

	input := &message.SendMessageInput{
		ID: id,
	}

	err = h.usecase.SendMessage(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.NoContent(http.StatusOK)
}
