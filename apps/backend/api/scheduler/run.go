package handler

import (
	"context"
	"net/http"
	"os"
	"time"

	"vt-link/backend/internal/application/campaign"
	"vt-link/backend/internal/infrastructure/di"
	httphelper "vt-link/backend/internal/infrastructure/http"
)

type SchedulerResult struct {
	ProcessedCount int    `json:"processed_count"`
	Message        string `json:"message"`
	Timestamp      string `json:"timestamp"`
}

// Handler Vercel Functions のハンドラ
func Handler(w http.ResponseWriter, r *http.Request) {
	// CORS対応
	httphelper.SetCORS(w)

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 認証チェック（Cloudflare Workersからの呼び出しのみ許可）
	expectedSecret := os.Getenv("SCHEDULER_SECRET")
	if expectedSecret == "" {
		http.Error(w, "Scheduler not configured", http.StatusServiceUnavailable)
		return
	}

	providedSecret := r.Header.Get("X-Scheduler-Secret")
	if providedSecret != expectedSecret {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	container := di.GetContainer()
	ctx, cancel := context.WithTimeout(context.Background(), 25*time.Second) // Vercel Functions タイムアウト対策
	defer cancel()

	now := time.Now()
	input := &campaign.SchedulerInput{
		Now:   now,
		Limit: 30, // Vercel Functions環境での安全な処理数
	}

	processedCount, err := container.CampaignUsecase.RunScheduler(ctx, input)
	if err != nil {
		httphelper.WriteError(w, err)
		return
	}

	result := SchedulerResult{
		ProcessedCount: processedCount,
		Message:        "Scheduler executed successfully",
		Timestamp:      now.UTC().Format(time.RFC3339),
	}

	httphelper.WriteJSON(w, http.StatusOK, result)
}
