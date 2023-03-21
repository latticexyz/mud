package query

import (
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

type QueryLayer struct {
	pb_mode.UnimplementedQueryLayerServer

	dl          *db.DatabaseLayer
	rl          *read.ReadLayer
	schemaCache *schema.SchemaCache

	logger *zap.Logger
}

type BufferedEvents struct {
	ChainTables []*pb_mode.GenericTable
	WorldTables []*pb_mode.GenericTable

	ChainTableNames []string
	WorldTableNames []string
}
