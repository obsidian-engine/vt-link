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

	"vt-link/backend/internal/application/campaign"
	"vt-link/backend/internal/domain/model"
	repoMocks "vt-link/backend/internal/domain/repository/mocks"
	serviceMocks "vt-link/backend/internal/domain/service/mocks"
	"vt-link/backend/internal/shared/errx"
)

type CampaignInteractorTestSuite struct {
	suite.Suite
	interactor campaign.Usecase
	mockRepo   *repoMocks.MockCampaignRepository
	mockPusher *serviceMocks.MockPusher
	mockTxMgr  *repoMocks.MockTxManager
	ctx        context.Context
}

func (s *CampaignInteractorTestSuite) SetupTest() {
	s.mockRepo = repoMocks.NewMockCampaignRepository(s.T())
	s.mockPusher = serviceMocks.NewMockPusher(s.T())
	s.mockTxMgr = repoMocks.NewMockTxManager(s.T())
	s.ctx = context.Background()

	// Clockはnilのまま（必要に応じて後で追加）
	s.interactor = campaign.NewInteractor(s.mockRepo, s.mockTxMgr, s.mockPusher, nil)
}

func (s *CampaignInteractorTestSuite) TestCreateCampaign_Success() {
	// 正常なキャンペーン作成のテスト
	input := &campaign.CreateCampaignInput{
		Title:   "テストキャンペーン",
		Message: "テストメッセージ",
	}

	// Mockの期待値を設定（任意のCampaignを受け取る）
	s.mockRepo.EXPECT().Create(s.ctx, mock.AnythingOfType("*model.Campaign")).Return(nil).Once()

	// テスト実行
	output, err := s.interactor.CreateCampaign(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), input.Title, output.Title)
	assert.Equal(s.T(), input.Message, output.Message)
	assert.Equal(s.T(), model.CampaignStatusDraft, output.Status)
}

func (s *CampaignInteractorTestSuite) TestCreateCampaign_EmptyTitle() {
	// 空のタイトルでのキャンペーン作成テスト
	input := &campaign.CreateCampaignInput{
		Title:   "",
		Message: "テストメッセージ",
	}

	// テスト実行
	output, err := s.interactor.CreateCampaign(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)

	// エラーの詳細を確認
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "INVALID_INPUT", appErr.Code)
	}
}

func (s *CampaignInteractorTestSuite) TestSendCampaign_Success() {
	// テストデータ準備
	campaignID := uuid.New()
	existingCampaign := &model.Campaign{
		ID:      campaignID,
		Title:   "テストキャンペーン",
		Message: "テストメッセージ",
		Status:  model.CampaignStatusDraft,
	}

	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(nil).Once()

	// 2. キャンペーン取得が呼ばれる（トランザクション内）
	s.mockRepo.EXPECT().FindByID(s.ctx, campaignID).Return(existingCampaign, nil).Once()

	// 3. プッシュサービスが呼ばれる（タイトルとメッセージが結合されたもの）
	expectedMessage := fmt.Sprintf("%s\n\n%s", existingCampaign.Title, existingCampaign.Message)
	s.mockPusher.EXPECT().PushText(s.ctx, expectedMessage).Return(nil).Once()

	// 4. キャンペーン更新が呼ばれる（送信済みステータスに変更）
	s.mockRepo.EXPECT().Update(s.ctx, mock.MatchedBy(func(c *model.Campaign) bool {
		return c.ID == campaignID && c.Status == model.CampaignStatusSent
	})).Return(nil).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *CampaignInteractorTestSuite) TestSendCampaign_CampaignNotFound() {
	// テストデータ準備
	campaignID := uuid.New()
	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(errx.ErrNotFound).Once()

	// 2. キャンペーン取得が呼ばれるがNotFoundエラーを返す
	s.mockRepo.EXPECT().FindByID(s.ctx, campaignID).Return(nil, errx.ErrNotFound).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Equal(s.T(), errx.ErrNotFound, err)
}

func (s *CampaignInteractorTestSuite) TestSendCampaign_AlreadySent() {
	// テストデータ準備（既に送信済みのキャンペーン）
	campaignID := uuid.New()
	alreadySentCampaign := &model.Campaign{
		ID:      campaignID,
		Title:   "既に送信済みキャンペーン",
		Message: "テストメッセージ",
		Status:  model.CampaignStatusSent, // 既に送信済み
	}

	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(errx.NewAppError("CANNOT_SEND", "Campaign cannot be sent", 400)).Once()

	// 2. キャンペーン取得が呼ばれる（送信済みステータス）
	s.mockRepo.EXPECT().FindByID(s.ctx, campaignID).Return(alreadySentCampaign, nil).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "CANNOT_SEND", appErr.Code)
	}
}

func (s *CampaignInteractorTestSuite) TestSendCampaign_PushServiceFailure() {
	// テストデータ準備
	campaignID := uuid.New()
	existingCampaign := &model.Campaign{
		ID:      campaignID,
		Title:   "プッシュ失敗テストキャンペーン",
		Message: "テストメッセージ",
		Status:  model.CampaignStatusDraft,
	}

	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	pushError := fmt.Errorf("push service connection failed")

	// モックの期待値設定
	// 1. トランザクション実行が呼ばれて、内部の関数を実行する
	s.mockTxMgr.EXPECT().WithinTx(s.ctx, mock.AnythingOfType("func(context.Context) error")).
		Run(func(ctx context.Context, fn func(context.Context) error) {
			fn(ctx) // 渡された関数を実行
		}).Return(errx.NewAppError("PUSH_FAILED", "Failed to send message", 500)).Once()

	// 2. キャンペーン取得が呼ばれる
	s.mockRepo.EXPECT().FindByID(s.ctx, campaignID).Return(existingCampaign, nil).Once()

	// 3. プッシュサービスが失敗する
	expectedMessage := fmt.Sprintf("%s\n\n%s", existingCampaign.Title, existingCampaign.Message)
	s.mockPusher.EXPECT().PushText(s.ctx, expectedMessage).Return(pushError).Once()

	// 4. キャンペーン更新が呼ばれる（失敗ステータスに変更）
	s.mockRepo.EXPECT().Update(s.ctx, mock.MatchedBy(func(c *model.Campaign) bool {
		return c.ID == campaignID && c.Status == model.CampaignStatusFailed
	})).Return(nil).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "PUSH_FAILED", appErr.Code)
	}
}

func (s *CampaignInteractorTestSuite) TestListCampaigns_Success() {
	// キャンペーン一覧取得の正常テスト
	expectedCampaigns := []*model.Campaign{
		{
			ID:        uuid.New(),
			Title:     "キャンペーン1",
			Message:   "メッセージ1",
			Status:    model.CampaignStatusDraft,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		{
			ID:        uuid.New(),
			Title:     "キャンペーン2",
			Message:   "メッセージ2",
			Status:    model.CampaignStatusSent,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().List(s.ctx, 100, 0).Return(expectedCampaigns, nil).Once()

	// テスト実行
	output, err := s.interactor.ListCampaigns(s.ctx, &campaign.ListCampaignsInput{})

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Len(s.T(), output, 2)
	assert.Equal(s.T(), expectedCampaigns[0].Title, output[0].Title)
	assert.Equal(s.T(), expectedCampaigns[1].Title, output[1].Title)
}

// テストスイートを実行するためのエントリーポイント
func TestCampaignInteractorTestSuite(t *testing.T) {
	suite.Run(t, new(CampaignInteractorTestSuite))
}
