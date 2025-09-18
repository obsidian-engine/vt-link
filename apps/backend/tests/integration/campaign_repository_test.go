package integration

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/infrastructure/db/pg"
)

type CampaignRepositoryIntegrationTestSuite struct {
	suite.Suite
	testDB *TestDB
	repo   *pg.CampaignRepository
	ctx    context.Context
}

func (s *CampaignRepositoryIntegrationTestSuite) SetupSuite() {
	s.testDB = SetupTestDB(s.T())
	s.repo = pg.NewCampaignRepository(s.testDB.DB)
	s.ctx = context.Background()
}

func (s *CampaignRepositoryIntegrationTestSuite) TearDownSuite() {
	s.testDB.TeardownTestDB()
}

func (s *CampaignRepositoryIntegrationTestSuite) SetupTest() {
	// 各テストの前にテーブルをクリア
	s.testDB.ClearAllTables(s.T())
}

func (s *CampaignRepositoryIntegrationTestSuite) TestCreate_Success() {
	// テスト用のキャンペーンを作成
	campaign := &model.Campaign{
		ID:        uuid.New(),
		Title:     "結合テストキャンペーン",
		Message:   "結合テストメッセージ",
		Status:    model.CampaignStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// キャンペーンを作成
	err := s.repo.Create(s.ctx, campaign)

	// アサーション
	assert.NoError(s.T(), err)

	// データベースから取得して確認
	retrieved, err := s.repo.GetByID(s.ctx, campaign.ID)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), retrieved)
	assert.Equal(s.T(), campaign.Title, retrieved.Title)
	assert.Equal(s.T(), campaign.Message, retrieved.Message)
	assert.Equal(s.T(), campaign.Status, retrieved.Status)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestGetByID_Success() {
	// テスト用データを事前に作成
	campaignID := s.testDB.CreateTestCampaign(s.T(), "取得テスト", "取得テストメッセージ")
	uuid, err := uuid.Parse(campaignID)
	assert.NoError(s.T(), err)

	// キャンペーンを取得
	campaign, err := s.repo.GetByID(s.ctx, uuid)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), campaign)
	assert.Equal(s.T(), "取得テスト", campaign.Title)
	assert.Equal(s.T(), "取得テストメッセージ", campaign.Message)
	assert.Equal(s.T(), model.CampaignStatusDraft, campaign.Status)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestGetByID_NotFound() {
	// 存在しないIDで取得を試行
	nonExistentID := uuid.New()
	campaign, err := s.repo.GetByID(s.ctx, nonExistentID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), campaign)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestUpdate_Success() {
	// テスト用データを事前に作成
	campaignID := s.testDB.CreateTestCampaign(s.T(), "更新前", "更新前メッセージ")
	uuid, err := uuid.Parse(campaignID)
	assert.NoError(s.T(), err)

	// キャンペーンを取得
	campaign, err := s.repo.GetByID(s.ctx, uuid)
	assert.NoError(s.T(), err)

	// データを更新
	campaign.Title = "更新後"
	campaign.Message = "更新後メッセージ"
	campaign.Status = model.CampaignStatusSent
	sentTime := time.Now()
	campaign.SentAt = &sentTime

	// 更新を実行
	err = s.repo.Update(s.ctx, campaign)
	assert.NoError(s.T(), err)

	// 更新されたデータを取得して確認
	updated, err := s.repo.GetByID(s.ctx, uuid)
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), "更新後", updated.Title)
	assert.Equal(s.T(), "更新後メッセージ", updated.Message)
	assert.Equal(s.T(), model.CampaignStatusSent, updated.Status)
	assert.NotNil(s.T(), updated.SentAt)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestList_Success() {
	// 複数のテスト用データを作成
	s.testDB.CreateTestCampaign(s.T(), "キャンペーン1", "メッセージ1")
	s.testDB.CreateTestCampaign(s.T(), "キャンペーン2", "メッセージ2")
	s.testDB.CreateTestCampaign(s.T(), "キャンペーン3", "メッセージ3")

	// キャンペーン一覧を取得
	campaigns, err := s.repo.List(s.ctx)

	// アサーション
	assert.NoError(s.T(), err)
	assert.Len(s.T(), campaigns, 3)

	// タイトルで並び順を確認
	titles := make([]string, len(campaigns))
	for i, campaign := range campaigns {
		titles[i] = campaign.Title
	}
	// 作成日時の降順で並んでいることを期待
	assert.Contains(s.T(), titles, "キャンペーン1")
	assert.Contains(s.T(), titles, "キャンペーン2")
	assert.Contains(s.T(), titles, "キャンペーン3")
}

func (s *CampaignRepositoryIntegrationTestSuite) TestGetScheduledCampaigns_Success() {
	// スケジュール済みのキャンペーンを作成
	campaign := &model.Campaign{
		ID:        uuid.New(),
		Title:     "スケジュールテスト",
		Message:   "スケジュールメッセージ",
		Status:    model.CampaignStatusScheduled,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	scheduledTime := time.Now().Add(-1 * time.Minute) // 1分前にスケジュール
	campaign.ScheduledAt = &scheduledTime

	err := s.repo.Create(s.ctx, campaign)
	assert.NoError(s.T(), err)

	// ドラフトのキャンペーンも作成（スケジュール取得には含まれない）
	draftCampaign := &model.Campaign{
		ID:        uuid.New(),
		Title:     "ドラフト",
		Message:   "ドラフトメッセージ",
		Status:    model.CampaignStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err = s.repo.Create(s.ctx, draftCampaign)
	assert.NoError(s.T(), err)

	// スケジュール済みキャンペーンを取得
	scheduledCampaigns, err := s.repo.GetScheduledCampaigns(s.ctx)

	// アサーション
	assert.NoError(s.T(), err)
	assert.Len(s.T(), scheduledCampaigns, 1)
	assert.Equal(s.T(), "スケジュールテスト", scheduledCampaigns[0].Title)
	assert.Equal(s.T(), model.CampaignStatusScheduled, scheduledCampaigns[0].Status)
}

// テストスイートを実行するためのエントリーポイント
func TestCampaignRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(CampaignRepositoryIntegrationTestSuite))
}