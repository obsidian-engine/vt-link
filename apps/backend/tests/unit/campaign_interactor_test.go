package unit

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/application/campaign"
	"vt-link/backend/internal/domain/model"
	repoMocks "vt-link/backend/internal/domain/repository/mocks"
	serviceMocks "vt-link/backend/internal/domain/service/mocks"
	"vt-link/backend/internal/shared/errx"
)

type CampaignInteractorTestSuite struct {
	suite.Suite
	interactor   campaign.Interactor
	mockRepo     *repoMocks.MockCampaignRepository
	mockPusher   *serviceMocks.MockPusher
	ctx          context.Context
}

func (s *CampaignInteractorTestSuite) SetupTest() {
	s.mockRepo = repoMocks.NewMockCampaignRepository(s.T())
	s.mockPusher = serviceMocks.NewMockPusher(s.T())
	s.ctx = context.Background()

	s.interactor = campaign.NewInteractor(s.mockRepo, s.mockPusher)
}

func (s *CampaignInteractorTestSuite) TestCreateCampaign_Success() {
	// 正常なキャンペーン作成のテスト
	input := &campaign.CreateCampaignInput{
		Title:   "テストキャンペーン",
		Message: "テストメッセージ",
	}

	expectedCampaign := &model.Campaign{
		ID:        uuid.New(),
		Title:     input.Title,
		Message:   input.Message,
		Status:    model.CampaignStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().Create(s.ctx, expectedCampaign).Return(nil).Once()

	// テスト実行
	output, err := s.interactor.CreateCampaign(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), input.Title, output.Campaign.Title)
	assert.Equal(s.T(), input.Message, output.Campaign.Message)
	assert.Equal(s.T(), model.CampaignStatusDraft, output.Campaign.Status)
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
	// 正常なキャンペーン送信のテスト
	campaignID := uuid.New()
	existingCampaign := &model.Campaign{
		ID:        campaignID,
		Title:     "テストキャンペーン",
		Message:   "テストメッセージ",
		Status:    model.CampaignStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().GetByID(s.ctx, campaignID).Return(existingCampaign, nil).Once()
	s.mockPusher.EXPECT().PushMessage(s.ctx, existingCampaign.Title, existingCampaign.Message).Return(nil).Once()
	s.mockRepo.EXPECT().Update(s.ctx, existingCampaign).Return(nil).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), model.CampaignStatusSent, existingCampaign.Status)
	assert.NotNil(s.T(), existingCampaign.SentAt)
}

func (s *CampaignInteractorTestSuite) TestSendCampaign_CampaignNotFound() {
	// 存在しないキャンペーンの送信テスト
	campaignID := uuid.New()
	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().GetByID(s.ctx, campaignID).Return(nil, errx.NewAppError("NOT_FOUND", "Campaign not found", 404)).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "NOT_FOUND", appErr.Code)
	}
}

func (s *CampaignInteractorTestSuite) TestSendCampaign_AlreadySent() {
	// 既に送信済みのキャンペーンの送信テスト
	campaignID := uuid.New()
	existingCampaign := &model.Campaign{
		ID:        campaignID,
		Title:     "テストキャンペーン",
		Message:   "テストメッセージ",
		Status:    model.CampaignStatusSent,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		SentAt:    &time.Time{},
	}

	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().GetByID(s.ctx, campaignID).Return(existingCampaign, nil).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "ALREADY_SENT", appErr.Code)
	}
}

func (s *CampaignInteractorTestSuite) TestSendCampaign_PushServiceFailure() {
	// プッシュサービスの失敗テスト
	campaignID := uuid.New()
	existingCampaign := &model.Campaign{
		ID:        campaignID,
		Title:     "テストキャンペーン",
		Message:   "テストメッセージ",
		Status:    model.CampaignStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	input := &campaign.SendCampaignInput{
		ID: campaignID,
	}

	pushError := errx.NewAppError("PUSH_FAILED", "Push service failed", 500)

	// Mockの期待値を設定
	s.mockRepo.EXPECT().GetByID(s.ctx, campaignID).Return(existingCampaign, nil).Once()
	s.mockPusher.EXPECT().PushMessage(s.ctx, existingCampaign.Title, existingCampaign.Message).Return(pushError).Once()
	s.mockRepo.EXPECT().Update(s.ctx, existingCampaign).Return(nil).Once()

	// テスト実行
	err := s.interactor.SendCampaign(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Equal(s.T(), model.CampaignStatusFailed, existingCampaign.Status)
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
	s.mockRepo.EXPECT().List(s.ctx).Return(expectedCampaigns, nil).Once()

	// テスト実行
	output, err := s.interactor.ListCampaigns(s.ctx, &campaign.ListCampaignsInput{})

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Len(s.T(), output.Campaigns, 2)
	assert.Equal(s.T(), expectedCampaigns[0].Title, output.Campaigns[0].Title)
	assert.Equal(s.T(), expectedCampaigns[1].Title, output.Campaigns[1].Title)
}

// テストスイートを実行するためのエントリーポイント
func TestCampaignInteractorTestSuite(t *testing.T) {
	suite.Run(t, new(CampaignInteractorTestSuite))
}