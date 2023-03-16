package read

import (
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

func New(dl *db.DatabaseLayer, logger *zap.Logger) *ReadLayer {
	rl := &ReadLayer{
		dl:     dl,
		logger: logger,
	}

	return rl
}
