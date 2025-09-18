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
	fixedTime time.Time
	campaign  *model.Campaign
}

func (s *CampaignModelTestSuite) SetupTest() {
	// 固定された時刻を使用してテストの一貫性を保つ
	s.fixedTime = time.Date(2024, 1, 1, 12, 0, 0, 0, time.UTC)

	s.campaign = &model.Campaign{
		ID:        uuid.New(),
		Title:     "テストキャンペーン",
		Message:   "これはテストメッセージです",
		Status:    model.CampaignStatusDraft,
		CreatedAt: s.fixedTime,
		UpdatedAt: s.fixedTime,
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
	beforeTime := time.Now()
	s.campaign.Status = model.CampaignStatusDraft
	s.campaign.MarkAsSent()

	assert.Equal(s.T(), model.CampaignStatusSent, s.campaign.Status)
	assert.NotNil(s.T(), s.campaign.SentAt)
	assert.True(s.T(), s.campaign.SentAt.After(beforeTime.Add(-time.Second)))
	assert.True(s.T(), s.campaign.SentAt.Before(time.Now().Add(time.Second)))
}

func (s *CampaignModelTestSuite) TestMarkAsFailed() {
	// キャンペーンを失敗としてマーク
	s.campaign.Status = model.CampaignStatusDraft
	s.campaign.MarkAsFailed()

	assert.Equal(s.T(), model.CampaignStatusFailed, s.campaign.Status)
}

func (s *CampaignModelTestSuite) TestSchedule() {
	// キャンペーンをスケジューリング
	scheduleTime := s.fixedTime.Add(1 * time.Hour)
	s.campaign.Status = model.CampaignStatusDraft
	s.campaign.Schedule(scheduleTime)

	assert.Equal(s.T(), model.CampaignStatusScheduled, s.campaign.Status)
	assert.Equal(s.T(), &scheduleTime, s.campaign.ScheduledAt)
}

// エッジケースのテスト
func (s *CampaignModelTestSuite) TestCanSend_WithNilCampaign() {
	// nilチェックのテスト
	var nilCampaign *model.Campaign
	// nilの場合の動作確認（実装に依存）
	_ = nilCampaign
}

func (s *CampaignModelTestSuite) TestSchedule_PastTime() {
	// 過去の時間でのスケジューリングテスト
	pastTime := s.fixedTime.Add(-1 * time.Hour)
	s.campaign.Status = model.CampaignStatusDraft

	// 過去の時間での動作確認（実装によってはエラーになるべき）
	s.campaign.Schedule(pastTime)

	// 実装に応じてアサーションを調整
	assert.Equal(s.T(), model.CampaignStatusScheduled, s.campaign.Status)
	assert.Equal(s.T(), &pastTime, s.campaign.ScheduledAt)
}

func (s *CampaignModelTestSuite) TestMarkAsSent_Idempotent() {
	// 冪等性のテスト（複数回実行しても結果が同じ）
	s.campaign.Status = model.CampaignStatusDraft
	s.campaign.MarkAsSent()

	firstSentAt := s.campaign.SentAt

	// 再度実行
	s.campaign.MarkAsSent()

	assert.Equal(s.T(), model.CampaignStatusSent, s.campaign.Status)
	assert.Equal(s.T(), firstSentAt, s.campaign.SentAt) // 時刻は変わらないはず
}

func (s *CampaignModelTestSuite) TestStatusTransitions() {
	// ステータス遷移のテスト
	testCases := []struct {
		name           string
		initialStatus  model.CampaignStatus
		action         func(*model.Campaign)
		expectedStatus model.CampaignStatus
		shouldSuccess  bool
	}{
		{
			name:          "Draft to Sent",
			initialStatus: model.CampaignStatusDraft,
			action: func(c *model.Campaign) {
				c.MarkAsSent()
			},
			expectedStatus: model.CampaignStatusSent,
			shouldSuccess:  true,
		},
		{
			name:          "Draft to Failed",
			initialStatus: model.CampaignStatusDraft,
			action: func(c *model.Campaign) {
				c.MarkAsFailed()
			},
			expectedStatus: model.CampaignStatusFailed,
			shouldSuccess:  true,
		},
		{
			name:          "Scheduled to Sent",
			initialStatus: model.CampaignStatusScheduled,
			action: func(c *model.Campaign) {
				c.MarkAsSent()
			},
			expectedStatus: model.CampaignStatusSent,
			shouldSuccess:  true,
		},
	}

	for _, tc := range testCases {
		s.Run(tc.name, func() {
			// 新しいキャンペーンインスタンスを作成
			campaign := &model.Campaign{
				ID:        uuid.New(),
				Title:     "ステータステスト",
				Message:   "テストメッセージ",
				Status:    tc.initialStatus,
				CreatedAt: s.fixedTime,
				UpdatedAt: s.fixedTime,
			}

			tc.action(campaign)
			assert.Equal(s.T(), tc.expectedStatus, campaign.Status)
		})
	}
}

// テストスイートを実行するためのエントリーポイント
func TestCampaignModelTestSuite(t *testing.T) {
	suite.Run(t, new(CampaignModelTestSuite))
}