package handler

import (
	"context"
	"net/http"
	"os"
	"time"

	"vt-link/backend/internal/infrastructure/di"
	httphelper "vt-link/backend/internal/infrastructure/http"
)

type SystemStatus struct {
	Status    string          `json:"status"`
	Timestamp string          `json:"timestamp"`
	Services  ServiceStatuses `json:"services"`
}

type ServiceStatuses struct {
	Database  ServiceStatus `json:"database"`
	LineAPI   ServiceStatus `json:"line_api"`
	Scheduler ServiceStatus `json:"scheduler"`
}

type ServiceStatus struct {
	Status    string  `json:"status"`
	LastCheck string  `json:"last_check"`
	Error     *string `json:"error,omitempty"`
}

// Handler 基本的なシステム状態を返すエンドポイント
func Handler(w http.ResponseWriter, r *http.Request) {
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

	now := time.Now()
	status := SystemStatus{
		Status:    "healthy",
		Timestamp: now.UTC().Format(time.RFC3339),
		Services:  ServiceStatuses{},
	}

	// データベース状態チェック
	dbStatus := checkDatabase(ctx, container)
	status.Services.Database = dbStatus

	// LINE API状態チェック
	lineStatus := checkLineAPI()
	status.Services.LineAPI = lineStatus

	// スケジューラー状態チェック
	schedulerStatus := checkScheduler()
	status.Services.Scheduler = schedulerStatus

	// 全体のステータス判定
	if dbStatus.Status == "error" || lineStatus.Status == "error" || schedulerStatus.Status == "error" {
		status.Status = "degraded"
	}

	httphelper.WriteJSON(w, http.StatusOK, status)
}

func checkDatabase(ctx context.Context, container *di.Container) ServiceStatus {
	err := container.DB.Health(ctx)

	if err != nil {
		errMsg := err.Error()
		return ServiceStatus{
			Status:    "error",
			LastCheck: time.Now().UTC().Format(time.RFC3339),
			Error:     &errMsg,
		}
	}

	return ServiceStatus{
		Status:    "healthy",
		LastCheck: time.Now().UTC().Format(time.RFC3339),
	}
}

func checkLineAPI() ServiceStatus {
	// LINE Channel Access Tokenの存在確認のみ
	token := os.Getenv("LINE_CHANNEL_ACCESS_TOKEN")

	if token == "" {
		errMsg := "LINE_CHANNEL_ACCESS_TOKEN not configured"
		return ServiceStatus{
			Status:    "error",
			LastCheck: time.Now().UTC().Format(time.RFC3339),
			Error:     &errMsg,
		}
	}

	return ServiceStatus{
		Status:    "healthy",
		LastCheck: time.Now().UTC().Format(time.RFC3339),
	}
}

func checkScheduler() ServiceStatus {
	// Scheduler Secretの存在確認のみ
	secret := os.Getenv("SCHEDULER_SECRET")

	if secret == "" {
		errMsg := "SCHEDULER_SECRET not configured"
		return ServiceStatus{
			Status:    "error",
			LastCheck: time.Now().UTC().Format(time.RFC3339),
			Error:     &errMsg,
		}
	}

	return ServiceStatus{
		Status:    "healthy",
		LastCheck: time.Now().UTC().Format(time.RFC3339),
	}
}
