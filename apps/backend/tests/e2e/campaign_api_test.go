package e2e

import (
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type CampaignAPIE2ETestSuite struct {
	suite.Suite
	client  *TestClient
	config  *TestConfig
	cleanup func()
}

func (s *CampaignAPIE2ETestSuite) SetupSuite() {
	s.client, s.config, s.cleanup = SetupE2ETest(s.T())
}

func (s *CampaignAPIE2ETestSuite) TearDownSuite() {
	if s.cleanup != nil {
		s.cleanup()
	}
}

func (s *CampaignAPIE2ETestSuite) TestHealthCheck() {
	// ヘルスチェックエンドポイントのテスト
	err := s.client.HealthCheck(s.T())
	assert.NoError(s.T(), err)
}

func (s *CampaignAPIE2ETestSuite) TestCreateCampaign_Success() {
	// キャンペーン作成の正常系テスト
	req := &CreateCampaignRequest{
		Title:   "E2Eテストキャンペーン",
		Message: "E2Eテストメッセージ",
	}

	resp, err := s.client.CreateCampaign(s.T(), req)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), resp)
	assert.NotEmpty(s.T(), resp.Campaign.ID)
	assert.Equal(s.T(), req.Title, resp.Campaign.Title)
	assert.Equal(s.T(), req.Message, resp.Campaign.Message)
	assert.Equal(s.T(), "draft", resp.Campaign.Status)
	assert.False(s.T(), resp.Campaign.CreatedAt.IsZero())
	assert.False(s.T(), resp.Campaign.UpdatedAt.IsZero())
}

func (s *CampaignAPIE2ETestSuite) TestCreateCampaign_InvalidInput() {
	// 無効な入力でのキャンペーン作成テスト
	req := &CreateCampaignRequest{
		Title:   "", // 空のタイトル
		Message: "テストメッセージ",
	}

	resp, err := s.client.CreateCampaign(s.T(), req)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), resp)
	assert.Contains(s.T(), err.Error(), "INVALID_INPUT")
}

func (s *CampaignAPIE2ETestSuite) TestListCampaigns_Empty() {
	// 空のキャンペーン一覧取得テスト
	resp, err := s.client.ListCampaigns(s.T())

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), resp)
	// 初期状態では空である可能性が高い
	assert.IsType(s.T(), []Campaign{}, resp.Campaigns)
}

func (s *CampaignAPIE2ETestSuite) TestCreateAndListCampaigns() {
	// キャンペーン作成後の一覧取得テスト
	// 1. キャンペーンを作成
	createReq := &CreateCampaignRequest{
		Title:   "一覧テストキャンペーン",
		Message: "一覧テストメッセージ",
	}

	createResp, err := s.client.CreateCampaign(s.T(), createReq)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), createResp)

	// 2. キャンペーン一覧を取得
	listResp, err := s.client.ListCampaigns(s.T())
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), listResp)

	// 3. 作成したキャンペーンが一覧に含まれていることを確認
	found := false
	for _, campaign := range listResp.Campaigns {
		if campaign.ID == createResp.Campaign.ID {
			found = true
			assert.Equal(s.T(), createReq.Title, campaign.Title)
			assert.Equal(s.T(), createReq.Message, campaign.Message)
			assert.Equal(s.T(), "draft", campaign.Status)
			break
		}
	}
	assert.True(s.T(), found, "Created campaign should be found in list")
}

func (s *CampaignAPIE2ETestSuite) TestSendCampaign_Success() {
	// キャンペーン送信の正常系テスト
	// 1. キャンペーンを作成
	createReq := &CreateCampaignRequest{
		Title:   "送信テストキャンペーン",
		Message: "送信テストメッセージ",
	}

	createResp, err := s.client.CreateCampaign(s.T(), createReq)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), createResp)

	// 2. キャンペーンを送信
	err = s.client.SendCampaign(s.T(), createResp.Campaign.ID)
	assert.NoError(s.T(), err)

	// 3. 送信後の状態を確認
	listResp, err := s.client.ListCampaigns(s.T())
	assert.NoError(s.T(), err)

	// 送信したキャンペーンのステータスが変更されていることを確認
	found := false
	for _, campaign := range listResp.Campaigns {
		if campaign.ID == createResp.Campaign.ID {
			found = true
			assert.Equal(s.T(), "sent", campaign.Status)
			assert.NotNil(s.T(), campaign.SentAt)
			break
		}
	}
	assert.True(s.T(), found, "Sent campaign should be found in list")
}

func (s *CampaignAPIE2ETestSuite) TestSendCampaign_InvalidID() {
	// 存在しないIDでのキャンペーン送信テスト
	err := s.client.SendCampaign(s.T(), "invalid-uuid")

	// アサーション
	assert.Error(s.T(), err)
	assert.Contains(s.T(), err.Error(), "INVALID_ID")
}

func (s *CampaignAPIE2ETestSuite) TestSendCampaign_NotFound() {
	// 存在しないキャンペーンの送信テスト
	err := s.client.SendCampaign(s.T(), "123e4567-e89b-12d3-a456-426614174000")

	// アサーション
	assert.Error(s.T(), err)
	assert.Contains(s.T(), err.Error(), "NOT_FOUND")
}

func (s *CampaignAPIE2ETestSuite) TestSendCampaign_AlreadySent() {
	// 既に送信済みのキャンペーンの再送信テスト
	// 1. キャンペーンを作成
	createReq := &CreateCampaignRequest{
		Title:   "再送信テストキャンペーン",
		Message: "再送信テストメッセージ",
	}

	createResp, err := s.client.CreateCampaign(s.T(), createReq)
	assert.NoError(s.T(), err)

	// 2. 初回送信
	err = s.client.SendCampaign(s.T(), createResp.Campaign.ID)
	assert.NoError(s.T(), err)

	// 3. 再送信を試行
	err = s.client.SendCampaign(s.T(), createResp.Campaign.ID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Contains(s.T(), err.Error(), "ALREADY_SENT")
}

func (s *CampaignAPIE2ETestSuite) TestCompleteWorkflow() {
	// 完全なワークフローのテスト（作成→一覧→送信→確認）
	campaigns := []CreateCampaignRequest{
		{Title: "ワークフローテスト1", Message: "メッセージ1"},
		{Title: "ワークフローテスト2", Message: "メッセージ2"},
		{Title: "ワークフローテスト3", Message: "メッセージ3"},
	}

	var createdIDs []string

	// 1. 複数のキャンペーンを作成
	for _, req := range campaigns {
		resp, err := s.client.CreateCampaign(s.T(), &req)
		assert.NoError(s.T(), err)
		assert.NotNil(s.T(), resp)
		createdIDs = append(createdIDs, resp.Campaign.ID)
	}

	// 2. 一覧で作成されたキャンペーンを確認
	listResp, err := s.client.ListCampaigns(s.T())
	assert.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(listResp.Campaigns), len(campaigns))

	// 3. 一部のキャンペーンを送信
	for i, id := range createdIDs {
		if i%2 == 0 { // 偶数番目のキャンペーンのみ送信
			err := s.client.SendCampaign(s.T(), id)
			assert.NoError(s.T(), err)
		}
	}

	// 4. 送信後の状態を確認
	finalListResp, err := s.client.ListCampaigns(s.T())
	assert.NoError(s.T(), err)

	sentCount := 0
	draftCount := 0
	for _, campaign := range finalListResp.Campaigns {
		for i, id := range createdIDs {
			if campaign.ID == id {
				if i%2 == 0 {
					assert.Equal(s.T(), "sent", campaign.Status)
					assert.NotNil(s.T(), campaign.SentAt)
					sentCount++
				} else {
					assert.Equal(s.T(), "draft", campaign.Status)
					assert.Nil(s.T(), campaign.SentAt)
					draftCount++
				}
			}
		}
	}

	// 送信されたキャンペーンとドラフトキャンペーンの数を確認
	expectedSent := (len(campaigns) + 1) / 2 // 偶数番目の数
	expectedDraft := len(campaigns) - expectedSent
	assert.Equal(s.T(), expectedSent, sentCount)
	assert.Equal(s.T(), expectedDraft, draftCount)
}

// テストスイートを実行するためのエントリーポイント
func TestCampaignAPIE2ETestSuite(t *testing.T) {
	// E2E_SKIP環境変数が設定されている場合はテストをスキップ
	if skipE2E := os.Getenv("E2E_SKIP"); skipE2E == "true" {
		t.Skip("E2E tests are disabled by E2E_SKIP environment variable")
	}

	suite.Run(t, new(CampaignAPIE2ETestSuite))
}
