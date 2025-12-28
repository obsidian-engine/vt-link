package unit

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"go.uber.org/mock/gomock"

	"vt-link/backend/internal/application/richmenu"
	richMenuMocks "vt-link/backend/internal/application/richmenu/mocks"
	"vt-link/backend/internal/domain/model"
	repoMocks "vt-link/backend/internal/domain/repository/mocks"
	"vt-link/backend/internal/shared/errx"
)

type RichMenuInteractorTestSuite struct {
	suite.Suite
	interactor      richmenu.Usecase
	mockRepo        *repoMocks.MockRichMenuRepository
	mockLineService *richMenuMocks.MockLineRichMenuService
	ctx             context.Context
	ctrl            *gomock.Controller
}

func (s *RichMenuInteractorTestSuite) SetupTest() {
	s.ctrl = gomock.NewController(s.T())
	s.mockRepo = repoMocks.NewMockRichMenuRepository(s.ctrl)
	s.mockLineService = richMenuMocks.NewMockLineRichMenuService(s.ctrl)
	s.ctx = context.Background()

	s.interactor = richmenu.NewInteractor(s.mockRepo, s.mockLineService)
}

func (s *RichMenuInteractorTestSuite) TearDownTest() {
	s.ctrl.Finish()
}

func (s *RichMenuInteractorTestSuite) TestCreateRichMenu_Success() {
	// 正常なリッチメニュー作成のテスト
	userID := uuid.New()
	input := &richmenu.CreateRichMenuInput{
		UserID:      userID,
		Name:        "テストメニュー",
		ChatBarText: "タップしてメニューを開く",
		ImageURL:    "https://example.com/image.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: []model.RichMenuArea{
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
		},
	}

	// 既存メニューがない場合
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(nil, errx.ErrNotFound)
	s.mockRepo.EXPECT().Create(s.ctx, gomock.Any()).Return(nil)

	// テスト実行
	output, err := s.interactor.CreateRichMenu(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), input.Name, output.Name)
	assert.Equal(s.T(), input.ChatBarText, output.ChatBarText)
	assert.Equal(s.T(), input.ImageURL, output.ImageURL)
	assert.False(s.T(), output.IsActive)
	assert.False(s.T(), output.IsPublishedLine)
}

func (s *RichMenuInteractorTestSuite) TestCreateRichMenu_ExistingMenuDeleted() {
	// 既存メニューがある場合、削除されてから新規作成されるテスト
	userID := uuid.New()
	existingMenuID := uuid.New()
	existingMenu := &model.RichMenu{
		ID:     existingMenuID,
		UserID: userID,
		Name:   "既存メニュー",
	}

	input := &richmenu.CreateRichMenuInput{
		UserID:      userID,
		Name:        "新規メニュー",
		ChatBarText: "タップ",
		ImageURL:    "https://example.com/new.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: []model.RichMenuArea{
			{
				Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 1250, Height: 843},
				Action: model.RichMenuAction{Type: "uri", URI: "https://example.com"},
			},
		},
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(existingMenu, nil)
	s.mockRepo.EXPECT().Delete(s.ctx, existingMenuID).Return(nil)
	s.mockRepo.EXPECT().Create(s.ctx, gomock.Any()).Return(nil)

	// テスト実行
	output, err := s.interactor.CreateRichMenu(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), input.Name, output.Name)
}

func (s *RichMenuInteractorTestSuite) TestCreateRichMenu_EmptyName() {
	// 空の名前でのメニュー作成テスト
	userID := uuid.New()
	input := &richmenu.CreateRichMenuInput{
		UserID:      userID,
		Name:        "",
		ChatBarText: "タップ",
		ImageURL:    "https://example.com/image.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: []model.RichMenuArea{
			{
				Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 1250, Height: 843},
				Action: model.RichMenuAction{Type: "uri", URI: "https://example.com"},
			},
		},
	}

	// テスト実行
	output, err := s.interactor.CreateRichMenu(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)
	assert.Equal(s.T(), errx.ErrInvalidInput, err)
}

func (s *RichMenuInteractorTestSuite) TestCreateRichMenu_AreasExceedMax() {
	// Areas数が上限（6個）を超えるテスト
	userID := uuid.New()
	areas := make([]model.RichMenuArea, 7) // 7個 > MaxRichMenuAreas(6)
	for i := range areas {
		areas[i] = model.RichMenuArea{
			Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 100, Height: 100},
			Action: model.RichMenuAction{Type: "uri", URI: "https://example.com"},
		}
	}

	input := &richmenu.CreateRichMenuInput{
		UserID:      userID,
		Name:        "テストメニュー",
		ChatBarText: "タップ",
		ImageURL:    "https://example.com/image.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: areas,
	}

	// テスト実行
	output, err := s.interactor.CreateRichMenu(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)
	if appErr, ok := err.(*errx.AppError); ok {
		assert.Equal(s.T(), "INVALID_INPUT", appErr.Code)
	}
}

func (s *RichMenuInteractorTestSuite) TestGetRichMenu_Success() {
	// メニュー取得の正常テスト
	userID := uuid.New()
	expectedMenu := &model.RichMenu{
		ID:          uuid.New(),
		UserID:      userID,
		Name:        "テストメニュー",
		ChatBarText: "タップ",
		ImageURL:    "https://example.com/image.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: model.RichMenuAreas{
			{
				Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 1250, Height: 843},
				Action: model.RichMenuAction{Type: "uri", URI: "https://example.com"},
			},
		},
		IsActive:        true,
		IsPublishedLine: true,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(expectedMenu, nil)

	// テスト実行
	menu, err := s.interactor.GetRichMenu(s.ctx, userID)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), menu)
	assert.Equal(s.T(), expectedMenu.Name, menu.Name)
	assert.Equal(s.T(), expectedMenu.IsActive, menu.IsActive)
}

func (s *RichMenuInteractorTestSuite) TestGetRichMenu_NotFound() {
	// メニュー取得失敗のテスト
	userID := uuid.New()

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByUserID(s.ctx, userID).Return(nil, errx.ErrNotFound)

	// テスト実行
	menu, err := s.interactor.GetRichMenu(s.ctx, userID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), menu)
	assert.Equal(s.T(), errx.ErrNotFound, err)
}

func (s *RichMenuInteractorTestSuite) TestUpdateRichMenu_Success() {
	// メニュー更新の正常テスト
	menuID := uuid.New()
	userID := uuid.New()

	existingMenu := &model.RichMenu{
		ID:          menuID,
		UserID:      userID,
		Name:        "更新前",
		ChatBarText: "古いテキスト",
		ImageURL:    "https://example.com/old.png",
		Size: model.RichMenuSize{
			Width:  2500,
			Height: 1686,
		},
		Areas: model.RichMenuAreas{
			{
				Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 1250, Height: 843},
				Action: model.RichMenuAction{Type: "uri", URI: "https://old.com"},
			},
		},
	}

	newName := "更新後"
	newChatBarText := "新しいテキスト"
	newAreas := []model.RichMenuArea{
		{
			Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 1250, Height: 843},
			Action: model.RichMenuAction{Type: "uri", URI: "https://new.com"},
		},
		{
			Bounds: model.RichMenuBounds{X: 1250, Y: 0, Width: 1250, Height: 843},
			Action: model.RichMenuAction{Type: "message", Text: "メッセージ"},
		},
	}

	input := &richmenu.UpdateRichMenuInput{
		ID:          menuID,
		Name:        &newName,
		ChatBarText: &newChatBarText,
		Areas:       &newAreas,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, menuID).Return(existingMenu, nil)
	s.mockRepo.EXPECT().Update(s.ctx, gomock.Cond(func(m any) bool {
		menu, ok := m.(*model.RichMenu)
		return ok &&
			menu.ID == menuID &&
			menu.Name == newName &&
			menu.ChatBarText == newChatBarText &&
			len(menu.Areas) == 2
	})).Return(nil)

	// テスト実行
	output, err := s.interactor.UpdateRichMenu(s.ctx, input)

	// アサーション
	assert.NoError(s.T(), err)
	assert.NotNil(s.T(), output)
	assert.Equal(s.T(), newName, output.Name)
	assert.Equal(s.T(), newChatBarText, output.ChatBarText)
}

func (s *RichMenuInteractorTestSuite) TestUpdateRichMenu_NotFound() {
	// 存在しないメニューの更新テスト
	menuID := uuid.New()
	input := &richmenu.UpdateRichMenuInput{
		ID: menuID,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, menuID).Return(nil, errx.ErrNotFound)

	// テスト実行
	output, err := s.interactor.UpdateRichMenu(s.ctx, input)

	// アサーション
	assert.Error(s.T(), err)
	assert.Nil(s.T(), output)
	assert.Equal(s.T(), errx.ErrNotFound, err)
}

func (s *RichMenuInteractorTestSuite) TestDeleteRichMenu_Success() {
	// メニュー削除の正常テスト
	menuID := uuid.New()
	lineRichMenuID := "line-rich-menu-123"

	menu := &model.RichMenu{
		ID:             menuID,
		LineRichMenuID: &lineRichMenuID,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, menuID).Return(menu, nil)
	s.mockLineService.EXPECT().DeleteRichMenu(s.ctx, lineRichMenuID).Return(nil)
	s.mockRepo.EXPECT().Delete(s.ctx, menuID).Return(nil)

	// テスト実行
	err := s.interactor.DeleteRichMenu(s.ctx, menuID)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *RichMenuInteractorTestSuite) TestDeleteRichMenu_NotPublishedToLINE() {
	// LINEに公開されていないメニューの削除テスト
	menuID := uuid.New()

	menu := &model.RichMenu{
		ID:             menuID,
		LineRichMenuID: nil, // LINEに未公開
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, menuID).Return(menu, nil)
	// DeleteRichMenuは呼ばれない
	s.mockRepo.EXPECT().Delete(s.ctx, menuID).Return(nil)

	// テスト実行
	err := s.interactor.DeleteRichMenu(s.ctx, menuID)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *RichMenuInteractorTestSuite) TestPublishToLINE_Success() {
	// LINE公開の正常テスト
	menuID := uuid.New()
	lineRichMenuID := "line-rich-menu-456"

	menu := &model.RichMenu{
		ID:              menuID,
		Name:            "公開テスト",
		ChatBarText:     "タップ",
		ImageURL:        "https://example.com/image.png",
		Size:            model.RichMenuSize{Width: 2500, Height: 1686},
		Areas:           model.RichMenuAreas{{Bounds: model.RichMenuBounds{X: 0, Y: 0, Width: 1250, Height: 843}, Action: model.RichMenuAction{Type: "uri", URI: "https://example.com"}}},
		IsPublishedLine: false,
	}

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, menuID).Return(menu, nil)
	s.mockLineService.EXPECT().CreateRichMenu(s.ctx, menu).Return(lineRichMenuID, nil)
	s.mockLineService.EXPECT().SetDefault(s.ctx, lineRichMenuID).Return(nil)
	s.mockRepo.EXPECT().Update(s.ctx, gomock.Cond(func(m any) bool {
		menu, ok := m.(*model.RichMenu)
		return ok &&
			menu.ID == menuID &&
			menu.LineRichMenuID != nil &&
			*menu.LineRichMenuID == lineRichMenuID &&
			menu.IsPublishedLine &&
			menu.IsActive
	})).Return(nil)

	// テスト実行
	err := s.interactor.PublishToLINE(s.ctx, menuID)

	// アサーション
	assert.NoError(s.T(), err)
}

func (s *RichMenuInteractorTestSuite) TestPublishToLINE_NotFound() {
	// 存在しないメニューの公開テスト
	menuID := uuid.New()

	// Mockの期待値を設定
	s.mockRepo.EXPECT().FindByID(s.ctx, menuID).Return(nil, errx.ErrNotFound)

	// テスト実行
	err := s.interactor.PublishToLINE(s.ctx, menuID)

	// アサーション
	assert.Error(s.T(), err)
	assert.Equal(s.T(), errx.ErrNotFound, err)
}

// テストスイートを実行するためのエントリーポイント
func TestRichMenuInteractorTestSuite(t *testing.T) {
	suite.Run(t, new(RichMenuInteractorTestSuite))
}
