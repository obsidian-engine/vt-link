package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"vt-link/backend/internal/infrastructure/auth"
	"vt-link/backend/internal/infrastructure/di"
	"vt-link/backend/internal/infrastructure/external"
	"vt-link/backend/internal/presentation/http"
)

func main() {
	// .envファイルを読み込み
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	log.Println("VT-Link Backend Server starting...")

	// DI Container初期化
	container := di.GetContainer()

	// 外部依存の初期化
	oauthClient := external.NewLineOAuthClient(
		os.Getenv("LINE_LOGIN_CHANNEL_ID"),
		os.Getenv("LINE_LOGIN_CHANNEL_SECRET"),
		os.Getenv("LINE_LOGIN_CALLBACK_URL"),
	)
	jwtManager := auth.NewJWTManager(os.Getenv("JWT_SECRET"))

	// Handler初期化
	authHandler := http.NewAuthHandler(oauthClient, jwtManager)
	autoReplyHandler := http.NewAutoReplyHandler(container.AutoReplyUsecase)
	richMenuHandler := http.NewRichMenuHandler(container.RichMenuUsecase)
	messageHandler := http.NewMessageHandler(container.MessageUsecase)
	schedulerHandler := http.NewSchedulerHandler(container.MessageUsecase, os.Getenv("SCHEDULER_SECRET"))
	audienceHandler := http.NewAudienceHandler(container.AudienceUsecase)
	historyHandler := http.NewHistoryHandler(container.HistoryUsecase)
	settingsHandler := http.NewSettingsHandler(container.SettingsUsecase)

	// Router初期化とサーバー起動
	router := http.NewRouter(authHandler, autoReplyHandler, richMenuHandler, messageHandler, schedulerHandler, audienceHandler, historyHandler, settingsHandler, jwtManager)

	port := ":8080"
	log.Printf("Server listening on port %s", port)

	if err := router.Setup().Start(port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
