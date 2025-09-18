package handler

import (
	"context"
	"net/http"
	"strings"

	"vt-link/backend/internal/application/campaign"
	"vt-link/backend/internal/infrastructure/di"
	httphelper "vt-link/backend/internal/infrastructure/http"
	"github.com/google/uuid"
)

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

	container := di.GetContainer()
	ctx := context.Background()

	// URLパスからIDを抽出
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(pathParts) < 3 {
		httphelper.WriteError(w, &campaign.ErrorInfo{
			Code:    "INVALID_PATH",
			Message: "Invalid campaign ID in path",
		})
		return
	}

	idStr := pathParts[2] // /api/campaigns/{id}/send
	id, err := uuid.Parse(idStr)
	if err != nil {
		httphelper.WriteError(w, &campaign.ErrorInfo{
			Code:    "INVALID_ID",
			Message: "Invalid campaign ID format",
		})
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