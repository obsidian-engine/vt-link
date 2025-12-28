package model

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Fan struct {
	ID                 uuid.UUID      `json:"id" db:"id"`
	UserID             uuid.UUID      `json:"userId" db:"user_id"`
	LineUserID         string         `json:"lineUserId" db:"line_user_id"`
	DisplayName        *string        `json:"displayName" db:"display_name"`
	PictureURL         *string        `json:"pictureUrl" db:"picture_url"`
	FollowedAt         time.Time      `json:"followedAt" db:"followed_at"`
	LastInteractionAt  *time.Time     `json:"lastInteractionAt" db:"last_interaction_at"`
	IsBlocked          bool           `json:"isBlocked" db:"is_blocked"`
	Tags               pq.StringArray `json:"tags" db:"tags"`
	CreatedAt          time.Time      `json:"createdAt" db:"created_at"`
	UpdatedAt          time.Time      `json:"updatedAt" db:"updated_at"`
}

// NewFan 新しいFanを作成
func NewFan(userID uuid.UUID, lineUserID string, displayName *string, pictureURL *string) *Fan {
	now := time.Now()
	return &Fan{
		ID:          uuid.New(),
		UserID:      userID,
		LineUserID:  lineUserID,
		DisplayName: displayName,
		PictureURL:  pictureURL,
		FollowedAt:  now,
		IsBlocked:   false,
		Tags:        []string{},
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// UpdateProfile ファンのプロフィール情報を更新
func (f *Fan) UpdateProfile(displayName *string, pictureURL *string) {
	if displayName != nil {
		f.DisplayName = displayName
	}
	if pictureURL != nil {
		f.PictureURL = pictureURL
	}
	f.UpdatedAt = time.Now()
}

// UpdateInteraction 最終インタラクション日時を更新
func (f *Fan) UpdateInteraction() {
	now := time.Now()
	f.LastInteractionAt = &now
	f.UpdatedAt = now
}

// Block ファンをブロック
func (f *Fan) Block() {
	f.IsBlocked = true
	f.UpdatedAt = time.Now()
}

// Unblock ファンのブロックを解除
func (f *Fan) Unblock() {
	f.IsBlocked = false
	f.UpdatedAt = time.Now()
}

// UpdateTags タグを更新
func (f *Fan) UpdateTags(tags []string) {
	f.Tags = tags
	f.UpdatedAt = time.Now()
}
