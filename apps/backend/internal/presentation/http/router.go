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
	audienceHandler  *AudienceHandler
	historyHandler   *HistoryHandler
	settingsHandler  *SettingsHandler
	dashboardHandler *DashboardHandler
	jwtManager       *auth.JWTManager
}

func NewRouter(authHandler *AuthHandler, autoReplyHandler *AutoReplyHandler, richMenuHandler *RichMenuHandler, messageHandler *MessageHandler, schedulerHandler *SchedulerHandler, audienceHandler *AudienceHandler, historyHandler *HistoryHandler, settingsHandler *SettingsHandler, dashboardHandler *DashboardHandler, jwtManager *auth.JWTManager) *Router {
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
		audienceHandler:  audienceHandler,
		historyHandler:   historyHandler,
		settingsHandler:  settingsHandler,
		dashboardHandler: dashboardHandler,
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

	// Auth routes (under /api/v1 for consistency)
	api.GET("/auth/me", r.authHandler.Me)

	// AutoReply routes
	api.POST("/autoreply/rules", r.autoReplyHandler.CreateRule)
	api.GET("/autoreply/rules", r.autoReplyHandler.ListRules)
	api.PATCH("/autoreply/rules/bulk", r.autoReplyHandler.BulkUpdateRules)
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

	// Audience routes
	api.GET("/audience", r.audienceHandler.ListFans)
	api.GET("/audience/:id", r.audienceHandler.GetFan)
	api.PUT("/audience/:id/tags", r.audienceHandler.UpdateFanTags)
	api.POST("/audience/:id/block", r.audienceHandler.BlockFan)
	api.POST("/audience/:id/unblock", r.audienceHandler.UnblockFan)
	api.DELETE("/audience/:id", r.audienceHandler.DeleteFan)
	api.GET("/audience/stats", r.audienceHandler.GetStats)
	api.GET("/audience/segments", r.audienceHandler.GetSegments)

	// History routes
	api.GET("/history", r.historyHandler.ListHistory)
	api.GET("/history/:id", r.historyHandler.GetHistory)
	api.GET("/history/stats", r.historyHandler.GetStats)

	// Settings routes
	api.GET("/settings", r.settingsHandler.GetSettings)
	api.PUT("/settings", r.settingsHandler.UpdateSettings)

	// Dashboard routes
	api.GET("/dashboard/stats", r.dashboardHandler.GetStats)
	api.GET("/campaigns", r.dashboardHandler.GetCampaigns)

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
