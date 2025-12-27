package http

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"vt-link/backend/internal/infrastructure/auth"
)

type Router struct {
	echo             *echo.Echo
	authHandler      *AuthHandler
	autoReplyHandler *AutoReplyHandler
	richMenuHandler  *RichMenuHandler
	messageHandler   *MessageHandler
	schedulerHandler *SchedulerHandler
	jwtManager       *auth.JWTManager
}

func NewRouter(authHandler *AuthHandler, autoReplyHandler *AutoReplyHandler, richMenuHandler *RichMenuHandler, messageHandler *MessageHandler, schedulerHandler *SchedulerHandler, jwtManager *auth.JWTManager) *Router {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{os.Getenv("FRONTEND_URL")},
		AllowCredentials: true,
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, "X-CSRF-Token"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
	}))

	return &Router{
		echo:             e,
		authHandler:      authHandler,
		autoReplyHandler: autoReplyHandler,
		richMenuHandler:  richMenuHandler,
		messageHandler:   messageHandler,
		schedulerHandler: schedulerHandler,
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
	authProtected.Use(CSRFMiddleware())
	authProtected.GET("/me", r.authHandler.Me)

	// Webhook route (public, signature verified inside handler)
	r.echo.POST("/webhook", r.autoReplyHandler.HandleWebhook)

	// Protected API routes
	api := r.echo.Group("/api/v1")
	api.Use(JWTMiddleware(r.jwtManager))
	api.Use(CSRFMiddleware())

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

	// Message routes
	api.GET("/messages", r.messageHandler.ListMessages)
	api.POST("/messages", r.messageHandler.CreateMessage)
	api.GET("/messages/:id", r.messageHandler.GetMessage)
	api.PUT("/messages/:id", r.messageHandler.UpdateMessage)
	api.DELETE("/messages/:id", r.messageHandler.DeleteMessage)
	api.POST("/messages/:id/send", r.messageHandler.SendMessage)

	// Scheduler route (public, no JWT authentication)
	r.echo.POST("/api/scheduler/run", r.schedulerHandler.Run)

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
