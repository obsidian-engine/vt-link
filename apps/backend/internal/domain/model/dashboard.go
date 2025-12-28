package model

// DashboardStats ダッシュボード統計情報
type DashboardStats struct {
	FriendCount    int     `json:"friendCount"`
	SendCount      int     `json:"sendCount"`
	SendLimit      int     `json:"sendLimit"`
	AverageCTR     float64 `json:"averageCtr"`
	MonthlyRevenue int     `json:"monthlyRevenue"`
}
