package schema

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

type SchemaCache struct {
	dl     *db.DatabaseLayer
	logger *zap.Logger

	tableSchemas map[string]*mode.TableSchema
}

type SchemaCacheResponse struct {
	Schema string `json:"schema"`
}
