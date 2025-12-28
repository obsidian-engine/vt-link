package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
)

const (
	accessTokenCookieName  = "access_token"
	refreshTokenCookieName = "refresh_token"
	csrfTokenCookieName    = "csrf_token"
)

// SetAccessTokenCookie sets the access token as an HTTP-only cookie
func SetAccessTokenCookie(c echo.Context, token string) {
	cookie := &http.Cookie{
		Name:     accessTokenCookieName,
		Value:    token,
		MaxAge:   3600, // 1 hour
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   os.Getenv("APP_ENV") == "production",
	}
	c.SetCookie(cookie)
}

// SetRefreshTokenCookie sets the refresh token as an HTTP-only cookie
func SetRefreshTokenCookie(c echo.Context, token string) {
	cookie := &http.Cookie{
		Name:     refreshTokenCookieName,
		Value:    token,
		MaxAge:   30 * 24 * 3600, // 30 days
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   os.Getenv("APP_ENV") == "production",
	}
	c.SetCookie(cookie)
}

// SetCSRFTokenCookie sets the CSRF token as a cookie (not HTTP-only for JS access)
func SetCSRFTokenCookie(c echo.Context, token string) {
	cookie := &http.Cookie{
		Name:     csrfTokenCookieName,
		Value:    token,
		MaxAge:   0, // Session cookie
		Path:     "/",
		HttpOnly: false, // JS needs to read this
		SameSite: http.SameSiteLaxMode,
		Secure:   os.Getenv("APP_ENV") == "production",
	}
	c.SetCookie(cookie)
}

// ClearAuthCookies clears all authentication cookies
func ClearAuthCookies(c echo.Context) {
	cookies := []struct {
		name string
		path string
	}{
		{accessTokenCookieName, "/"},
		{refreshTokenCookieName, "/"},
		{csrfTokenCookieName, "/"},
	}

	for _, cookie := range cookies {
		c.SetCookie(&http.Cookie{
			Name:     cookie.name,
			Value:    "",
			MaxAge:   -1,
			Path:     cookie.path,
			HttpOnly: true,
		})
	}
}

// GenerateCSRFToken generates a cryptographically secure CSRF token
func GenerateCSRFToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", fmt.Errorf("failed to generate CSRF token: %w", err)
	}
	return hex.EncodeToString(bytes), nil
}

// GetAccessTokenFromCookie retrieves the access token from the cookie
func GetAccessTokenFromCookie(c echo.Context) (string, error) {
	// Debug: log for Server Component requests
	if c.Request().Header.Get("User-Agent") == "node" {
		fmt.Printf("[GetAccessToken] Attempting to get cookie: %s
", accessTokenCookieName)
	}
	
	cookie, err := c.Cookie(accessTokenCookieName)
	if err != nil {
		// Debug: log error for Server Component requests
		if c.Request().Header.Get("User-Agent") == "node" {
			fmt.Printf("[GetAccessToken] ERROR: %v
", err)
			fmt.Printf("[GetAccessToken] Raw Cookie header: %s
", c.Request().Header.Get("Cookie"))
		}
		return "", fmt.Errorf("access token cookie not found: %w", err)
	}
	
	// Debug: log success for Server Component requests
	if c.Request().Header.Get("User-Agent") == "node" {
		fmt.Printf("[GetAccessToken] SUCCESS: got token (length: %d)
", len(cookie.Value))
	}
	
	return cookie.Value, nil
}

// GetRefreshTokenFromCookie retrieves the refresh token from the cookie
func GetRefreshTokenFromCookie(c echo.Context) (string, error) {
	cookie, err := c.Cookie(refreshTokenCookieName)
	if err != nil {
		return "", fmt.Errorf("refresh token cookie not found: %w", err)
	}
	return cookie.Value, nil
}
