package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

// RichMenuSize リッチメニューのサイズ
type RichMenuSize struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

// Value Scannerインターフェース実装
func (s RichMenuSize) Value() (driver.Value, error) {
	return json.Marshal(s)
}

func (s *RichMenuSize) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, s)
}

// RichMenuBounds エリアの座標
type RichMenuBounds struct {
	X      int `json:"x"`
	Y      int `json:"y"`
	Width  int `json:"width"`
	Height int `json:"height"`
}

// RichMenuAction エリアのアクション
type RichMenuAction struct {
	Type  string `json:"type"`  // "uri", "message", "postback"
	Label string `json:"label,omitempty"`
	URI   string `json:"uri,omitempty"`
	Text  string `json:"text,omitempty"`
	Data  string `json:"data,omitempty"`
}

// RichMenuArea リッチメニューのエリア
type RichMenuArea struct {
	Bounds RichMenuBounds `json:"bounds"`
	Action RichMenuAction `json:"action"`
}

// RichMenuAreas エリアの配列（DB保存用）
type RichMenuAreas []RichMenuArea

// Value Scannerインターフェース実装
func (a RichMenuAreas) Value() (driver.Value, error) {
	return json.Marshal(a)
}

func (a *RichMenuAreas) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(b, a)
}

// RichMenu リッチメニューのドメインモデル
type RichMenu struct {
	ID              uuid.UUID     `json:"id" db:"id"`
	UserID          uuid.UUID     `json:"userId" db:"user_id"`
	LineRichMenuID  *string       `json:"lineRichMenuId,omitempty" db:"line_rich_menu_id"`
	Name            string        `json:"name" db:"name"`
	ChatBarText     string        `json:"chatBarText" db:"chat_bar_text"`
	ImageURL        string        `json:"imageUrl" db:"image_url"`
	Size            RichMenuSize  `json:"size" db:"size"`
	Areas           RichMenuAreas `json:"areas" db:"areas"`
	IsActive        bool          `json:"isActive" db:"is_active"`
	IsPublishedLine bool          `json:"isPublishedLine" db:"is_published_line"`
	CreatedAt       time.Time     `json:"createdAt" db:"created_at"`
	UpdatedAt       time.Time     `json:"updatedAt" db:"updated_at"`
}

// NewRichMenu 新しいRichMenuを作成
func NewRichMenu(userID uuid.UUID, name, chatBarText, imageURL string, size RichMenuSize, areas RichMenuAreas) *RichMenu {
	now := time.Now()
	return &RichMenu{
		ID:              uuid.New(),
		UserID:          userID,
		LineRichMenuID:  nil,
		Name:            name,
		ChatBarText:     chatBarText,
		ImageURL:        imageURL,
		Size:            size,
		Areas:           areas,
		IsActive:        false,
		IsPublishedLine: false,
		CreatedAt:       now,
		UpdatedAt:       now,
	}
}

// UpdateFields リッチメニューのフィールドを更新
func (r *RichMenu) UpdateFields(name *string, chatBarText *string, imageURL *string, size *RichMenuSize, areas *RichMenuAreas) {
	if name != nil {
		r.Name = *name
	}
	if chatBarText != nil {
		r.ChatBarText = *chatBarText
	}
	if imageURL != nil {
		r.ImageURL = *imageURL
	}
	if size != nil {
		r.Size = *size
	}
	if areas != nil {
		r.Areas = *areas
	}
	r.UpdatedAt = time.Now()
}

// SetLineRichMenuID LINE APIから返されたIDを設定
func (r *RichMenu) SetLineRichMenuID(lineRichMenuID string) {
	r.LineRichMenuID = &lineRichMenuID
	r.UpdatedAt = time.Now()
}

// SetPublished LINE公開状態を設定
func (r *RichMenu) SetPublished(published bool) {
	r.IsPublishedLine = published
	r.UpdatedAt = time.Now()
}

// Activate アクティブ化
func (r *RichMenu) Activate() {
	r.IsActive = true
	r.UpdatedAt = time.Now()
}

// Deactivate 非アクティブ化
func (r *RichMenu) Deactivate() {
	r.IsActive = false
	r.UpdatedAt = time.Now()
}
