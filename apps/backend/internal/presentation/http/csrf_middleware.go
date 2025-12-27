package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// CSRFMiddleware validates CSRF token from cookie and header
func CSRFMiddleware() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Skip safe methods
			method := c.Request().Method
			if method == http.MethodGet ||
				method == http.MethodHead ||
				method == http.MethodOptions {
				return next(c)
			}

			// Get CSRF token from cookie
			csrfCookie, err := c.Cookie("csrf_token")
			if err != nil {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"error": "CSRF token missing",
				})
			}

			// Get CSRF token from header
			csrfHeader := c.Request().Header.Get("X-CSRF-Token")
			if csrfHeader == "" {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"error": "CSRF token header missing",
				})
			}

			// Compare tokens
			if csrfCookie.Value != csrfHeader {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"error": "CSRF token mismatch",
				})
			}

			return next(c)
		}
	}
}
