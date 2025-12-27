package http

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"vt-link/backend/internal/infrastructure/auth"
)

// JWTMiddleware validates JWT tokens and sets user ID in context
func JWTMiddleware(jwtManager *auth.JWTManager) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			// 1. Get Authorization header
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"error": "missing authorization header",
				})
			}

			// 2. Extract Bearer token
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"error": "invalid authorization header format",
				})
			}

			tokenString := parts[1]

			// 3. Validate JWT
			claims, err := jwtManager.ValidateToken(tokenString)
			if err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]interface{}{
					"error": "invalid token",
				})
			}

			// 4. Set user ID in context
			c.Set("userID", claims.UserID)

			// 5. Continue to next handler
			return next(c)
		}
	}
}
