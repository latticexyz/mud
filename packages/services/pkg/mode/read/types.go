package read

import (
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

type SyncStatus struct {
	ChainId string `db:"chain_id"`
	Syncing bool   `db:"syncing"`
}

type Layer struct {
	dl     *db.DatabaseLayer
	logger *zap.Logger
}
