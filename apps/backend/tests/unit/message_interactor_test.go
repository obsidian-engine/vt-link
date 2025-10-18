package unit

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/application/message"
	"vt-link/backend/internal/domain/model"
	repoMocks "vt-link/backend/internal/domain/repository/mocks"
	serviceMocks "vt-link/backend/internal/domain/service/mocks"
	"vt-link/backend/internal/shared/errx"
)

type MessageInteractorTestSuite struct {
	suite.Suite
	interactor message.Usecase
	mockRepo   *repoMocks.MockMessageRepository
	mockPusher *serviceMocks.MockPusher
	mockTxMgr  *repoMocks.MockTxManager
	ctx        context.Context
}

func (s *MessageInteractorTestSuite) SetupTest() {
	s.mockRepo = repoMocks.NewMockMessageRepository(s.T())
	s.mockPusher = serviceMocks.NewMockPusher(s.T())
	s.mockTxMgr = repoMocks.NewMockTxManager(s.T())
	s.ctx = context.Background()

	// Clockはnilのまま（必要に応じて後で追加）
	s.interactor = message.NewInteractor(s.mockRepo, s.mockTxMgr, s.mockPusher, nil)
}

func (s *MessageInteractorTestSuite) TestCreateMessage_Success() {
	// 正常なメッセージ作成のテスト
	input := &message.CreateMessageInput{
		Title:   "テストメッセージ",
		Body: "テストメッセージ",
	}

	// Mockの期待値を設定（任意のMessageを受け取る）
	s.mockRepo.EXPECT().Create(s.ctx, mock.AnythingOfType("*model.Message")).Return(nil).Once()

	// テスト実行
	output, err := s.interactor.CreateMessage(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), input.Title, output.Title)
	assert.Equal(s.T(), input.Body, output.Body)
	assert.Equal(s.T(), model.MessageStatusDraft, output.Status)
}

func (s *MessageInteractorTestSuite) TestCreateMessage_EmptyTitle() {
	// 空のタイトルでのメッセージ作成テスト
	input := &message.CreateMessageInput{
		Title:   "",
		Body: "テストメッセージ",
	}

	// テスト実行
	output, err := s.interactor.CreateMessage(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)

	// エラーの詳細を確認
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "INVALID_INPUT", appErr.Code)
	}
}

func (s *MessageInteractorTestSuite) TestSendMessage_Success() {
	// テストデータ準備
	messageID := uuid.New()
	existingMessage := &model.Message{
		ID:      messageID,
		Title:   "テストメッセージ",
		Body: "テストメッセージ",
		Status:  model.MessageStatusDraft,
	}

	input := &message.SendMessageInput{
		ID: messageID,
	}

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(nil).Once()

	// 2. メッセージ取得が呼ばれる（トランザクション内）
	s.mockRepo.EXPECT().FindByID(s.ctx, messageID).Return(existingMessage, nil).Once()

	// 3. プッシュサービスが呼ばれる（タイトルとメッセージが結合されたもの）
	expectedMessage := fmt.Sprintf("%s\n\n%s", existingMessage.Title, existingMessage.Body)
	s.mockPusher.EXPECT().PushText(s.ctx, expectedMessage).Return(nil).Once()

	// 4. メッセージ更新が呼ばれる（送信済みステータスに変更）
	s.mockRepo.EXPECT().Update(s.ctx, mock.MatchedBy(func(c *model.Message) bool {
		return c.ID == messageID && c.Status == model.MessageStatusSent
	})).Return(nil).Once()

	// テスト実行
	err := s.interactor.SendMessage(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *MessageInteractorTestSuite) TestSendMessage_MessageNotFound() {
	// テストデータ準備
	messageID := uuid.New()
	input := &message.SendMessageInput{
		ID: messageID,
	}

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(errx.ErrNotFound).Once()

	// 2. メッセージ取得が呼ばれるがNotFoundエラーを返す
	s.mockRepo.EXPECT().FindByID(s.ctx, messageID).Return(nil, errx.ErrNotFound).Once()

	// テスト実行
	err := s.interactor.SendMessage(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Equal(s.T(), errx.ErrNotFound, err)
}

func (s *MessageInteractorTestSuite) TestSendMessage_AlreadySent() {
	// テストデータ準備（既に送信済みのメッセージ）
	messageID := uuid.New()
	alreadySentMessage := &model.Message{
		ID:      messageID,
		Title:   "既に送信済みメッセージ",
		Body: "テストメッセージ",
		Status:  model.MessageStatusSent, // 既に送信済み
	}

	input := &message.SendMessageInput{
		ID: messageID,
	}

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(errx.NewAppError("CANNOT_SEND", "Message cannot be sent", 400)).Once()

	// 2. メッセージ取得が呼ばれる（送信済みステータス）
	s.mockRepo.EXPECT().FindByID(s.ctx, messageID).Return(alreadySentMessage, nil).Once()

	// テスト実行
	err := s.interactor.SendMessage(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "CANNOT_SEND", appErr.Code)
	}
}

func (s *MessageInteractorTestSuite) TestSendMessage_PushServiceFailure() {
	// テストデータ準備
	messageID := uuid.New()
	existingMessage := &model.Message{
		ID:      messageID,
		Title:   "プッシュ失敗テストメッセージ",
		Body: "テストメッセージ",
		Status:  model.MessageStatusDraft,
	}

	input := &message.SendMessageInput{
		ID: messageID,
	}

	pushError := fmt.Errorf("push service connection failed")

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(errx.NewAppError("PUSH_FAILED", "Failed to send message", 500)).Once()

	// 2. メッセージ取得が呼ばれる
	s.mockRepo.EXPECT().FindByID(s.ctx, messageID).Return(existingMessage, nil).Once()

	// 3. プッシュサービスが失敗する
	expectedMessage := fmt.Sprintf("%s\n\n%s", existingMessage.Title, existingMessage.Body)
	s.mockPusher.EXPECT().PushText(s.ctx, expectedMessage).Return(pushError).Once()

	// 4. メッセージ更新が呼ばれる（失敗ステータスに変更）
	s.mockRepo.EXPECT().Update(s.ctx, mock.MatchedBy(func(c *model.Message) bool {
		return c.ID == messageID && c.Status == model.MessageStatusFailed
	})).Return(nil).Once()

	// テスト実行
	err := s.interactor.SendMessage(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "PUSH_FAILED", appErr.Code)
	}
}

func (s *MessageInteractorTestSuite) TestListMessages_Success() {
	// メッセージ一覧取得の正常テスト
	expectedMessages := []*model.Message{
		{
			ID:        uuid.New(),
			Title:     "メッセージ1",
			Body:   "メッセージ1",
			Status:    model.MessageStatusDraft,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New(),
			Title:     "メッセージ2",
			Body:   "メッセージ2",
			Status:    model.MessageStatusSent,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().List(s.ctx, 100, 0).Return(expectedMessages, nil).Once()

	// テスト実行
	output, err := s.interactor.ListMessages(s.ctx, &message.ListMessagesInput{})

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Len(s.T(), output, 2)
	assert.Equal(s.T(), expectedMessages[0].Title, output[0].Title)
	assert.Equal(s.T(), expectedMessages[1].Title, output[1].Title)
}

// テストスイートを実行するためのエントリーポイント
func TestMessageInteractorTestSuite(t *testing.T) {
	suite.Run(t, new(MessageInteractorTestSuite))
}
