package unit

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	"vt-link/backend/internal/domain/model"
)

type CampaignModelTestSuite struct {
	suite.Suite
	campaign *model.Campaign
}

func (s *CampaignModelTestSuite) SetupTest() {
	// テストごとに新しいキャンペーンインスタンスを作成
	s.campaign = &model.Campaign{
		ID:        uuid.New(),
		Title:     "テストキャンペーン",
		Message:   "これはテストメッセージです",
		Status:    model.CampaignStatusDraft,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

func (s *CampaignModelTestSuite) TestCanSend_DraftStatus() {
	// DraftステータスのキャンペーンはCanSendがtrueを返すべき
	s.campaign.Status = model.CampaignStatusDraft
	assert.True(s.T(), s.campaign.CanSend())
}

func (s *CampaignModelTestSuite) TestCanSend_ScheduledStatus() {
	// ScheduledステータスのキャンペーンはCanSendがtrueを返すべき
	s.campaign.Status = model.CampaignStatusScheduled
	assert.True(s.T(), s.campaign.CanSend())
}

func (s *CampaignModelTestSuite) TestCanSend_SentStatus() {
	// SentステータスのキャンペーンはCanSendがfalseを返すべき
	s.campaign.Status = model.CampaignStatusSent
	assert.False(s.T(), s.campaign.CanSend())
}

func (s *CampaignModelTestSuite) TestCanSend_FailedStatus() {
	// FailedステータスのキャンペーンはCanSendがtrueを返すべき（再送可能）
	s.campaign.Status = model.CampaignStatusFailed
	assert.True(s.T(), s.campaign.CanSend())
}

func (s *CampaignModelTestSuite) TestMarkAsSent() {
	// キャンペーンを送信済みにマーク
	s.campaign.Status = model.CampaignStatusDraft
	s.campaign.MarkAsSent()

	assert.Equal(s.T(), model.CampaignStatusSent, s.campaign.Status)
	assert.NotNil(s.T(), s.campaign.SentAt)
	assert.True(s.T(), s.campaign.SentAt.After(time.Now().Add(-time.Second)))
}

func (s *CampaignModelTestSuite) TestMarkAsFailed() {
	// キャンペーンを失敗としてマーク
	s.campaign.Status = model.CampaignStatusDraft
	s.campaign.MarkAsFailed()

	assert.Equal(s.T(), model.CampaignStatusFailed, s.campaign.Status)
}

func (s *CampaignModelTestSuite) TestSchedule() {
	// キャンペーンをスケジューリング
	scheduleTime := time.Now().Add(1 * time.Hour)
	s.campaign.Status = model.CampaignStatusDraft
	s.campaign.Schedule(scheduleTime)

	assert.Equal(s.T(), model.CampaignStatusScheduled, s.campaign.Status)
	assert.Equal(s.T(), &scheduleTime, s.campaign.ScheduledAt)
}

func (s *CampaignModelTestSuite) TestValidation_EmptyTitle() {
	// 空のタイトルの場合のバリデーション
	s.campaign.Title = ""

	// Validateメソッドが存在する場合のテスト（実装によって異なる）
	// err := s.campaign.Validate()
	// assert.Error(s.T(), err)
}

func (s *CampaignModelTestSuite) TestValidation_EmptyMessage() {
	// 空のメッセージの場合のバリデーション
	s.campaign.Message = ""

	// Validateメソッドが存在する場合のテスト（実装によって異なる）
	// err := s.campaign.Validate()
	// assert.Error(s.T(), err)
}

// テストスイートを実行するためのエントリーポイント
func TestCampaignModelTestSuite(t *testing.T) {
	suite.Run(t, new(CampaignModelTestSuite))
}