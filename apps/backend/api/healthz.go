package handler

import (
	"context"
	"net/http"
	"time"

	"vt-link/backend/internal/infrastructure/di"
	httphelper "vt-link/backend/internal/infrastructure/http"
)

type HealthStatus struct {
	Status   string `json:"status"`
	Database string `json:"database"`
	Time     string `json:"time"`
}

// Handler Vercel Functions のハンドラ
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS対応
	httphelper.SetCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	container := di.GetContainer()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	status := HealthStatus{
		Status:   "ok",
		Database: "ok",
		Time:     time.Now().UTC().Format(time.RFC3339),
	}

	// データベース接続チェック
	if err := container.DB.Health(ctx); err != nil {
		status.Status = "error"
		status.Database = "error"
		httphelper.WriteJSON(w, http.StatusServiceUnavailable, status)
		return
	}

	httphelper.WriteJSON(w, http.StatusOK, status)
}