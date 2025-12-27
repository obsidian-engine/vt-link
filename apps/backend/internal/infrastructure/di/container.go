package di

import (
	"log"
	"os"
	"sync"

	"vt-link/backend/internal/application/autoreply"
	"vt-link/backend/internal/application/message"
	"vt-link/backend/internal/application/richmenu"
	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/db/pg"
	"vt-link/backend/internal/infrastructure/external"
	"vt-link/backend/internal/shared/clock"
)

type Container struct {
	MessageUsecase   message.Usecase
	AutoReplyUsecase autoreply.Usecase
	RichMenuUsecase  richmenu.Usecase
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
			log.Fatalf("Failed to initialize container: %v", err)
		}
	})
	return container
}

func newContainer() (*Container, error) {
	// DB接続
	database, err := db.NewDB()
	if err != nil {
		return nil, err
	}

	// Repository
	messageRepo := pg.NewMessageRepository(database)
	autoReplyRuleRepo := pg.NewAutoReplyRuleRepository(database)
	richMenuRepo := pg.NewRichMenuRepository(database)

	// Transaction Manager
	txManager := db.NewTxManager(database)

	// External Services
	pusher := external.NewLinePusher()
	// 開発時はDummyPusherを使用する場合
	// pusher := external.NewDummyPusher()

	lineReplier := external.NewLineReplier(os.Getenv("LINE_ACCESS_TOKEN"))
	lineRichMenuService := external.NewLineRichMenuService(os.Getenv("LINE_ACCESS_TOKEN"))

	// Clock
	clock := clock.NewRealClock()

	// Usecase
	messageUsecase := message.NewInteractor(
		messageRepo,
		txManager,
		pusher,
		clock,
	)

	autoReplyUsecase := autoreply.NewInteractor(
		autoReplyRuleRepo,
		lineReplier,
	)

	richMenuUsecase := richmenu.NewInteractor(
		richMenuRepo,
		lineRichMenuService,
	)

	return &Container{
		MessageUsecase:   messageUsecase,
		AutoReplyUsecase: autoReplyUsecase,
		RichMenuUsecase:  richMenuUsecase,
		DB:               database,
	}, nil
}
