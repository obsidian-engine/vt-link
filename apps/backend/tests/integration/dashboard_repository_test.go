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

type DashboardRepositoryIntegrationTestSuite struct {
	suite.Suite
	testDB *TestDB
	repo   repository.DashboardRepository
	ctx    context.Context
	userID uuid.UUID
}

func (s *DashboardRepositoryIntegrationTestSuite) SetupSuite() {
	s.testDB = SetupTestDB(s.T())
	dbWrapper := &db.DB{DB: s.testDB.DB}
	s.repo = pg.NewDashboardRepository(dbWrapper)
	s.ctx = context.Background()
	s.userID = uuid.New()
}

func (s *DashboardRepositoryIntegrationTestSuite) TearDownSuite() {
	s.testDB.TeardownTestDB()
}

func (s *DashboardRepositoryIntegrationTestSuite) SetupTest() {
	// テストごとにデータをクリア
	s.testDB.ClearAllTables(s.T())

	// テスト用ユーザーを作成
	s.createTestUser(s.userID)
}

func (s *DashboardRepositoryIntegrationTestSuite) createTestUser(userID uuid.UUID) {
	query := `
		INSERT INTO users (id, line_user_id, display_name, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		ON CONFLICT (id) DO NOTHING
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, "test-line-user", "テストユーザー")
	assert.NoError(s.T(), err)
}

func (s *DashboardRepositoryIntegrationTestSuite) TestGetStats_NoData() {
	// Arrange: データなし

	// Act
	stats, err := s.repo.GetStats(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), stats)
	assert.Equal(s.T(), 0, stats.FriendCount)
	assert.Equal(s.T(), 0, stats.SendCount)
	assert.Equal(s.T(), 15000, stats.SendLimit)
	assert.Equal(s.T(), 0.0, stats.AverageCTR)
	assert.Equal(s.T(), 0, stats.MonthlyRevenue)
}

func (s *DashboardRepositoryIntegrationTestSuite) TestGetStats_WithFansAndMessages() {
	// Arrange: テストデータを作成

	// ファンを作成（3人、うち1人はブロック済み）
	s.createTestFan(s.userID, "fan1", false)
	s.createTestFan(s.userID, "fan2", false)
	s.createTestFan(s.userID, "fan3-blocked", true)

	// 当月のメッセージ履歴を作成
	now := time.Now()
	s.createTestMessage(s.userID, "message1")
	messageID1 := s.getLastMessageID()
	s.createTestMessageHistory(s.userID, messageID1, 100, now)

	s.createTestMessage(s.userID, "message2")
	messageID2 := s.getLastMessageID()
	s.createTestMessageHistory(s.userID, messageID2, 200, now)

	// 前月のメッセージ履歴（集計対象外）
	lastMonth := now.AddDate(0, -1, 0)
	s.createTestMessage(s.userID, "message3")
	messageID3 := s.getLastMessageID()
	s.createTestMessageHistory(s.userID, messageID3, 50, lastMonth)

	// Act
	stats, err := s.repo.GetStats(s.ctx, s.userID)

	// Assert
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), stats)
	assert.Equal(s.T(), 2, stats.FriendCount, "ブロック済みを除く友だち数")
	assert.Equal(s.T(), 300, stats.SendCount, "当月の送信数の合計")
	assert.Equal(s.T(), 15000, stats.SendLimit)
	assert.Equal(s.T(), 0.0, stats.AverageCTR)
	assert.Equal(s.T(), 0, stats.MonthlyRevenue)
}

func (s *DashboardRepositoryIntegrationTestSuite) TestGetStats_DifferentUser() {
	// Arrange: 別ユーザーのデータを作成
	otherUserID := uuid.New()
	s.createTestUser(otherUserID)
	s.createTestFan(otherUserID, "other-fan", false)

	// 対象ユーザーのデータはなし

	// Act
	stats, err := s.repo.GetStats(s.ctx, s.userID)

	// Assert: 他ユーザーのデータは含まれない
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), stats)
	assert.Equal(s.T(), 0, stats.FriendCount)
	assert.Equal(s.T(), 0, stats.SendCount)
}

// ヘルパーメソッド

func (s *DashboardRepositoryIntegrationTestSuite) createTestFan(userID uuid.UUID, lineUserID string, isBlocked bool) {
	query := `
		INSERT INTO fans (id, user_id, line_user_id, display_name, is_blocked, followed_at, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW(), NOW())
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, lineUserID, "ファン"+lineUserID, isBlocked)
	assert.NoError(s.T(), err)
}

func (s *DashboardRepositoryIntegrationTestSuite) createTestMessage(userID uuid.UUID, title string) {
	query := `
		INSERT INTO messages (id, user_id, title, message, status, created_at, updated_at)
		VALUES (gen_random_uuid(), $1, $2, $3, 'sent', NOW(), NOW())
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, title, "メッセージ本文")
	assert.NoError(s.T(), err)
}

func (s *DashboardRepositoryIntegrationTestSuite) getLastMessageID() uuid.UUID {
	var messageID uuid.UUID
	query := `SELECT id FROM messages ORDER BY created_at DESC LIMIT 1`
	err := s.testDB.DB.GetContext(s.ctx, &messageID, query)
	assert.NoError(s.T(), err)
	return messageID
}

func (s *DashboardRepositoryIntegrationTestSuite) createTestMessageHistory(userID, messageID uuid.UUID, recipientCount int, sentAt time.Time) {
	query := `
		INSERT INTO message_history (id, user_id, message_id, status, sent_at, recipient_count, created_at)
		VALUES (gen_random_uuid(), $1, $2, 'sent', $3, $4, NOW())
	`
	_, err := s.testDB.DB.ExecContext(s.ctx, query, userID, messageID, sentAt, recipientCount)
	assert.NoError(s.T(), err)
}

// テストスイート実行
func TestDashboardRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(DashboardRepositoryIntegrationTestSuite))
}
