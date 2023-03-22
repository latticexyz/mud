package query

import (
	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ops/stream"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/schema"

	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

func NewQueryLayer(
	dl *db.DatabaseLayer,
	rl *read.ReadLayer,
	schemaCache *schema.SchemaCache,
	logger *zap.Logger,
) *QueryLayer {
	return &QueryLayer{
		dl:          dl,
		rl:          rl,
		schemaCache: schemaCache,
		logger:      logger,
	}
}

func RunQueryLayer(ql *QueryLayer, qlGrpcPort int) {
	// Create gRPC server.
	grpcServer := grpc.CreateGrpcServer()

	// Create and register the QueryLayer service.
	pb_mode.RegisterQueryLayerServer(grpcServer, ql)

	// Start the RPC server at PORT.
	go grpc.StartRPCServer(grpcServer, qlGrpcPort, ql.logger)

	// Start the HTTP server at PORT+1.
	grpc.StartHTTPServer(grpc.CreateWebGrpcServer(grpcServer), qlGrpcPort+1, ql.logger)
}

func NewBufferedEvents(streamAllBuilder *stream.StreamAllBuilder) *BufferedEvents {
	return &BufferedEvents{
		StreamAllBuilder: streamAllBuilder,
		ChainTables:      make([]*pb_mode.GenericTable, 0),
		WorldTables:      make([]*pb_mode.GenericTable, 0),
		ChainTableNames:  make([]string, 0),
		WorldTableNames:  make([]string, 0),
	}
}

func (buffer *BufferedEvents) AddChainTable(table *pb_mode.GenericTable, tableSchema *mode.TableSchema) {
	// Use the StreamAllBuilder to decide if table is to be streamed.
	if buffer.StreamAllBuilder.ShouldStream(tableSchema) {
		buffer.ChainTables = append(buffer.ChainTables, table)
		buffer.ChainTableNames = append(buffer.ChainTableNames, tableSchema.TableName)
	}
}

func (buffer *BufferedEvents) AddWorldTable(table *pb_mode.GenericTable, tableSchema *mode.TableSchema) {
	if buffer.StreamAllBuilder.ShouldStream(tableSchema) {
		buffer.WorldTables = append(buffer.WorldTables, table)
		buffer.WorldTableNames = append(buffer.WorldTableNames, tableSchema.TableName)
	}
}

func (buffer *BufferedEvents) Clear() {
	buffer.ChainTables = make([]*pb_mode.GenericTable, 0)
	buffer.WorldTables = make([]*pb_mode.GenericTable, 0)
	buffer.ChainTableNames = make([]string, 0)
	buffer.WorldTableNames = make([]string, 0)
}
