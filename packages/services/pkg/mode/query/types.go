package query

import (
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

type QueryLayer struct {
	pb_mode.UnimplementedQueryLayerServer

	dl          *db.DatabaseLayer
	schemaCache *schema.SchemaCache

	logger *zap.Logger
}
