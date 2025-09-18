package di

import (
	"log"
	"sync"

	"vt-link/backend/internal/application/campaign"
	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/db/pg"
	"vt-link/backend/internal/infrastructure/external"
	"vt-link/backend/internal/shared/clock"
)

type Container struct {
	CampaignUsecase campaign.Usecase
	DB              *db.DB
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
	campaignRepo := pg.NewCampaignRepository(database)

	// Transaction Manager
	txManager := db.NewTxManager(database)

	// External Services
	pusher := external.NewLinePusher()
	// 開発時はDummyPusherを使用する場合
	// pusher := external.NewDummyPusher()

	// Clock
	clock := clock.NewRealClock()

	// Usecase
	campaignUsecase := campaign.NewInteractor(
		campaignRepo,
		txManager,
		pusher,
		clock,
	)

	return &Container{
		CampaignUsecase: campaignUsecase,
		DB:              database,
	}, nil
}
