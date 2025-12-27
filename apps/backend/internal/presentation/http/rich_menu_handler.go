package http

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/application/richmenu"
	"vt-link/backend/internal/domain/model"
)

type RichMenuHandler struct {
	usecase richmenu.Usecase
}

type CreateRichMenuRequest struct {
	Name        string               `json:"name" validate:"required"`
	ChatBarText string               `json:"chatBarText" validate:"required"`
	ImageURL    string               `json:"imageUrl" validate:"required"`
	Size        model.RichMenuSize   `json:"size" validate:"required"`
	Areas       []model.RichMenuArea `json:"areas" validate:"required,min=1,max=6"`
}

type UpdateRichMenuRequest struct {
	Name        *string               `json:"name"`
	ChatBarText *string               `json:"chatBarText"`
	ImageURL    *string               `json:"imageUrl"`
	Size        *model.RichMenuSize   `json:"size"`
	Areas       *[]model.RichMenuArea `json:"areas"`
}

func NewRichMenuHandler(usecase richmenu.Usecase) *RichMenuHandler {
	return &RichMenuHandler{
		usecase: usecase,
	}
}

// CreateRichMenu handles POST /api/v1/richmenu
func (h *RichMenuHandler) CreateRichMenu(c echo.Context) error {
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

	var req CreateRichMenuRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	input := &richmenu.CreateRichMenuInput{
		UserID:      userID,
		Name:        req.Name,
		ChatBarText: req.ChatBarText,
		ImageURL:    req.ImageURL,
		Size:        req.Size,
		Areas:       req.Areas,
	}

	menu, err := h.usecase.CreateRichMenu(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, menu)
}

// GetRichMenu handles GET /api/v1/richmenu
func (h *RichMenuHandler) GetRichMenu(c echo.Context) error {
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

	menu, err := h.usecase.GetRichMenu(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"error": "rich menu not found",
		})
	}

	return c.JSON(http.StatusOK, menu)
}

// UpdateRichMenu handles PUT /api/v1/richmenu/:id
func (h *RichMenuHandler) UpdateRichMenu(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid rich menu ID",
		})
	}

	var req UpdateRichMenuRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid request body",
		})
	}

	input := &richmenu.UpdateRichMenuInput{
		ID:          id,
		Name:        req.Name,
		ChatBarText: req.ChatBarText,
		ImageURL:    req.ImageURL,
		Size:        req.Size,
		Areas:       req.Areas,
	}

	menu, err := h.usecase.UpdateRichMenu(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, menu)
}

// DeleteRichMenu handles DELETE /api/v1/richmenu/:id
func (h *RichMenuHandler) DeleteRichMenu(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid rich menu ID",
		})
	}

	err = h.usecase.DeleteRichMenu(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.NoContent(http.StatusNoContent)
}

// PublishToLINE handles POST /api/v1/richmenu/:id/publish
func (h *RichMenuHandler) PublishToLINE(c echo.Context) error {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"error": "invalid rich menu ID",
		})
	}

	err = h.usecase.PublishToLINE(c.Request().Context(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "Rich menu published to LINE successfully",
	})
}
