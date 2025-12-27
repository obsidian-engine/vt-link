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

type AutoReplyRuleRepositoryIntegrationTestSuite struct {
	suite.Suite
	testDB *TestDB
	repo   repository.AutoReplyRuleRepository
	ctx    context.Context
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) SetupSuite() {
	s.testDB = SetupTestDB(s.T())
	dbWrapper := &db.DB{DB: s.testDB.DB}
	s.repo = pg.NewAutoReplyRuleRepository(dbWrapper)
	s.ctx = context.Background()
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TearDownSuite() {
	s.testDB.TeardownTestDB()
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) SetupTest() {
	// 各テストの前にテーブルをクリア
	s.testDB.ClearAutoReplyRules(s.T())
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TestCreate_Success() {
	// テスト用のルールを作成
	userID := uuid.New()
	matchType := model.MatchTypeExact

	rule := &model.AutoReplyRule{
		ID:           uuid.New(),
		UserID:       userID,
		Type:         model.RuleTypeKeyword,
		Name:         "結合テストルール",
		Keywords:     []string{"料金", "値段"},
		MatchType:    &matchType,
		ReplyMessage: "料金についてはこちら",
		IsEnabled:    true,
		Priority:     1,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// ルールを作成
	err := s.repo.Create(s.ctx, rule)

	// アサーション
	assert.NoError(s.T(), err)

	// データベースから取得して確認
	retrieved, err := s.repo.FindByID(s.ctx, rule.ID)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), retrieved)
	assert.Equal(s.T(), rule.Name, retrieved.Name)
	assert.Equal(s.T(), rule.Type, retrieved.Type)
	assert.Equal(s.T(), []string(rule.Keywords), []string(retrieved.Keywords))
	assert.Equal(s.T(), rule.ReplyMessage, retrieved.ReplyMessage)
	assert.True(s.T(), retrieved.IsEnabled)
	assert.Equal(s.T(), rule.Priority, retrieved.Priority)
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TestFindByID_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	ruleID := s.testDB.CreateTestAutoReplyRule(s.T(), userID, "取得テスト", model.RuleTypeFollow, []string{}, nil, "フォローありがとうございます", 1)
	uuid, err := uuid.Parse(ruleID)
	assert.NoError(s.T(), err)

	// ルールを取得
	rule, err := s.repo.FindByID(s.ctx, uuid)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), rule)
	assert.Equal(s.T(), "取得テスト", rule.Name)
	assert.Equal(s.T(), model.RuleTypeFollow, rule.Type)
	assert.Equal(s.T(), "フォローありがとうございます", rule.ReplyMessage)
	assert.True(s.T(), rule.IsEnabled)
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TestFindByID_NotFound() {
	// 存在しないIDで取得を試行
	nonExistentID := uuid.New()
	rule, err := s.repo.FindByID(s.ctx, nonExistentID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), rule)
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TestFindByUserID_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	matchType := model.MatchTypePartial

	// 優先度の異なる複数のルールを作成
	s.testDB.CreateTestAutoReplyRule(s.T(), userID, "ルール3", model.RuleTypeKeyword, []string{"質問"}, &matchType, "ご質問ありがとうございます", 3)
	s.testDB.CreateTestAutoReplyRule(s.T(), userID, "ルール1", model.RuleTypeFollow, []string{}, nil, "フォローありがとうございます", 1)
	s.testDB.CreateTestAutoReplyRule(s.T(), userID, "ルール2", model.RuleTypeKeyword, []string{"料金"}, &matchType, "料金案内", 2)

	// 他のユーザーのルールも作成（取得されないことを確認）
	otherUserID := uuid.New()
	s.testDB.CreateTestAutoReplyRule(s.T(), otherUserID, "他ユーザールール", model.RuleTypeFollow, []string{}, nil, "他ユーザー", 1)

	// ルール一覧を取得
	rules, err := s.repo.FindByUserID(s.ctx, userID)

	// アサーション
	assert.NoError(s.T(), err)
	assert.Len(s.T(), rules, 3)

	// priority昇順でソートされていることを確認
	assert.Equal(s.T(), "ルール1", rules[0].Name)
	assert.Equal(s.T(), 1, rules[0].Priority)
	assert.Equal(s.T(), "ルール2", rules[1].Name)
	assert.Equal(s.T(), 2, rules[1].Priority)
	assert.Equal(s.T(), "ルール3", rules[2].Name)
	assert.Equal(s.T(), 3, rules[2].Priority)
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TestUpdate_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	matchType := model.MatchTypeExact
	ruleID := s.testDB.CreateTestAutoReplyRule(s.T(), userID, "更新前", model.RuleTypeKeyword, []string{"旧"}, &matchType, "更新前メッセージ", 1)
	uuid, err := uuid.Parse(ruleID)
	assert.NoError(s.T(), err)

	// ルールを取得
	rule, err := s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)

	// データを更新
	rule.Name = "更新後"
	rule.Keywords = []string{"新"}
	newMatchType := model.MatchTypePartial
	rule.MatchType = &newMatchType
	rule.ReplyMessage = "更新後メッセージ"
	rule.IsEnabled = false
	rule.Priority = 2
	rule.UpdatedAt = time.Now()

	// 更新を実行
	err = s.repo.Update(s.ctx, rule)
	assert.NoError(s.T(), err)

	// 更新されたデータを取得して確認
	updated, err := s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), "更新後", updated.Name)
	assert.Equal(s.T(), []string{"新"}, []string(updated.Keywords))
	assert.Equal(s.T(), newMatchType, *updated.MatchType)
	assert.Equal(s.T(), "更新後メッセージ", updated.ReplyMessage)
	assert.False(s.T(), updated.IsEnabled)
	assert.Equal(s.T(), 2, updated.Priority)
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TestDelete_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	ruleID := s.testDB.CreateTestAutoReplyRule(s.T(), userID, "削除テスト", model.RuleTypeFollow, []string{}, nil, "削除されます", 1)
	uuid, err := uuid.Parse(ruleID)
	assert.NoError(s.T(), err)

	// 削除前に存在確認
	_, err = s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)

	// 削除を実行
	err = s.repo.Delete(s.ctx, uuid)
	assert.NoError(s.T(), err)

	// 削除後は取得できないことを確認
	_, err = s.repo.FindByID(s.ctx, uuid)
	assert.Error(s.T(), err)
}

func (s *AutoReplyRuleRepositoryIntegrationTestSuite) TestKeywordsArray() {
	// PostgreSQL TEXT[]型の正しい処理を確認
	userID := uuid.New()
	matchType := model.MatchTypePartial

	rule := &model.AutoReplyRule{
		ID:           uuid.New(),
		UserID:       userID,
		Type:         model.RuleTypeKeyword,
		Name:         "配列テスト",
		Keywords:     []string{"キーワード1", "キーワード2", "キーワード3"},
		MatchType:    &matchType,
		ReplyMessage: "配列テストメッセージ",
		IsEnabled:    true,
		Priority:     1,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// 作成
	err := s.repo.Create(s.ctx, rule)
	assert.NoError(s.T(), err)

	// 取得して確認
	retrieved, err := s.repo.FindByID(s.ctx, rule.ID)
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), 3, len(retrieved.Keywords))
	assert.Equal(s.T(), "キーワード1", retrieved.Keywords[0])
	assert.Equal(s.T(), "キーワード2", retrieved.Keywords[1])
	assert.Equal(s.T(), "キーワード3", retrieved.Keywords[2])
}

// テストスイートを実行するためのエントリーポイント
func TestAutoReplyRuleRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(AutoReplyRuleRepositoryIntegrationTestSuite))
}
