package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/infrastructure/auth"
)

// JWTMiddleware validates JWT tokens and sets user ID in context
func JWTMiddleware(jwtManager *auth.JWTManager) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Debug: log all cookies
			if c.Request().Header.Get("User-Agent") == "node" {
				c.Logger().Infof("[JWT] Server Component request - Cookie header: %s", c.Request().Header.Get("Cookie"))
			}

			// 1. Get access token from cookie
			tokenString, err := auth.GetAccessTokenFromCookie(c)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"error": "missing or invalid access token cookie",
				})
			}

			// 2. Validate JWT
			claims, err := jwtManager.ValidateToken(tokenString)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"error": "invalid token",
				})
			}

			// 3. Set user ID in context
			c.Set("userID", claims.UserID)

			// 4. Continue to next handler
			return next(c)
		}
	}
}
