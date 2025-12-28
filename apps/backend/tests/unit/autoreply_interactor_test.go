package unit

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/application/autoreply"
	"vt-link/backend/internal/domain/model"
	repoMocks "vt-link/backend/internal/domain/repository/mocks"
	serviceMocks "vt-link/backend/internal/domain/repository/mocks"
	"vt-link/backend/internal/infrastructure/external"
	"vt-link/backend/internal/shared/errx"
)

type AutoReplyInteractorTestSuite struct {
	suite.Suite
	interactor    autoreply.Usecase
	mockRepo      *repoMocks.MockAutoReplyRuleRepository
	mockReplier   *serviceMocks.MockLineReplier
	ctx           context.Context
	channelSecret string
}

func (s *AutoReplyInteractorTestSuite) SetupTest() {
	s.mockRepo = repoMocks.NewMockAutoReplyRuleRepository(s.T())
	s.mockReplier = serviceMocks.NewMockLineReplier(s.T())
	s.ctx = context.Background()
	s.channelSecret = "test-channel-secret"

	// LINE Replierを作成（モックとして使用）
	lineReplier := &external.LineReplier{}

	// Interactorを作成（実際にはmockReplierを使うため、環境変数経由でチャネルシークレットを設定）
	s.T().Setenv("LINE_CHANNEL_SECRET", s.channelSecret)
	s.interactor = autoreply.NewInteractor(s.mockRepo, lineReplier)
}

func (s *AutoReplyInteractorTestSuite) TestCreateRule_Success() {
	// 正常なルール作成のテスト
	userID := uuid.New()
	matchType := model.MatchTypeExact
	input := &autoreply.CreateRuleInput{
		UserID:       userID,
		Type:         model.RuleTypeKeyword,
		Name:         "テストルール",
		Keywords:     []string{"料金", "値段"},
		MatchType:    &matchType,
		ReplyMessage: "料金についてはこちら",
		Priority:     1,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().Create(s.ctx, mock.AnythingOfType("*model.AutoReplyRule")).Return(nil).Once()

	// テスト実行
	output, err := s.interactor.CreateRule(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), input.Name, output.Name)
	assert.Equal(s.T(), input.Type, output.Type)
	assert.Equal(s.T(), input.Keywords, []string(output.Keywords))
	assert.Equal(s.T(), input.ReplyMessage, output.ReplyMessage)
	assert.True(s.T(), output.IsEnabled)
}

func (s *AutoReplyInteractorTestSuite) TestCreateRule_EmptyName() {
	// 空の名前でのルール作成テスト
	userID := uuid.New()
	input := &autoreply.CreateRuleInput{
		UserID:       userID,
		Type:         model.RuleTypeFollow,
		Name:         "",
		ReplyMessage: "フォローありがとうございます",
		Priority:     1,
	}

	// テスト実行
	output, err := s.interactor.CreateRule(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)
	assert.Equal(s.T(), errx.ErrInvalidInput, err)
}

func (s *AutoReplyInteractorTestSuite) TestCreateRule_KeywordTypeWithoutKeywords() {
	// キーワードタイプでキーワードなしのテスト
	userID := uuid.New()
	input := &autoreply.CreateRuleInput{
		UserID:       userID,
		Type:         model.RuleTypeKeyword,
		Name:         "テストルール",
		Keywords:     []string{},
		ReplyMessage: "返信メッセージ",
		Priority:     1,
	}

	// テスト実行
	output, err := s.interactor.CreateRule(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "INVALID_INPUT", appErr.Code)
	}
}

func (s *AutoReplyInteractorTestSuite) TestListRules_Success() {
	// ルール一覧取得の正常テスト
	userID := uuid.New()
	matchType := model.MatchTypePartial

	expectedRules := []*model.AutoReplyRule{
		{
			ID:           uuid.New(),
			UserID:       userID,
			Type:         model.RuleTypeFollow,
			Name:         "フォロー返信",
			ReplyMessage: "フォローありがとうございます",
			IsEnabled:    true,
			Priority:     1,
		},
		{
			ID:           uuid.New(),
			UserID:       userID,
			Type:         model.RuleTypeKeyword,
			Name:         "料金案内",
			Keywords:     []string{"料金", "値段"},
			MatchType:    &matchType,
			ReplyMessage: "料金についてはこちら",
			IsEnabled:    true,
			Priority:     2,
		},
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(expectedRules, nil).Once()

	// テスト実行
	output, err := s.interactor.ListRules(s.ctx, userID)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Len(s.T(), output, 2)
	assert.Equal(s.T(), expectedRules[0].Priority, output[0].Priority)
	assert.Equal(s.T(), expectedRules[1].Priority, output[1].Priority)
}

func (s *AutoReplyInteractorTestSuite) TestUpdateRule_Success() {
	// ルール更新の正常テスト
	ruleID := uuid.New()
	userID := uuid.New()
	matchType := model.MatchTypeExact

	existingRule := &model.AutoReplyRule{
		ID:           ruleID,
		UserID:       userID,
		Type:         model.RuleTypeKeyword,
		Name:         "更新前",
		Keywords:     []string{"旧キーワード"},
		MatchType:    &matchType,
		ReplyMessage: "更新前メッセージ",
		IsEnabled:    true,
		Priority:     1,
	}

	newName := "更新後"
	newKeywords := []string{"新キーワード"}
	newMessage := "更新後メッセージ"
	newEnabled := false
	newPriority := 2

	input := &autoreply.UpdateRuleInput{
		ID:           ruleID,
		Name:         &newName,
		Keywords:     newKeywords,
		MatchType:    &matchType,
		ReplyMessage: &newMessage,
		IsEnabled:    &newEnabled,
		Priority:     &newPriority,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, ruleID).Return(existingRule, nil).Once()
	s.mockRepo.EXPECT().Update(s.ctx, mock.MatchedBy(func(r *model.AutoReplyRule) bool {
		return r.ID == ruleID &&
			r.Name == newName &&
			r.ReplyMessage == newMessage &&
			r.IsEnabled == newEnabled &&
			r.Priority == newPriority
	})).Return(nil).Once()

	// テスト実行
	output, err := s.interactor.UpdateRule(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), newName, output.Name)
	assert.Equal(s.T(), newMessage, output.ReplyMessage)
	assert.Equal(s.T(), newEnabled, output.IsEnabled)
	assert.Equal(s.T(), newPriority, output.Priority)
}

func (s *AutoReplyInteractorTestSuite) TestUpdateRule_NotFound() {
	// 存在しないルールの更新テスト
	ruleID := uuid.New()
	input := &autoreply.UpdateRuleInput{
		ID: ruleID,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, ruleID).Return(nil, errx.ErrNotFound).Once()

	// テスト実行
	output, err := s.interactor.UpdateRule(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)
	assert.Equal(s.T(), errx.ErrNotFound, err)
}

func (s *AutoReplyInteractorTestSuite) TestDeleteRule_Success() {
	// ルール削除の正常テスト
	ruleID := uuid.New()

	// Mockの期待値を設定
	s.mockRepo.EXPECT().Delete(s.ctx, ruleID).Return(nil).Once()

	// テスト実行
	err := s.interactor.DeleteRule(s.ctx, ruleID)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *AutoReplyInteractorTestSuite) TestDeleteRule_NotFound() {
	// 存在しないルールの削除テスト
	ruleID := uuid.New()

	// Mockの期待値を設定
	s.mockRepo.EXPECT().Delete(s.ctx, ruleID).Return(errx.ErrNotFound).Once()

	// テスト実行
	err := s.interactor.DeleteRule(s.ctx, ruleID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Equal(s.T(), errx.ErrNotFound, err)
}

func (s *AutoReplyInteractorTestSuite) TestProcessWebhook_Follow() {
	// フォローイベント処理のテスト
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")

	rules := []*model.AutoReplyRule{
		{
			ID:           uuid.New(),
			UserID:       userID,
			Type:         model.RuleTypeFollow,
			Name:         "フォロー返信",
			ReplyMessage: "フォローありがとうございます",
			IsEnabled:    true,
			Priority:     1,
		},
	}

	webhookBody := map[string]interface{}{
		"destination": "test",
		"events": []map[string]interface{}{
			{
				"type":       "follow",
				"replyToken": "test-reply-token",
				"source": map[string]string{
					"type":   "user",
					"userId": "test-user-id",
				},
			},
		},
	}

	bodyBytes, _ := json.Marshal(webhookBody)
	signature := s.generateSignature(bodyBytes)

	input := &autoreply.WebhookInput{
		Signature: signature,
		Body:      bodyBytes,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(rules, nil).Once()
	s.mockReplier.EXPECT().Reply(s.ctx, "test-reply-token", "フォローありがとうございます").Return(nil).Once()

	// テスト実行
	err := s.interactor.ProcessWebhook(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *AutoReplyInteractorTestSuite) TestProcessWebhook_Message_ExactMatch() {
	// メッセージイベント（完全一致）処理のテスト
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	matchType := model.MatchTypeExact

	rules := []*model.AutoReplyRule{
		{
			ID:           uuid.New(),
			UserID:       userID,
			Type:         model.RuleTypeKeyword,
			Name:         "料金案内",
			Keywords:     []string{"料金", "値段"},
			MatchType:    &matchType,
			ReplyMessage: "料金についてはこちら",
			IsEnabled:    true,
			Priority:     1,
		},
	}

	webhookBody := map[string]interface{}{
		"destination": "test",
		"events": []map[string]interface{}{
			{
				"type":       "message",
				"replyToken": "test-reply-token",
				"source": map[string]string{
					"type":   "user",
					"userId": "test-user-id",
				},
				"message": map[string]string{
					"type": "text",
					"text": "料金",
				},
			},
		},
	}

	bodyBytes, _ := json.Marshal(webhookBody)
	signature := s.generateSignature(bodyBytes)

	input := &autoreply.WebhookInput{
		Signature: signature,
		Body:      bodyBytes,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(rules, nil).Once()
	s.mockReplier.EXPECT().Reply(s.ctx, "test-reply-token", "料金についてはこちら").Return(nil).Once()

	// テスト実行
	err := s.interactor.ProcessWebhook(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *AutoReplyInteractorTestSuite) TestProcessWebhook_Message_PartialMatch() {
	// メッセージイベント（部分一致）処理のテスト
	userID := uuid.MustParse("00000000-0000-0000-0000-000000000000")
	matchType := model.MatchTypePartial

	rules := []*model.AutoReplyRule{
		{
			ID:           uuid.New(),
			UserID:       userID,
			Type:         model.RuleTypeKeyword,
			Name:         "料金案内",
			Keywords:     []string{"料金", "値段"},
			MatchType:    &matchType,
			ReplyMessage: "料金についてはこちら",
			IsEnabled:    true,
			Priority:     1,
		},
	}

	webhookBody := map[string]interface{}{
		"destination": "test",
		"events": []map[string]interface{}{
			{
				"type":       "message",
				"replyToken": "test-reply-token",
				"source": map[string]string{
					"type":   "user",
					"userId": "test-user-id",
				},
				"message": map[string]string{
					"type": "text",
					"text": "料金はいくらですか？",
				},
			},
		},
	}

	bodyBytes, _ := json.Marshal(webhookBody)
	signature := s.generateSignature(bodyBytes)

	input := &autoreply.WebhookInput{
		Signature: signature,
		Body:      bodyBytes,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(rules, nil).Once()
	s.mockReplier.EXPECT().Reply(s.ctx, "test-reply-token", "料金についてはこちら").Return(nil).Once()

	// テスト実行
	err := s.interactor.ProcessWebhook(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *AutoReplyInteractorTestSuite) TestProcessWebhook_InvalidSignature() {
	// 署名検証失敗のテスト
	webhookBody := map[string]interface{}{
		"destination": "test",
		"events":      []map[string]interface{}{},
	}

	bodyBytes, _ := json.Marshal(webhookBody)

	input := &autoreply.WebhookInput{
		Signature: "invalid-signature",
		Body:      bodyBytes,
	}

	// テスト実行
	err := s.interactor.ProcessWebhook(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "INVALID_SIGNATURE", appErr.Code)
		assert.Equal(s.T(), 401, appErr.Status)
	}
}

// generateSignature テスト用のHMAC署名を生成
func (s *AutoReplyInteractorTestSuite) generateSignature(body []byte) string {
	mac := hmac.New(sha256.New, []byte(s.channelSecret))
	mac.Write(body)
	return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}

// テストスイートを実行するためのエントリーポイント
func TestAutoReplyInteractorTestSuite(t *testing.T) {
	suite.Run(t, new(AutoReplyInteractorTestSuite))
}
