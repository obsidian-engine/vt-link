package integration

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/db/pg"
)

type CampaignRepositoryIntegrationTestSuite struct {
	suite.Suite
	testDB *TestDB
	repo   repository.CampaignRepository
	ctx    context.Context
	userID uuid.UUID
}

func (s *CampaignRepositoryIntegrationTestSuite) SetupSuite() {
	s.testDB = SetupTestDB(s.T())
	dbWrapper := &db.DB{DB: s.testDB.DB}
	s.repo = pg.NewCampaignRepository(dbWrapper)
	s.ctx = context.Background()
	s.userID = uuid.New()
}

func (s *CampaignRepositoryIntegrationTestSuite) TearDownSuite() {
	s.testDB.TeardownTestDB()
}

func (s *CampaignRepositoryIntegrationTestSuite) SetupTest() {
	// テストごとにデータをクリア
	s.testDB.ClearAllTables(s.T())
	
	// テスト用ユーザーを作成
	s.createTestUser(s.userID)
}

func (s *CampaignRepositoryIntegrationTestSuite) createTestUser(userID uuid.UUID) {
	query := `
		INSERT INTO users (id, line_user_id, display_name, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (id) DO NOTHING
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, "test-line-user", "テストユーザー")
	assert.NoError(s.T(), err)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestList_NoData() {
	// Arrange: データなし

	// Act
	campaigns, err := s.repo.List(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), campaigns)
	assert.Empty(s.T(), campaigns)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestList_WithCampaigns() {
	// Arrange: テストデータを作成
	baseTime := time.Now().Add(-1 * time.Hour)
	
	// キャンペーン1: 配信履歴あり
	messageID1 := s.createTestMessage(s.userID, "夏のセール告知", "draft", baseTime)
	s.createTestMessageHistory(s.userID, messageID1, 100)
	s.createTestMessageHistory(s.userID, messageID1, 200)
	
	// キャンペーン2: 配信履歴なし
	s.createTestMessage(s.userID, "新商品案内", "scheduled", baseTime.Add(10*time.Minute))
	
	// キャンペーン3: 複数の配信履歴
	messageID3 := s.createTestMessage(s.userID, "限定キャンペーン", "sent", baseTime.Add(20*time.Minute))
	s.createTestMessageHistory(s.userID, messageID3, 50)

	// Act
	campaigns, err := s.repo.List(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), campaigns)
	assert.Len(s.T(), campaigns, 3)

	// 作成日時の降順でソートされている
	assert.Equal(s.T(), "限定キャンペーン", campaigns[0].Name)
	assert.Equal(s.T(), "新商品案内", campaigns[1].Name)
	assert.Equal(s.T(), "夏のセール告知", campaigns[2].Name)

	// 送信数の確認
	assert.Equal(s.T(), 300, campaigns[2].SentCount, "キャンペーン1の送信数")
	assert.Equal(s.T(), 0, campaigns[1].SentCount, "キャンペーン2の送信数（履歴なし）")
	assert.Equal(s.T(), 50, campaigns[0].SentCount, "キャンペーン3の送信数")

	// CTR/CVRは0固定
	for _, campaign := range campaigns {
		assert.Equal(s.T(), 0.0, campaign.CTR)
		assert.Equal(s.T(), 0.0, campaign.CVR)
	}
}

func (s *CampaignRepositoryIntegrationTestSuite) TestList_DifferentUser() {
	// Arrange: 別ユーザーのデータを作成
	otherUserID := uuid.New()
	s.createTestUser(otherUserID)
	s.createTestMessage(otherUserID, "他ユーザーのキャンペーン", "draft", time.Now())

	// Act
	campaigns, err := s.repo.List(s.ctx, s.userID)

	// Assert: 他ユーザーのデータは含まれない
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), campaigns)
	assert.Empty(s.T(), campaigns)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestList_Limit10() {
	// Arrange: 15件のキャンペーンを作成
	baseTime := time.Now()
	for i := 0; i < 15; i++ {
		title := "キャンペーン" + string(rune('A'+i))
		s.createTestMessage(s.userID, title, "draft", baseTime.Add(time.Duration(i)*time.Minute))
	}

	// Act
	campaigns, err := s.repo.List(s.ctx, s.userID)

	// Assert: 最大10件まで
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), campaigns)
	assert.Len(s.T(), campaigns, 10)
}

func (s *CampaignRepositoryIntegrationTestSuite) TestList_VariousStatuses() {
	// Arrange: 異なるステータスのキャンペーンを作成
	baseTime := time.Now()
	s.createTestMessage(s.userID, "下書き", "draft", baseTime)
	s.createTestMessage(s.userID, "配信予定", "scheduled", baseTime.Add(1*time.Minute))
	s.createTestMessage(s.userID, "配信済み", "sent", baseTime.Add(2*time.Minute))

	// Act
	campaigns, err := s.repo.List(s.ctx, s.userID)

	// Assert: すべてのステータスが取得される
	assert.NoError(s.T(), err)
	assert.Len(s.T(), campaigns, 3)

	statuses := make([]string, len(campaigns))
	for i, campaign := range campaigns {
		statuses[i] = campaign.Status
	}
	assert.Contains(s.T(), statuses, "draft")
	assert.Contains(s.T(), statuses, "scheduled")
	assert.Contains(s.T(), statuses, "sent")
}

// ヘルパーメソッド

func (s *CampaignRepositoryIntegrationTestSuite) createTestMessage(userID uuid.UUID, title, status string, createdAt time.Time) uuid.UUID {
	query := `
		INSERT INTO messages (id, user_id, title, message, status, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $5)
		RETURNING id
	`
	var messageID uuid.UUID
	err := s.testDB.DB.GetContext(s.ctx, &messageID, query, userID, title, "メッセージ本文", status, createdAt)
	assert.NoError(s.T(), err)
	return messageID
}

func (s *CampaignRepositoryIntegrationTestSuite) createTestMessageHistory(userID, messageID uuid.UUID, recipientCount int) {
	query := `
		INSERT INTO message_history (id, user_id, message_id, status, sent_at, recipient_count, created_at)
		VALUES (gen_random_uuid(), $1, $2, 'sent', NOW(), $3, NOW())
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, messageID, recipientCount)
	assert.NoError(s.T(), err)
}

// テストスイート実行
func TestCampaignRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(CampaignRepositoryIntegrationTestSuite))
}
