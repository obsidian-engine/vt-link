package errx

import (
	"fmt"
	"net/http"
)

type AppError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Status  int    `json:"-"`
}

func (e *AppError) Error() string {
	return fmt.Sprintf("[%s] %s", e.Code, e.Message)
}

// 一般的なエラー
var (
	ErrNotFound = &AppError{
		Code:    "NOT_FOUND",
		Message: "Resource not found",
		Status:  http.StatusNotFound,
	}

	ErrInvalidInput = &AppError{
		Code:    "INVALID_INPUT",
		Message: "Invalid input",
		Status:  http.StatusBadRequest,
	}

	ErrInternalServer = &AppError{
		Code:    "INTERNAL_SERVER_ERROR",
		Message: "Internal server error",
		Status:  http.StatusInternalServerError,
	}

	ErrUnauthorized = &AppError{
		Code:    "UNAUTHORIZED",
		Message: "Unauthorized",
		Status:  http.StatusUnauthorized,
	}
)

// NewAppError カスタムエラーを作成
func NewAppError(code, message string, status int) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
		Status:  status,
	}
}

// IsAppError AppErrorかどうかを判定
func IsAppError(err error) (*AppError, bool) {
	if appErr, ok := err.(*AppError); ok {
		return appErr, true
	}
	return nil, false
}