package query

import (
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ops/stream"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/tablestore"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

type Layer struct {
	pb_mode.UnimplementedQueryLayerServer

	dl         *db.DatabaseLayer
	rl         *read.Layer
	tableStore *tablestore.Store

	logger *zap.Logger
}

type BufferedEvents struct {
	StreamAllBuilder *stream.Builder

	ChainTableData []*pb_mode.TableData
	WorldTableData []*pb_mode.TableData

	ChainTableNames []string
	WorldTableNames []string
}
