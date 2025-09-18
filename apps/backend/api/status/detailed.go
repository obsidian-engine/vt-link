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
	Status      string            `json:"status"`
	Timestamp   string            `json:"timestamp"`
	Version     string            `json:"version"`
	Environment string            `json:"environment"`
	Services    ServiceStatuses   `json:"services"`
	Metrics     SystemMetrics     `json:"metrics"`
}

type ServiceStatuses struct {
	Database    ServiceStatus `json:"database"`
	LineAPI     ServiceStatus `json:"line_api"`
	Scheduler   ServiceStatus `json:"scheduler"`
}

type ServiceStatus struct {
	Status      string  `json:"status"`
	ResponseTime int64  `json:"response_time_ms"`
	LastCheck   string  `json:"last_check"`
	Error       *string `json:"error,omitempty"`
}

type SystemMetrics struct {
	UptimeSeconds int64 `json:"uptime_seconds"`
	MemoryUsageMB int64 `json:"memory_usage_mb"`
	GoRoutines    int   `json:"goroutines"`
}

var startTime = time.Now()

// Handler 詳細なシステム状態を返すエンドポイント
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
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	now := time.Now()
	status := SystemStatus{
		Status:      "healthy",
		Timestamp:   now.UTC().Format(time.RFC3339),
		Version:     getVersion(),
		Environment: getEnvironment(),
		Services:    ServiceStatuses{},
		Metrics: SystemMetrics{
			UptimeSeconds: int64(now.Sub(startTime).Seconds()),
			MemoryUsageMB: getMemoryUsage(),
			GoRoutines:    getGoRoutineCount(),
		},
	}

	// データベース状態チェック
	dbStatus := checkDatabase(ctx, container)
	status.Services.Database = dbStatus

	// LINE API状態チェック
	lineStatus := checkLineAPI(ctx)
	status.Services.LineAPI = lineStatus

	// スケジューラー状態チェック
	schedulerStatus := checkScheduler(ctx)
	status.Services.Scheduler = schedulerStatus

	// 全体のステータス判定
	if dbStatus.Status == "error" || lineStatus.Status == "error" || schedulerStatus.Status == "error" {
		status.Status = "degraded"
	}

	httpCode := http.StatusOK
	if status.Status == "degraded" {
		httpCode = http.StatusServiceUnavailable
	}

	httphelper.WriteJSON(w, httpCode, status)
}

func checkDatabase(ctx context.Context, container *di.Container) ServiceStatus {
	start := time.Now()

	err := container.DB.Health(ctx)
	responseTime := time.Since(start).Milliseconds()

	if err != nil {
		errMsg := err.Error()
		return ServiceStatus{
			Status:       "error",
			ResponseTime: responseTime,
			LastCheck:    time.Now().UTC().Format(time.RFC3339),
			Error:        &errMsg,
		}
	}

	return ServiceStatus{
		Status:       "healthy",
		ResponseTime: responseTime,
		LastCheck:    time.Now().UTC().Format(time.RFC3339),
	}
}

func checkLineAPI(ctx context.Context) ServiceStatus {
	start := time.Now()

	// LINE Channel Access Tokenの存在確認
	token := os.Getenv("LINE_CHANNEL_ACCESS_TOKEN")
	responseTime := time.Since(start).Milliseconds()

	if token == "" {
		errMsg := "LINE_CHANNEL_ACCESS_TOKEN not configured"
		return ServiceStatus{
			Status:       "error",
			ResponseTime: responseTime,
			LastCheck:    time.Now().UTC().Format(time.RFC3339),
			Error:        &errMsg,
		}
	}

	// 実際のLINE API接続テストは省略（無料枠節約のため）
	return ServiceStatus{
		Status:       "healthy",
		ResponseTime: responseTime,
		LastCheck:    time.Now().UTC().Format(time.RFC3339),
	}
}

func checkScheduler(ctx context.Context) ServiceStatus {
	start := time.Now()

	// Scheduler Secretの存在確認
	secret := os.Getenv("SCHEDULER_SECRET")
	responseTime := time.Since(start).Milliseconds()

	if secret == "" {
		errMsg := "SCHEDULER_SECRET not configured"
		return ServiceStatus{
			Status:       "error",
			ResponseTime: responseTime,
			LastCheck:    time.Now().UTC().Format(time.RFC3339),
			Error:        &errMsg,
		}
	}

	return ServiceStatus{
		Status:       "healthy",
		ResponseTime: responseTime,
		LastCheck:    time.Now().UTC().Format(time.RFC3339),
	}
}

func getVersion() string {
	if version := os.Getenv("VT_LINK_VERSION"); version != "" {
		return version
	}
	return "unknown"
}

func getEnvironment() string {
	if env := os.Getenv("NODE_ENV"); env != "" {
		return env
	}
	return "development"
}

func getMemoryUsage() int64 {
	// 簡易的なメモリ使用量（実際の実装では runtime.ReadMemStats を使用）
	return 0 // プレースホルダー
}

func getGoRoutineCount() int {
	// 簡易的なGoroutine数（実際の実装では runtime.NumGoroutine を使用）
	return 0 // プレースホルダー
}