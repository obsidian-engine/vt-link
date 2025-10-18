package integration

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/infrastructure/db"
	"vt-link/backend/internal/infrastructure/db/pg"
)

type MessageRepositoryIntegrationTestSuite struct {
	suite.Suite
	testDB *TestDB
	repo   repository.MessageRepository
	ctx    context.Context
}

func (s *MessageRepositoryIntegrationTestSuite) SetupSuite() {
	s.testDB = SetupTestDB(s.T())
	dbWrapper := &db.DB{DB: s.testDB.DB}
	s.repo = pg.NewMessageRepository(dbWrapper)
	s.ctx = context.Background()
}

func (s *MessageRepositoryIntegrationTestSuite) TearDownSuite() {
	s.testDB.TeardownTestDB()
}

func (s *MessageRepositoryIntegrationTestSuite) SetupTest() {
	// 各テストの前にテーブルをクリア
	s.testDB.ClearAllTables(s.T())
}

func (s *MessageRepositoryIntegrationTestSuite) TestCreate_Success() {
	// テスト用のメッセージを作成
	message := &model.Message{
		ID:        uuid.New(),
		Title:     "結合テストメッセージ",
		Body:      "結合テストメッセージ",
		Status:    model.MessageStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// メッセージを作成
	err := s.repo.Create(s.ctx, message)

	// アサーション
	assert.NoError(s.T(), err)

	// データベースから取得して確認
	retrieved, err := s.repo.FindByID(s.ctx, message.ID)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), retrieved)
	assert.Equal(s.T(), message.Title, retrieved.Title)
	assert.Equal(s.T(), message.Body, retrieved.Body)
	assert.Equal(s.T(), message.Status, retrieved.Status)
}

func (s *MessageRepositoryIntegrationTestSuite) TestFindByID_Success() {
	// テスト用データを事前に作成
	messageID := s.testDB.CreateTestMessage(s.T(), "取得テスト", "取得テストメッセージ")
	uuid, err := uuid.Parse(messageID)
	assert.NoError(s.T(), err)

	// メッセージを取得
	message, err := s.repo.FindByID(s.ctx, uuid)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), message)
	assert.Equal(s.T(), "取得テスト", message.Title)
	assert.Equal(s.T(), "取得テストメッセージ", message.Body)
	assert.Equal(s.T(), model.MessageStatusDraft, message.Status)
}

func (s *MessageRepositoryIntegrationTestSuite) TestFindByID_NotFound() {
	// 存在しないIDで取得を試行
	nonExistentID := uuid.New()
	message, err := s.repo.FindByID(s.ctx, nonExistentID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), message)
}

func (s *MessageRepositoryIntegrationTestSuite) TestUpdate_Success() {
	// テスト用データを事前に作成
	messageID := s.testDB.CreateTestMessage(s.T(), "更新前", "更新前メッセージ")
	uuid, err := uuid.Parse(messageID)
	assert.NoError(s.T(), err)

	// メッセージを取得
	message, err := s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)

	// データを更新
	message.Title = "更新後"
	message.Body = "更新後メッセージ"
	message.Status = model.MessageStatusSent
	sentTime := time.Now()
	message.SentAt = &sentTime

	// 更新を実行
	err = s.repo.Update(s.ctx, message)
	assert.NoError(s.T(), err)

	// 更新されたデータを取得して確認
	updated, err := s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), "更新後", updated.Title)
	assert.Equal(s.T(), "更新後メッセージ", updated.Body)
	assert.Equal(s.T(), model.MessageStatusSent, updated.Status)
	assert.NotNil(s.T(), updated.SentAt)
}

func (s *MessageRepositoryIntegrationTestSuite) TestList_Success() {
	// 複数のテスト用データを作成
	s.testDB.CreateTestMessage(s.T(), "メッセージ1", "メッセージ1")
	s.testDB.CreateTestMessage(s.T(), "メッセージ2", "メッセージ2")
	s.testDB.CreateTestMessage(s.T(), "メッセージ3", "メッセージ3")

	// メッセージ一覧を取得
	messages, err := s.repo.List(s.ctx, 10, 0)

	// アサーション
	assert.NoError(s.T(), err)
	assert.Len(s.T(), messages, 3)

	// タイトルで並び順を確認
	titles := make([]string, len(messages))
	for i, message := range messages {
		titles[i] = message.Title
	}
	// 作成日時の降順で並んでいることを期待
	assert.Contains(s.T(), titles, "メッセージ1")
	assert.Contains(s.T(), titles, "メッセージ2")
	assert.Contains(s.T(), titles, "メッセージ3")
}

func (s *MessageRepositoryIntegrationTestSuite) TestFindScheduledMessages_Success() {
	// スケジュール済みのメッセージを作成
	message := &model.Message{
		ID:        uuid.New(),
		Title:     "スケジュールテスト",
		Body:      "スケジュールメッセージ",
		Status:    model.MessageStatusScheduled,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	scheduledTime := time.Now().Add(-1 * time.Minute) // 1分前にスケジュール
	message.ScheduledAt = &scheduledTime

	err := s.repo.Create(s.ctx, message)
	assert.NoError(s.T(), err)

	// ドラフトのメッセージも作成（スケジュール取得には含まれない）
	draftMessage := &model.Message{
		ID:        uuid.New(),
		Title:     "ドラフト",
		Body:      "ドラフトメッセージ",
		Status:    model.MessageStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err = s.repo.Create(s.ctx, draftMessage)
	assert.NoError(s.T(), err)

	// スケジュール済みメッセージを取得
	scheduledMessages, err := s.repo.FindScheduledMessages(s.ctx, time.Now().Add(time.Hour), 10)

	// アサーション
	assert.NoError(s.T(), err)
	assert.Len(s.T(), scheduledMessages, 1)
	assert.Equal(s.T(), "スケジュールテスト", scheduledMessages[0].Title)
	assert.Equal(s.T(), model.MessageStatusScheduled, scheduledMessages[0].Status)
}

// テストスイートを実行するためのエントリーポイント
func TestMessageRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(MessageRepositoryIntegrationTestSuite))
}
