package handler

import (
	"context"
	"net/http"
	"strconv"

	"vt-link/backend/internal/application/message"
	"vt-link/backend/internal/infrastructure/di"
	httphelper "vt-link/backend/internal/infrastructure/http"
)

// Handler Vercel Functions のハンドラ
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS対応
	httphelper.SetCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	container := di.GetContainer()
	ctx := context.Background()

	switch r.Method {
	case "GET":
		handleGetMessages(w, r, ctx, container)
	case "POST":
		handleCreateMessage(w, r, ctx, container)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleGetMessages(w http.ResponseWriter, r *http.Request, ctx context.Context, container *di.Container) {
	// クエリパラメータを取得
	limitStr := r.URL.Query().Get("limit")
	offsetStr := r.URL.Query().Get("offset")

	limit := 20 // デフォルト
	if limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	offset := 0 // デフォルト
	if offsetStr != "" {
		if parsed, err := strconv.Atoi(offsetStr); err == nil && parsed >= 0 {
			offset = parsed
		}
	}

	input := &message.ListMessagesInput{
		Limit:  limit,
		Offset: offset,
	}

	messages, err := container.MessageUsecase.ListMessages(ctx, input)
	if err != nil {
		httphelper.WriteError(w, err)
		return
	}

	httphelper.WriteJSON(w, http.StatusOK, messages)
}

func handleCreateMessage(w http.ResponseWriter, r *http.Request, ctx context.Context, container *di.Container) {
	var input message.CreateMessageInput
	if err := httphelper.ParseJSON(r, &input); err != nil {
		httphelper.WriteError(w, err)
		return
	}

	newMessage, err := container.MessageUsecase.CreateMessage(ctx, &input)
	if err != nil {
		httphelper.WriteError(w, err)
		return
	}

	httphelper.WriteJSON(w, http.StatusCreated, newMessage)
}
