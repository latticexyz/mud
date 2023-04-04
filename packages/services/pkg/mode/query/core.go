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

// NewQueryLayer creates a new QueryLayer instance.
//
// Parameters:
// - dl (*db.DatabaseLayer): The database layer to use for interacting with the database.
// - rl (*read.ReadLayer): The read layer to use for retrieving data from the database.
// - schemaCache (*schema.SchemaCache): The schema cache to use for retrieving table schemas.
// - logger (*zap.Logger): The logger to use for logging.
//
// Returns:
// - *QueryLayer: A new instance of QueryLayer.
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

// RunQueryLayer starts the gRPC and HTTP servers for the QueryLayer service.
//
// Parameters:
// - ql (*QueryLayer): The QueryLayer instance to run.
// - qlGrpcPort (int): The port number to use for the gRPC server.
//
// Returns:
// - void.
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

// NewBufferedEvents creates a new instance of BufferedEvents, which is used to buffer events for streaming.
//
// Parameters:
// - streamAllBuilder (*stream.StreamAllBuilder): The StreamAllBuilder instance that is used to decide whether or not a table should be streamed.
//
// Returns:
// - (*BufferedEvents): A new instance of BufferedEvents with ChainTables, WorldTables, ChainTableNames, and WorldTableNames initialized to empty slices.
func NewBufferedEvents(streamAllBuilder *stream.StreamAllBuilder) *BufferedEvents {
	return &BufferedEvents{
		StreamAllBuilder: streamAllBuilder,
		ChainTables:      make([]*pb_mode.GenericTable, 0),
		WorldTables:      make([]*pb_mode.GenericTable, 0),
		ChainTableNames:  make([]string, 0),
		WorldTableNames:  make([]string, 0),
	}
}

// AddChainTable adds a chain table to the buffered events if the corresponding table schema should be streamed according to
// the StreamAllBuilder.
//
// Parameters:
// - table (*pb_mode.GenericTable): The chain table to add.
// - tableSchema (*mode.TableSchema): The schema for the chain table.
//
// Returns:
// - void.
func (buffer *BufferedEvents) AddChainTable(table *pb_mode.GenericTable, tableSchema *mode.TableSchema) {
	// Use the StreamAllBuilder to decide if table is to be streamed.
	if buffer.StreamAllBuilder.ShouldStream(tableSchema) {
		buffer.ChainTables = append(buffer.ChainTables, table)
		buffer.ChainTableNames = append(buffer.ChainTableNames, tableSchema.TableName)
	}
}

// AddWorldTable adds a world table to the buffer, to be included in the streamed response if its table schema should be streamed.
//
// Parameters:
// - table (*pb_mode.GenericTable): The world table to add to the buffer.
// - tableSchema (*mode.TableSchema): The schema of the world table being added.
//
// Returns:
// - void.
func (buffer *BufferedEvents) AddWorldTable(table *pb_mode.GenericTable, tableSchema *mode.TableSchema) {
	if buffer.StreamAllBuilder.ShouldStream(tableSchema) {
		buffer.WorldTables = append(buffer.WorldTables, table)
		buffer.WorldTableNames = append(buffer.WorldTableNames, tableSchema.TableName)
	}
}

// Clear clears the BufferedEvents by resetting its tables and table names slices to their default empty values.
//
// Parameters:
// - None.
//
// Returns:
// - void.
func (buffer *BufferedEvents) Clear() {
	buffer.ChainTables = make([]*pb_mode.GenericTable, 0)
	buffer.WorldTables = make([]*pb_mode.GenericTable, 0)
	buffer.ChainTableNames = make([]string, 0)
	buffer.WorldTableNames = make([]string, 0)
}
