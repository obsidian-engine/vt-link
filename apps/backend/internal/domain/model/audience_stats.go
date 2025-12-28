package model

// AudienceStats オーディエンス統計情報
type AudienceStats struct {
	TotalFans       int     `json:"totalFans"`
	ActiveFans      int     `json:"activeFans"`
	NewFansThisWeek int     `json:"newFansThisWeek"`
	BlockedFans     int     `json:"blockedFans"`
	EngagementRate  float64 `json:"engagementRate"`
}
