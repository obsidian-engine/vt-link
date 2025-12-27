package http

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"vt-link/backend/internal/infrastructure/auth"
)

type Router struct {
	echo             *echo.Echo
	authHandler      *AuthHandler
	autoReplyHandler *AutoReplyHandler
	richMenuHandler  *RichMenuHandler
	jwtManager       *auth.JWTManager
}

func NewRouter(authHandler *AuthHandler, autoReplyHandler *AutoReplyHandler, richMenuHandler *RichMenuHandler, jwtManager *auth.JWTManager) *Router {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	return &Router{
		echo:             e,
		authHandler:      authHandler,
		autoReplyHandler: autoReplyHandler,
		richMenuHandler:  richMenuHandler,
		jwtManager:       jwtManager,
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

	// Webhook route (public, signature verified inside handler)
	r.echo.POST("/webhook", r.autoReplyHandler.HandleWebhook)

	// Protected API routes
	api := r.echo.Group("/api/v1")
	api.Use(JWTMiddleware(r.jwtManager))

	// AutoReply routes
	api.POST("/autoreply/rules", r.autoReplyHandler.CreateRule)
	api.GET("/autoreply/rules", r.autoReplyHandler.ListRules)
	api.PUT("/autoreply/rules/:id", r.autoReplyHandler.UpdateRule)
	api.DELETE("/autoreply/rules/:id", r.autoReplyHandler.DeleteRule)

	// RichMenu routes
	api.POST("/richmenu", r.richMenuHandler.CreateRichMenu)
	api.GET("/richmenu", r.richMenuHandler.GetRichMenu)
	api.PUT("/richmenu/:id", r.richMenuHandler.UpdateRichMenu)
	api.DELETE("/richmenu/:id", r.richMenuHandler.DeleteRichMenu)
	api.POST("/richmenu/:id/publish", r.richMenuHandler.PublishToLINE)

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
