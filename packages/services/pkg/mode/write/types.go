package write

import (
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

type Layer struct {
	dl     *db.DatabaseLayer
	logger *zap.Logger
}
