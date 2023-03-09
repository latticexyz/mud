package write

import (
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

type WriteLayer struct {
	dl     *db.DatabaseLayer
	logger *zap.Logger
}

type RowKV = map[string]string
