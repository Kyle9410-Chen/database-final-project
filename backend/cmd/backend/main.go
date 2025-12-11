package main

import (
	"context"
	"database-final-project/internal/config"
	"database-final-project/internal/database"
	loguril "database-final-project/internal/logger"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"go.uber.org/zap"
)

func main() {

	cfg, cfgLog := config.Load()

	logger, err := loguril.InitLogger(cfg.Debug)
	if err != nil {
		log.Fatalf("failed to initialize logger: %v", err)
	}

	cfgLog.FlashToZap(logger)

	logger.Info("Starting backend server", zap.Bool("debug", cfg.Debug), zap.String("host", cfg.Host), zap.String("port", cfg.Port))

	err = cfg.Validate(logger)
	if err != nil {
		logger.Fatal("Invalid configuration", zap.Error(err))
	}

	err = database.MigrationUp(cfg.MigrationSource, cfg.DatabaseURL, logger)
	if err != nil {
		logger.Fatal("Database migration failed", zap.Error(err))
	}

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {})

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	srv := &http.Server{Addr: ":8080", Handler: mux}

	go func() {
		logger.Info("Server is listening", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("Server failed", zap.Error(err))
		}
	}()

	<-ctx.Done()
	logger.Info("Shutting down server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Successfully stopped server")
}
