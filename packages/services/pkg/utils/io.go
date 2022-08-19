package utils

import (
	"latticexyz/chain-sidecar/pkg/logger"
	"os"
	"path/filepath"

	"go.uber.org/zap"
)

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
