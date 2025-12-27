package http

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"vt-link/backend/internal/infrastructure/auth"
)

type Router struct {
	echo        *echo.Echo
	authHandler *AuthHandler
	jwtManager  *auth.JWTManager
}

func NewRouter(authHandler *AuthHandler, jwtManager *auth.JWTManager) *Router {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	return &Router{
		echo:        e,
		authHandler: authHandler,
		jwtManager:  jwtManager,
	}
}

func (r *Router) Setup() *echo.Echo {
	// Public routes
	r.echo.GET("/health", r.healthCheck)

	// Auth routes (public)
	auth := r.echo.Group("/auth")
	auth.POST("/login", r.authHandler.Login)
	auth.POST("/logout", r.authHandler.Logout)
	auth.POST("/refresh", r.authHandler.Refresh)

	// Protected auth routes
	authProtected := r.echo.Group("/auth")
	authProtected.Use(JWTMiddleware(r.jwtManager))
	authProtected.GET("/me", r.authHandler.Me)

	// Protected API routes
	api := r.echo.Group("/api")
	api.Use(JWTMiddleware(r.jwtManager))
	// TODO: Add message routes here
	// api.POST("/messages", messageHandler.Create)
	// api.GET("/messages", messageHandler.List)
	// etc.

	return r.echo
}

func (r *Router) healthCheck(c echo.Context) error {
	return c.JSON(200, map[string]interface{}{
		"status": "ok",
	})
}

func (r *Router) Start(address string) error {
	return r.echo.Start(address)
}
