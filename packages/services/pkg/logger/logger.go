package logger

import (
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var logger *zap.Logger

// InitLogger initialized the global logger instance.
func InitLogger() {
	loggerConfig := zap.NewDevelopmentConfig()
	loggerConfig.EncoderConfig.TimeKey = "timestamp"
	loggerConfig.EncoderConfig.EncodeTime = zapcore.TimeEncoderOfLayout(time.RFC3339)
	loggerConfig.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	logger, _ = loggerConfig.Build()
}

// GetLogger returns the global logger instance.
func GetLogger() *zap.Logger {
	return logger
}
