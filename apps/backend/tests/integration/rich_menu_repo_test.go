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

type RichMenuRepositoryIntegrationTestSuite struct {
	suite.Suite
	testDB *TestDB
	repo   repository.RichMenuRepository
	ctx    context.Context
}

func (s *RichMenuRepositoryIntegrationTestSuite) SetupSuite() {
	s.testDB = SetupTestDB(s.T())
	dbWrapper := &db.DB{DB: s.testDB.DB}
	s.repo = pg.NewRichMenuRepository(dbWrapper)
	s.ctx = context.Background()
}

func (s *RichMenuRepositoryIntegrationTestSuite) TearDownSuite() {
	s.testDB.TeardownTestDB()
}

func (s *RichMenuRepositoryIntegrationTestSuite) SetupTest() {
	// 各テストの前にテーブルをクリア
	s.testDB.ClearRichMenus(s.T())
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestCreate_Success() {
	// テスト用のリッチメニューを作成
	userID := uuid.New()

	menu := &model.RichMenu{
		ID:          uuid.New(),
		UserID:      userID,
		Name:        "結合テストメニュー",
		ChatBarText: "タップしてメニューを開く",
		ImageURL:    "https://example.com/image.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: model.RichMenuAreas{
			{
				Bounds: model.RichMenuBounds{
					X:      0,
					Y:      0,
					Width:  1250,
					Height: 843,
				},
				Action: model.RichMenuAction{
					Type:  "uri",
					Label: "ホーム",
					URI:   "https://example.com",
				},
			},
			{
				Bounds: model.RichMenuBounds{
					X:      1250,
					Y:      0,
					Width:  1250,
					Height: 843,
				},
				Action: model.RichMenuAction{
					Type:  "message",
					Label: "お問い合わせ",
					Text:  "お問い合わせ",
				},
			},
		},
		IsActive:        false,
		IsPublishedLine: false,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// メニューを作成
	err := s.repo.Create(s.ctx, menu)

	// アサーション
	assert.NoError(s.T(), err)

	// データベースから取得して確認
	retrieved, err := s.repo.FindByID(s.ctx, menu.ID)
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), retrieved)
	assert.Equal(s.T(), menu.Name, retrieved.Name)
	assert.Equal(s.T(), menu.ChatBarText, retrieved.ChatBarText)
	assert.Equal(s.T(), menu.ImageURL, retrieved.ImageURL)
	assert.Equal(s.T(), menu.Size.Width, retrieved.Size.Width)
	assert.Equal(s.T(), menu.Size.Height, retrieved.Size.Height)
	assert.Len(s.T(), retrieved.Areas, 2)
	assert.False(s.T(), retrieved.IsActive)
	assert.False(s.T(), retrieved.IsPublishedLine)
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestFindByID_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	menuID := s.testDB.CreateTestRichMenu(s.T(), userID)
	uuid, err := uuid.Parse(menuID)
	assert.NoError(s.T(), err)

	// メニューを取得
	menu, err := s.repo.FindByID(s.ctx, uuid)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), menu)
	assert.Equal(s.T(), "テストメニュー", menu.Name)
	assert.Equal(s.T(), "タップしてください", menu.ChatBarText)
	assert.Equal(s.T(), "https://example.com/test.png", menu.ImageURL)
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestFindByID_NotFound() {
	// 存在しないIDで取得を試行
	nonExistentID := uuid.New()
	menu, err := s.repo.FindByID(s.ctx, nonExistentID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), menu)
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestFindByUserID_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	menuID := s.testDB.CreateTestRichMenu(s.T(), userID)
	assert.NotEmpty(s.T(), menuID)

	// 他のユーザーのメニューも作成（取得されないことを確認）
	otherUserID := uuid.New()
	s.testDB.CreateTestRichMenu(s.T(), otherUserID)

	// メニューを取得
	menu, err := s.repo.FindByUserID(s.ctx, userID)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), menu)
	assert.Equal(s.T(), userID, menu.UserID)
	assert.Equal(s.T(), "テストメニュー", menu.Name)
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestFindByUserID_NotFound() {
	// 存在しないユーザーIDで取得を試行
	nonExistentUserID := uuid.New()
	menu, err := s.repo.FindByUserID(s.ctx, nonExistentUserID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), menu)
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestUpdate_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	menuID := s.testDB.CreateTestRichMenu(s.T(), userID)
	uuid, err := uuid.Parse(menuID)
	assert.NoError(s.T(), err)

	// メニューを取得
	menu, err := s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)

	// データを更新
	menu.Name = "更新後メニュー"
	menu.ChatBarText = "新しいテキスト"
	menu.ImageURL = "https://example.com/updated.png"
	menu.Size = model.RichMenuSize{Width: 2500, Height: 843}
	menu.Areas = model.RichMenuAreas{
		{
			Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 2500, Height: 843},
			Action: model.RichMenuAction{Type: "uri", URI: "https://updated.com"},
		},
	}
	lineRichMenuID := "line-rich-menu-updated"
	menu.LineRichMenuID = &lineRichMenuID
	menu.IsActive = true
	menu.IsPublishedLine = true
	menu.UpdatedAt = time.Now()

	// 更新を実行
	err = s.repo.Update(s.ctx, menu)
	assert.NoError(s.T(), err)

	// 更新されたデータを取得して確認
	updated, err := s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)
	assert.Equal(s.T(), "更新後メニュー", updated.Name)
	assert.Equal(s.T(), "新しいテキスト", updated.ChatBarText)
	assert.Equal(s.T(), "https://example.com/updated.png", updated.ImageURL)
	assert.Equal(s.T(), 2500, updated.Size.Width)
	assert.Equal(s.T(), 843, updated.Size.Height)
	assert.Len(s.T(), updated.Areas, 1)
	assert.NotNil(s.T(), updated.LineRichMenuID)
	assert.Equal(s.T(), lineRichMenuID, *updated.LineRichMenuID)
	assert.True(s.T(), updated.IsActive)
	assert.True(s.T(), updated.IsPublishedLine)
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestDelete_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	menuID := s.testDB.CreateTestRichMenu(s.T(), userID)
	uuid, err := uuid.Parse(menuID)
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

func (s *RichMenuRepositoryIntegrationTestSuite) TestSetActive_Success() {
	// テスト用データを事前に作成
	userID := uuid.New()
	menuID := s.testDB.CreateTestRichMenu(s.T(), userID)
	uuid, err := uuid.Parse(menuID)
	assert.NoError(s.T(), err)

	// 初期状態確認（非アクティブ）
	menu, err := s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)
	assert.False(s.T(), menu.IsActive)

	// アクティブに設定
	err = s.repo.SetActive(s.ctx, uuid, true)
	assert.NoError(s.T(), err)

	// 確認
	menu, err = s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)
	assert.True(s.T(), menu.IsActive)

	// 非アクティブに設定
	err = s.repo.SetActive(s.ctx, uuid, false)
	assert.NoError(s.T(), err)

	// 確認
	menu, err = s.repo.FindByID(s.ctx, uuid)
	assert.NoError(s.T(), err)
	assert.False(s.T(), menu.IsActive)
}

func (s *RichMenuRepositoryIntegrationTestSuite) TestJSONBFields() {
	// PostgreSQL JSONB型の正しい処理を確認
	userID := uuid.New()

	menu := &model.RichMenu{
		ID:          uuid.New(),
		UserID:      userID,
		Name:        "JSONBテスト",
		ChatBarText: "タップ",
		ImageURL:    "https://example.com/jsonb.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: model.RichMenuAreas{
			{
				Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 833, Height: 843},
				Action: model.RichMenuAction{Type: "uri", Label: "エリア1", URI: "https://area1.com"},
			},
			{
				Bounds: model.RichMenuBounds{X: 833, Y: 0, Width: 834, Height: 843},
				Action: model.RichMenuAction{Type: "message", Label: "エリア2", Text: "メッセージ2"},
			},
			{
				Bounds: model.RichMenuBounds{X: 1667, Y: 0, Width: 833, Height: 843},
				Action: model.RichMenuAction{Type: "postback", Label: "エリア3", Data: "action=3"},
			},
		},
		IsActive:        false,
		IsPublishedLine: false,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	// 作成
	err := s.repo.Create(s.ctx, menu)
	assert.NoError(s.T(), err)

	// 取得して確認
	retrieved, err := s.repo.FindByID(s.ctx, menu.ID)
	assert.NoError(s.T(), err)

	// Size（JSONB）の確認
	assert.Equal(s.T(), 2500, retrieved.Size.Width)
	assert.Equal(s.T(), 1686, retrieved.Size.Height)

	// Areas（JSONB）の確認
	assert.Len(s.T(), retrieved.Areas, 3)
	assert.Equal(s.T(), 0, retrieved.Areas[0].Bounds.X)
	assert.Equal(s.T(), "uri", retrieved.Areas[0].Action.Type)
	assert.Equal(s.T(), "エリア1", retrieved.Areas[0].Action.Label)
	assert.Equal(s.T(), "https://area1.com", retrieved.Areas[0].Action.URI)

	assert.Equal(s.T(), 833, retrieved.Areas[1].Bounds.X)
	assert.Equal(s.T(), "message", retrieved.Areas[1].Action.Type)
	assert.Equal(s.T(), "メッセージ2", retrieved.Areas[1].Action.Text)

	assert.Equal(s.T(), 1667, retrieved.Areas[2].Bounds.X)
	assert.Equal(s.T(), "postback", retrieved.Areas[2].Action.Type)
	assert.Equal(s.T(), "action=3", retrieved.Areas[2].Action.Data)
}

// テストスイートを実行するためのエントリーポイント
func TestRichMenuRepositoryIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(RichMenuRepositoryIntegrationTestSuite))
}
