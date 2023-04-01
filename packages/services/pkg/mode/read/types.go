package read

import (
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

type ReadLayer struct {
	dl     *db.DatabaseLayer
	logger *zap.Logger
}
