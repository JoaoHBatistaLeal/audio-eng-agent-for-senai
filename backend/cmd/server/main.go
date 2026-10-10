package main

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"backend/internal/config"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/service"
)

func main() {
	cfg := config.LoadConfig()

	groqClient := service.NewGroqClient(cfg.GroqAPIKey, cfg.GroqModel)
	audioBuilder := service.NewAudioContextBuilder()

	chatHandler := handler.NewChatHandler(groqClient, audioBuilder)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /healthz", handler.HealthHandler)
	mux.HandleFunc("POST /api/chat/stream", chatHandler.StreamHandler)
	mux.HandleFunc("POST /api/v1/chat", chatHandler.StreamHandler)

	corsMiddleware := middleware.NewCORSMiddleware(cfg.AllowedOrigin)
	serverHandler := corsMiddleware(mux)

	addr := fmt.Sprintf("0.0.0.0:%s", cfg.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      serverHandler,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			os.Exit(1)
		}
	}()

	<-stopChan

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_ = srv.Shutdown(shutdownCtx)
}
