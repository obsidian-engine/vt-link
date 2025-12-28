package model

import (
	"time"

	"github.com/google/uuid"
)

type UserSettings struct {
	ID                  uuid.UUID `json:"id" db:"id"`
	UserID              uuid.UUID `json:"userId" db:"user_id"`
	DefaultReplyDelay   int       `json:"defaultReplyDelay" db:"default_reply_delay"`
	NotificationEnabled bool      `json:"notificationEnabled" db:"notification_enabled"`
	Timezone            string    `json:"timezone" db:"timezone"`
	Language            string    `json:"language" db:"language"`
	CreatedAt           time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt           time.Time `json:"updatedAt" db:"updated_at"`
}

// NewUserSettings 新しいUserSettingsを作成
func NewUserSettings(userID uuid.UUID) *UserSettings {
	now := time.Now()
	return &UserSettings{
		ID:                  uuid.New(),
		UserID:              userID,
		DefaultReplyDelay:   0,
		NotificationEnabled: true,
		Timezone:            "Asia/Tokyo",
		Language:            "ja",
		CreatedAt:           now,
		UpdatedAt:           now,
	}
}

// UpdateFields 設定のフィールドを更新
func (s *UserSettings) UpdateFields(defaultReplyDelay *int, notificationEnabled *bool, timezone *string, language *string) {
	if defaultReplyDelay != nil {
		s.DefaultReplyDelay = *defaultReplyDelay
	}
	if notificationEnabled != nil {
		s.NotificationEnabled = *notificationEnabled
	}
	if timezone != nil {
		s.Timezone = *timezone
	}
	if language != nil {
		s.Language = *language
	}
	s.UpdatedAt = time.Now()
}
