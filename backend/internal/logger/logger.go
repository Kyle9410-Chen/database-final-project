package logger

import (
	"fmt"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
	"path/filepath"
	"strings"
)

func InitLogger(debug bool) (*zap.Logger, error) {
	if debug {
		rootDir, _ := os.Getwd()

		loggerConfig := zap.Config{
			Level:             zap.NewAtomicLevelAt(zap.DebugLevel),
			Development:       true,
			DisableStacktrace: true,
			Encoding:          "console",
			EncoderConfig:     zap.NewDevelopmentEncoderConfig(),
			OutputPaths:       []string{"stdout"},
			ErrorOutputPaths:  []string{"stderr"},
		}

		loggerConfig.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
		loggerConfig.EncoderConfig.EncodeCaller = relativePrettyCallerEncoder(rootDir)

		logger, err := loggerConfig.Build()
		return logger, err
	} else {
		loggerConfig := zap.Config{
			Level:             zap.NewAtomicLevelAt(zap.InfoLevel),
			Development:       false,
			DisableStacktrace: true,
			Encoding:          "json",
			EncoderConfig:     zap.NewProductionEncoderConfig(),
			OutputPaths:       []string{"stdout"},
			ErrorOutputPaths:  []string{"stdout"},
		}

		logger, err := loggerConfig.Build()
		return logger, err
	}
}

func relativePrettyCallerEncoder(rootDir string) zapcore.CallerEncoder {
	const fixedWidth = 30

	return func(caller zapcore.EntryCaller, enc zapcore.PrimitiveArrayEncoder) {
		relPath, err := filepath.Rel(rootDir, caller.File)
		callerStr := ""

		if err == nil && !strings.HasPrefix(relPath, "..") && !filepath.IsAbs(relPath) {
			callerStr = fmt.Sprintf("%s:%d", relPath, caller.Line)
		} else {
			parts := strings.Split(caller.File, string(filepath.Separator))

			lastN := 3
			if len(parts) > lastN {
				parts = parts[len(parts)-lastN:]
			}
			callerStr = fmt.Sprintf("external/%s:%d", filepath.Join(parts...), caller.Line)
		}

		if len(callerStr) < fixedWidth {
			callerStr += strings.Repeat(" ", fixedWidth-len(callerStr))
		}
		callerStr += "\t"
		enc.AppendString(callerStr)
	}
}
