package http

import (
	"log"
	"net/http"
	"strconv"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/message"
)

const (
	DefaultLimit  = 10
	DefaultOffset = 0
	MaxLimit      = 100
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

	input := &message.ListMessagesInput{
		Limit:  limit,
		Offset: offset,
	}

	messages, err := h.usecase.ListMessages(c.Request().Context(), input)
	if err != nil {
		log.Printf("Failed to list messages: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to retrieve messages",
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

	// バリデーション
	if req.Title == "" || req.Body == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "title and body are required",
		})
	}

	input := &message.CreateMessageInput{
		Title: req.Title,
		Body:  req.Body,
	}

	msg, err := h.usecase.CreateMessage(c.Request().Context(), input)
	if err != nil {
		log.Printf("Failed to create message: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to create message",
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
		log.Printf("Failed to get message: %v", err)
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "message not found",
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

	input := &message.UpdateMessageInput{
		ID:    id,
		Title: req.Title,
		Body:  req.Body,
	}

	msg, err := h.usecase.UpdateMessage(c.Request().Context(), input)
	if err != nil {
		log.Printf("Failed to update message: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to update message",
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
		log.Printf("Failed to delete message: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to delete message",
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
		log.Printf("Failed to send message: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": "failed to send message",
		})
	}

	return c.NoContent(http.StatusNoContent)
}
