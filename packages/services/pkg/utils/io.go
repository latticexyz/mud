package utils

import (
	"latticexyz/mud/packages/services/pkg/logger"
	"os"
	"path/filepath"

	"go.uber.org/zap"
)

// EnsureDir creates a given dir directory in case it does not already exist.
func EnsureDir(dir string) {
	path := filepath.Join(".", dir)
	err := os.MkdirAll(path, os.ModePerm)
	if err != nil {
		logger.GetLogger().Fatal("error while creating directory",
			zap.String("directory", path),
			zap.Error(err),
		)
	}
}
