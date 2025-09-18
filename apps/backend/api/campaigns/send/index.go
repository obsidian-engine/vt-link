package handler

import (
	"context"
	"net/http"

	"github.com/google/uuid"
	"vt-link/backend/internal/application/campaign"
	"vt-link/backend/internal/infrastructure/di"
	httphelper "vt-link/backend/internal/infrastructure/http"
	"vt-link/backend/internal/shared/errx"
)

// Handler Vercel Functions のハンドラ（/api/campaigns/send?id=xxx 形式）
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

	container := di.GetContainer()
	ctx := context.Background()

	// クエリパラメータからIDを取得
	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		httphelper.WriteError(w, errx.NewAppError("MISSING_ID", "Campaign ID is required", 400))
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		httphelper.WriteError(w, errx.NewAppError("INVALID_ID", "Invalid campaign ID format", 400))
		return
	}

	input := &campaign.SendCampaignInput{
		ID: id,
	}

	err = container.CampaignUsecase.SendCampaign(ctx, input)
	if err != nil {
		httphelper.WriteError(w, err)
		return
	}

	httphelper.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Campaign sent successfully",
	})
}
