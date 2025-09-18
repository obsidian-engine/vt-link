package http

import (
	"encoding/json"
	"net/http"

	"vt-link/backend/internal/shared/errx"
)

type Response struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// WriteJSON JSON形式でレスポンスを書き込み
func WriteJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := Response{
		Success: statusCode < 400,
		Data:    data,
	}

	json.NewEncoder(w).Encode(response)
}

// WriteError エラーレスポンスを書き込み
func WriteError(w http.ResponseWriter, err error) {
	w.Header().Set("Content-Type", "application/json")

	if appErr, ok := errx.IsAppError(err); ok {
		w.WriteHeader(appErr.Status)
		response := Response{
			Success: false,
			Error: &ErrorInfo{
				Code:    appErr.Code,
				Message: appErr.Message,
			},
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// 未知のエラー
	w.WriteHeader(http.StatusInternalServerError)
	response := Response{
		Success: false,
		Error: &ErrorInfo{
			Code:    "INTERNAL_SERVER_ERROR",
			Message: "Internal server error",
		},
	}
	json.NewEncoder(w).Encode(response)
}

// ParseJSON リクエストボディをJSONとしてパース
func ParseJSON(r *http.Request, v interface{}) error {
	defer r.Body.Close()
	return json.NewDecoder(r.Body).Decode(v)
}

// SetCORS CORS헤더を設定
func SetCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}