package model

import (
	"time"

	"github.com/google/uuid"
)

// User ユーザー
type User struct {
	ID          uuid.UUID `db:"id"`
	LineUserID  string    `db:"line_user_id"`
	DisplayName string    `db:"display_name"`
	PictureURL  string    `db:"picture_url"`
	Email       string    `db:"email"`
	CreatedAt   time.Time `db:"created_at"`
	UpdatedAt   time.Time `db:"updated_at"`
}
