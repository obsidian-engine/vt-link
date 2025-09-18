package handler

import (
	"net/http"
	"os"
	"path/filepath"

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

	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// OpenAPIファイルのパスを取得
	// Vercel Functions環境では相対パスで packages/schema-zod/openapi.yaml を参照
	openAPIPath := filepath.Join("..", "..", "packages", "schema-zod", "openapi.yaml")

	// ファイルの存在確認
	if _, err := os.Stat(openAPIPath); os.IsNotExist(err) {
		http.Error(w, "OpenAPI specification not found", http.StatusNotFound)
		return
	}

	// ファイルを配信
	w.Header().Set("Content-Type", "application/x-yaml")
	w.Header().Set("Cache-Control", "public, max-age=3600") // 1時間キャッシュ
	http.ServeFile(w, r, openAPIPath)
}
