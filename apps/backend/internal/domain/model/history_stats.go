package model

// HistoryStats 配信履歴統計情報
type HistoryStats struct {
	TotalMessages    int     `json:"totalMessages"`
	TotalRecipients  int     `json:"totalRecipients"`
	AverageOpenRate  float64 `json:"averageOpenRate"`
	AverageClickRate float64 `json:"averageClickRate"`
	LastSentDate     string  `json:"lastSentDate"`
}
