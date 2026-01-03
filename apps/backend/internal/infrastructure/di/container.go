package di

import (
	"log"
	"sync"
	"time"

	"vt-link/backend/internal/application/audience"
	authApp "vt-link/backend/internal/application/auth"
	"vt-link/backend/internal/application/autoreply"
	"vt-link/backend/internal/application/dashboard"
	"vt-link/backend/internal/application/history"
	"vt-link/backend/internal/application/message"
	"vt-link/backend/internal/application/richmenu"
	"vt-link/backend/internal/application/settings"
	"vt-link/backend/internal/config"
	"vt-link/backend/internal/infrastructure/auth"
	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/db/pg"
	"vt-link/backend/internal/infrastructure/external"
	"vt-link/backend/internal/shared/clock"
	"vt-link/backend/internal/shared/logger"
)

type Container struct {
	AuthUsecase      authApp.Usecase
	MessageUsecase   message.Usecase
	AutoReplyUsecase autoreply.Usecase
	RichMenuUsecase  richmenu.Usecase
	AudienceUsecase  audience.Usecase
	HistoryUsecase   history.Usecase
	SettingsUsecase  settings.Usecase
	DashboardUsecase dashboard.Usecase
	JWTManager       *auth.JWTManager
	DB               *db.DB
}

var (
	container *Container
	once      sync.Once
)

// GetContainer シングルトンでコンテナを取得
func GetContainer() *Container {
	once.Do(func() {
		var err error
		container, err = newContainer()
		if err != nil {
			logger.Log.Error("Failed to initialize container",
				"error", err,
			)
			log.Fatalf("Failed to initialize container: %v", err)
		}
	})
	return container
}

func newContainer() (*Container, error) {
	// Config読み込み
	cfg, err := config.LoadConfig()
	if err != nil {
		return nil, err
	}

	// DB接続
	database, err := db.NewDB()
	if err != nil {
		return nil, err
	}

	// Repository
	messageRepo := pg.NewMessageRepository(database)
	autoReplyRuleRepo := pg.NewAutoReplyRuleRepository(database)
	richMenuRepo := pg.NewRichMenuRepository(database)
	fanRepo := pg.NewFanRepository(database)
	messageHistoryRepo := pg.NewMessageHistoryRepository(database)
	userSettingsRepo := pg.NewUserSettingsRepository(database)
	userRepo := pg.NewUserRepository(database)

	// 新規追加
	dashboardRepo := pg.NewDashboardRepository(database)
	campaignRepo := pg.NewCampaignRepository(database)
	segmentRepo := pg.NewSegmentRepository(database)

	// Transaction Manager
	txManager := db.NewTxManager(database)

	// External Services
	pusher := external.NewLinePusher()
	// 開発時はDummyPusherを使用する場合
	// pusher := external.NewDummyPusher()

	lineReplier := external.NewLineReplier(cfg.LineAccessToken)
	lineRichMenuService := external.NewLineRichMenuService(cfg.LineAccessToken)

	// Auth Services
	lineOAuthClient := external.NewLineOAuthClient(
		cfg.LineLoginChannelID,
		cfg.LineLoginChannelSecret,
		cfg.LineLoginCallbackURL,
	)
	jwtManager := auth.NewJWTManager(cfg.JWTSecret)
	stateStore := auth.NewInMemoryStateStore(5 * time.Minute)

	// Clock
	clock := clock.NewRealClock()

	// Usecase
	// Auth Usecase
	authUsecase := authApp.NewInteractor(lineOAuthClient, jwtManager, stateStore, userRepo)
	messageUsecase := message.NewInteractor(
		messageRepo,
		txManager,
		pusher,
		clock,
	)

	autoReplyUsecase := autoreply.NewInteractor(
		autoReplyRuleRepo,
		userRepo,
		lineReplier,
		cfg.LineChannelSecret,
	)

	richMenuUsecase := richmenu.NewInteractor(
		richMenuRepo,
		lineRichMenuService,
	)

	// Audience Usecase
	audienceUsecase := audience.NewInteractor(fanRepo, segmentRepo)

	// History Usecase
	historyUsecase := history.NewInteractor(messageHistoryRepo)

	// Settings Usecase
	settingsUsecase := settings.NewInteractor(userSettingsRepo)

	// Dashboard Usecase
	dashboardUsecase := dashboard.NewDashboardInteractor(dashboardRepo, campaignRepo)

	return &Container{
		AuthUsecase:      authUsecase,
		MessageUsecase:   messageUsecase,
		AutoReplyUsecase: autoReplyUsecase,
		RichMenuUsecase:  richMenuUsecase,
		AudienceUsecase:  audienceUsecase,
		HistoryUsecase:   historyUsecase,
		SettingsUsecase:  settingsUsecase,
		DashboardUsecase: dashboardUsecase,
		JWTManager:       jwtManager,
		DB:               database,
	}, nil
}
