package http

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/infrastructure/auth"
)

// JWTMiddleware validates JWT tokens and sets user ID in context
func JWTMiddleware(jwtManager *auth.JWTManager) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// Debug: log all cookies from Server Components
			if c.Request().Header.Get("User-Agent") == "node" {
				fmt.Printf("[JWT DEBUG] Server Component request\n")
				fmt.Printf("[JWT DEBUG] Cookie header: %s\n", c.Request().Header.Get("Cookie"))
				fmt.Printf("[JWT DEBUG] All headers: %v\n", c.Request().Header)
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
