package query

import (
	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ops/stream"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/tablestore"

	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

// New creates a new query Layer instance.
//
// Parameters:
// - dl (*db.DatabaseLayer): The database layer to use for interacting with the database.
// - rl (*read.Layer): The read Layer to use for retrieving data from the database.
// - tableStore (*tablestore.Stire): The table Store to use for retrieving tables.
// - logger (*zap.Logger): The logger to use for logging.
//
// Returns:
// - *Layer: A new instance of query Layer.
func New(
	dl *db.DatabaseLayer,
	rl *read.Layer,
	tableStore *tablestore.Store,
	logger *zap.Logger,
) *Layer {
	return &Layer{
		dl:         dl,
		rl:         rl,
		tableStore: tableStore,
		logger:     logger,
	}
}

// Run starts the gRPC and HTTP servers for the QueryLayer service.
//
// Parameters:
// - ql (*QueryLayer): The QueryLayer instance to run.
// - qlGRPCPort (int): The port number to use for the gRPC server.
//
// Returns:
// - void.
func Run(ql *Layer, qlGRPCPort int) {
	// Create gRPC server.
	grpcServer := grpc.CreateGrpcServer()

	// Create and register the QueryLayer service.
	pb_mode.RegisterQueryLayerServer(grpcServer, ql)

	// Start the RPC server at PORT.
	go grpc.StartRPCServer(grpcServer, qlGRPCPort, ql.logger)

	// Start the HTTP server at PORT+1.
	grpc.StartHTTPServer(grpc.CreateWebGrpcServer(grpcServer), qlGRPCPort+1, ql.logger)
}

// NewBufferedEvents creates a new instance of BufferedEvents, which is used to buffer events for streaming.
//
// Parameters:
// - streamAllBuilder (*stream.StreamAllBuilder): The StreamAllBuilder instance that is used to decide whether or not
// a table should be streamed.
//
// Returns:
// - (*BufferedEvents): A new instance of BufferedEvents with ChainTables, WorldTables, ChainTableNames, and
// WorldTableNames initialized to empty slices.
func NewBufferedEvents(streamAllBuilder *stream.Builder) *BufferedEvents {
	return &BufferedEvents{
		StreamAllBuilder: streamAllBuilder,
		ChainTableData:   make([]*pb_mode.TableData, 0),
		WorldTableData:   make([]*pb_mode.TableData, 0),
		ChainTableNames:  make([]string, 0),
		WorldTableNames:  make([]string, 0),
	}
}

// AddChainTable adds a chain table to the buffered events if the corresponding table schema should be streamed
// according to
// the StreamAllBuilder.
//
// Parameters:
// - table (*pb_mode.GenericTable): The chain table to add.
// - tableSchema (*mode.TableSchema): The schema for the chain table.
//
// Returns:
// - void.
func (buffer *BufferedEvents) AddChainTable(tableData *pb_mode.TableData, table *mode.Table) {
	// Use the StreamAllBuilder to decide if table is to be streamed.
	if buffer.StreamAllBuilder.ShouldStream(table) {
		buffer.ChainTableData = append(buffer.ChainTableData, tableData)
		buffer.ChainTableNames = append(buffer.ChainTableNames, table.Name)
	}
}

// AddWorldTable adds a world table to the buffer, to be included in the streamed response if its table schema should
// be streamed.
//
// Parameters:
// - table (*pb_mode.GenericTable): The world table to add to the buffer.
// - tableSchema (*mode.Table): The schema of the world table being added.
//
// Returns:
// - void.
func (buffer *BufferedEvents) AddWorldTable(tableData *pb_mode.TableData, table *mode.Table) {
	if buffer.StreamAllBuilder.ShouldStream(table) {
		buffer.WorldTableData = append(buffer.WorldTableData, tableData)
		buffer.WorldTableNames = append(buffer.WorldTableNames, table.Name)
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
	buffer.ChainTableData = make([]*pb_mode.TableData, 0)
	buffer.WorldTableData = make([]*pb_mode.TableData, 0)
	buffer.ChainTableNames = make([]string, 0)
	buffer.WorldTableNames = make([]string, 0)
}
