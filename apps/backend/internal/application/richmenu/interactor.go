package richmenu

//go:generate mockgen -source=$GOFILE -destination=mocks/mock_$GOFILE -package=mocks

import (
	"context"
	"fmt"
	"log"

	"github.com/google/uuid"
	"vt-link/backend/internal/domain/model"
	"vt-link/backend/internal/domain/repository"
	"vt-link/backend/internal/shared/errx"
)

const MaxRichMenuAreas = 6

type Interactor struct {
	richMenuRepo        repository.RichMenuRepository
	lineRichMenuService LineRichMenuService
}

// LineRichMenuService LINE Rich Menu API操作のインターフェース
type LineRichMenuService interface {
	CreateRichMenu(ctx context.Context, menu *model.RichMenu) (string, error)
	UploadImage(ctx context.Context, richMenuID string, imageData []byte) error
	SetDefault(ctx context.Context, richMenuID string) error
	DeleteRichMenu(ctx context.Context, richMenuID string) error
}

func NewInteractor(
	richMenuRepo repository.RichMenuRepository,
	lineRichMenuService LineRichMenuService,
) Usecase {
	return &Interactor{
		richMenuRepo:        richMenuRepo,
		lineRichMenuService: lineRichMenuService,
	}
}

func (i *Interactor) CreateRichMenu(ctx context.Context, input *CreateRichMenuInput) (*model.RichMenu, error) {
	// バリデーション
	if input.Name == "" || input.ImageURL == "" || input.ChatBarText == "" {
		return nil, errx.ErrInvalidInput
	}

	if len(input.Areas) == 0 || len(input.Areas) > MaxRichMenuAreas {
		return nil, errx.NewAppError("INVALID_INPUT", fmt.Sprintf("Areas must be between 1 and %d", MaxRichMenuAreas), 400)
	}

	// 1アカウント1メニュー制約：既存メニューがあれば削除
	existingMenu, err := i.richMenuRepo.FindByUserID(ctx, input.UserID)
	if err == nil && existingMenu != nil {
		log.Printf("Deleting existing rich menu for user: %s", input.UserID)
		if err := i.richMenuRepo.Delete(ctx, existingMenu.ID); err != nil {
			log.Printf("Failed to delete existing rich menu: %v", err)
		}
	}

	// 新しいメニューを作成
	menu := model.NewRichMenu(
		input.UserID,
		input.Name,
		input.ChatBarText,
		input.ImageURL,
		input.Size,
		input.Areas,
	)

	err = i.richMenuRepo.Create(ctx, menu)
	if err != nil {
		log.Printf("Failed to create rich menu: %v", err)
		return nil, errx.ErrInternalServer
	}

	return menu, nil
}

func (i *Interactor) GetRichMenu(ctx context.Context, userID uuid.UUID) (*model.RichMenu, error) {
	menu, err := i.richMenuRepo.FindByUserID(ctx, userID)
	if err != nil {
		log.Printf("Failed to get rich menu: %v", err)
		return nil, errx.ErrNotFound
	}

	return menu, nil
}

func (i *Interactor) UpdateRichMenu(ctx context.Context, input *UpdateRichMenuInput) (*model.RichMenu, error) {
	// 既存メニューを取得
	menu, err := i.richMenuRepo.FindByID(ctx, input.ID)
	if err != nil {
		log.Printf("Failed to find rich menu for update: %v", err)
		return nil, errx.ErrNotFound
	}

	// Areas更新時のバリデーション
	if input.Areas != nil {
		if len(*input.Areas) == 0 || len(*input.Areas) > MaxRichMenuAreas {
			return nil, errx.NewAppError("INVALID_INPUT", fmt.Sprintf("Areas must be between 1 and %d", MaxRichMenuAreas), 400)
		}
	}

	// フィールド更新（型変換が必要）
	var areas *model.RichMenuAreas
	if input.Areas != nil {
		areasValue := model.RichMenuAreas(*input.Areas)
		areas = &areasValue
	}
	menu.UpdateFields(input.Name, input.ChatBarText, input.ImageURL, input.Size, areas)

	err = i.richMenuRepo.Update(ctx, menu)
	if err != nil {
		log.Printf("Failed to update rich menu: %v", err)
		return nil, errx.ErrInternalServer
	}

	return menu, nil
}

func (i *Interactor) DeleteRichMenu(ctx context.Context, id uuid.UUID) error {
	// メニュー取得
	menu, err := i.richMenuRepo.FindByID(ctx, id)
	if err != nil {
		log.Printf("Failed to find rich menu for deletion: %v", err)
		return errx.ErrNotFound
	}

	// LINEからも削除
	if menu.LineRichMenuID != nil {
		err = i.lineRichMenuService.DeleteRichMenu(ctx, *menu.LineRichMenuID)
		if err != nil {
			log.Printf("Failed to delete rich menu from LINE: %v", err)
			// LINEからの削除失敗してもDBからは削除する
		}
	}

	// DBから削除
	err = i.richMenuRepo.Delete(ctx, id)
	if err != nil {
		log.Printf("Failed to delete rich menu: %v", err)
		return errx.ErrNotFound
	}

	return nil
}

func (i *Interactor) PublishToLINE(ctx context.Context, id uuid.UUID) error {
	// メニュー取得
	menu, err := i.richMenuRepo.FindByID(ctx, id)
	if err != nil {
		log.Printf("Failed to find rich menu for publishing: %v", err)
		return errx.ErrNotFound
	}

	// LINE Rich Menu APIに登録
	lineRichMenuID, err := i.lineRichMenuService.CreateRichMenu(ctx, menu)
	if err != nil {
		log.Printf("Failed to create rich menu on LINE: %v", err)
		return errx.ErrInternalServer
	}

	// 画像をアップロード（URLからダウンロード）
	// TODO: 画像URLから画像データを取得してアップロード
	// imageData, err := downloadImage(menu.ImageURL)
	// if err != nil {
	//     log.Printf("Failed to download image: %v", err)
	//     return errx.ErrInternalServer
	// }
	// err = i.lineRichMenuService.UploadImage(ctx, lineRichMenuID, imageData)
	// if err != nil {
	//     log.Printf("Failed to upload image to LINE: %v", err)
	//     return errx.ErrInternalServer
	// }

	// デフォルトメニューとして設定
	err = i.lineRichMenuService.SetDefault(ctx, lineRichMenuID)
	if err != nil {
		log.Printf("Failed to set default rich menu: %v", err)
		return errx.ErrInternalServer
	}

	// LINE IDを保存して公開状態を更新
	menu.SetLineRichMenuID(lineRichMenuID)
	menu.SetPublished(true)
	menu.Activate()

	err = i.richMenuRepo.Update(ctx, menu)
	if err != nil {
		log.Printf("Failed to update rich menu with LINE ID: %v", err)
		return errx.ErrInternalServer
	}

	return nil
}
