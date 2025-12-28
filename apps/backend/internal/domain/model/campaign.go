package model

import "time"

// Campaign キャンペーン情報
type Campaign struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	SentCount int       `json:"sentCount"`
	CTR       float64   `json:"ctr"`
	CVR       float64   `json:"cvr"`
	Status    string    `json:"status"` // "active", "ended", "paused"
	CreatedAt time.Time `json:"createdAt"`
}
