package tablestore

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

type Store struct {
	dl             *db.DatabaseLayer
	logger         *zap.Logger
	internalTables map[string]*mode.Table
}

type StoreResponse struct {
	Table string `json:"table_json" db:"table_json"`
}
