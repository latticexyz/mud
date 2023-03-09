package query

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

type QueryLayer struct {
	pb_mode.UnimplementedQueryLayerServer

	dl *db.DatabaseLayer

	tableSchemas map[string]*mode.TableSchema

	logger *zap.Logger
}
