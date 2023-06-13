package query

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ops/find"
	"latticexyz/mud/packages/services/pkg/mode/ops/stream"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

// ExecuteSQL executes the given SQL query and returns the result as a serialized GenericTable.
//
// Parameters:
// - sqlQuery (string): The SQL query to execute.
// - tableSchema (*mode.TableSchema): The schema of the table that the query operates on.
// - fieldProjections (map[string]string): A map of fields to project from the table.
//
// Returns:
// - (*pb_mode.GenericTable): A serialized representation of the result of executing the given SQL query.
// - (error): Returns an error if there was an error while executing the query.
func (ql *Layer) ExecuteSQL(
	sqlQuery string,
	table *mode.Table,
	fieldProjections map[string]string,
) (*pb_mode.TableData, error) {
	rows, err := ql.dl.Query(sqlQuery)
	if err != nil {
		ql.logger.Error("executeSQL(): error while executing query", zap.String("query", sqlQuery), zap.Error(err))
		return nil, err
	}

	defer rows.Close()

	// Serialize the rows into a GenericTable.
	serializedTable, err := table.SerializeRows(rows, fieldProjections)
	if err != nil {
		return nil, err
	}
	ql.logger.Info("executeSQL() OK", zap.String("query", sqlQuery))
	return serializedTable, nil
}

// GetState_Namespaced retrieves the state of the tables specified in the given `tablesFilter` for the given query and
// world namespaces.
//
// Parameters:
// - ctx (context.Context): The context of the request.
// - tablesFilter ([]string): A list of table names to retrieve state for. If empty, returns all tables.
// - queryNamespace (*pb_mode.Namespace): The query namespace.
// - worldNamespace (*pb_mode.Namespace): The world namespace.
//
// Returns:
// - ([]*pb_mode.GenericTable): A list of serialized representations of the state of the requested tables.
// - ([]string): A list of names of the tables whose state was retrieved.
// - (error): Returns an error if there was an error while retrieving the state.
func (ql *Layer) GetState_Namespaced(
	_ context.Context,
	tablesFilter []string,
	queryNamespace *pb_mode.Namespace,
	worldNamespace *pb_mode.Namespace,
) ([]*pb_mode.TableData, []string, error) {
	// Get a string representation of the query namespace.
	queryNamespaceString := mode.Namespace(queryNamespace.ChainId, queryNamespace.WorldAddress)
	// Get a string representation of the world namespace.
	worldNamespaceString := mode.Namespace(worldNamespace.ChainId, worldNamespace.WorldAddress)

	// An up-to-date list of all tables is used to return the full state, if requested.
	tablesInNamespace, err := ql.rl.GetAllTables(queryNamespaceString)
	if err != nil {
		ql.logger.Error("GetState_Namespaced(): error while getting all tables in namespace", zap.Error(err))
		return nil, nil, err
	}

	// Create a "builder" for the request.
	builder, err := find.NewFindAllBuilder(queryNamespaceString, worldNamespaceString, tablesInNamespace, tablesFilter)
	if err != nil {
		ql.logger.Error("GetState_Namespaced(): error while creating builder", zap.Error(err))
		return nil, nil, err
	}

	// Get a series of queries from the builder, since the request is for multiple tables.
	queries, tableNameList, err := builder.ToSQLQueryList()
	if err != nil {
		ql.logger.Error("GetState_Namespaced(): error while building queries", zap.Error(err))
		return nil, nil, err
	}
	ql.logger.Info("GetState_Namespaced(): built queries from request", zap.Int("count", len(queries)))
	for idx, query := range queries {
		ql.logger.Info("GetState_Namespaced(): built query", zap.Int("index", idx), zap.String("query", query))
	}

	// Execute the queries and serialize each result into a GenericTable.
	tableListFormatted := []string{}
	// One extra step is to format the table list to preserve casing, so we use the table names
	// directly from schema as opposed to from the GetAllTables() which reads from the DB.
	serializedTables := []*pb_mode.TableData{}
	for idx, query := range queries {
		// Fetch the Table that the query is directed at and execute the built query.
		table, tableErr := ql.tableStore.GetTable(queryNamespace.ChainId, queryNamespace.WorldAddress, tableNameList[idx])
		if tableErr != nil {
			ql.logger.Error("GetState_Namespaced(): error while getting table", zap.Error(tableErr))
			return nil, nil, tableErr
		}

		serializedTable, sqlErr := ql.ExecuteSQL(query, table, builder.GetFieldProjections())
		if sqlErr != nil {
			ql.logger.Error("GetState_Namespaced(): error while executing query", zap.String("query", query), zap.Error(sqlErr))
			return nil, nil, sqlErr
		}
		serializedTables = append(serializedTables, serializedTable)
		tableListFormatted = append(tableListFormatted, table.Name)
	}

	return serializedTables, tableListFormatted, nil
}

// GetState returns the state of the given chain and world tables for the given namespace.
//
// Parameters:
// - ctx (context.Context): The context of the request.
// - request (*pb_mode.StateRequest): The state request containing the namespace and tables to filter on (if any).
//
// Returns:
// - (*pb_mode.QueryLayerStateResponse): The state of the chain and world tables for the given namespace.
// - (error): Returns an error if there was an error while retrieving the state.
func (ql *Layer) GetState(
	ctx context.Context,
	request *pb_mode.StateRequest,
) (*pb_mode.QueryLayerStateResponse, error) {
	// Validate the namespace.
	if err := mode.ValidateNamespace__State(request.Namespace); err != nil {
		return nil, fmt.Errorf("invalid namespace for GetState(): %w", err)
	}

	// Check if request can be processed. We do not allow GetState() requests while syncing.
	isSyncing, err := ql.rl.GetSyncStatus(request.Namespace.ChainId)
	if err != nil {
		ql.logger.Error("GetState(): error while getting sync status", zap.Error(err))
		return nil, err
	}
	if isSyncing {
		ql.logger.Info("GetState(): cannot process request while syncing")
		return nil, fmt.Errorf("cannot process request while syncing")
	}

	// Get sub-namespaces for the request. A namespace is a chainId and worldAddress pair.
	chainNamespace, worldNamespace := mode.NamespaceToSubNamespaces(request.Namespace)

	// Execute GetState_Namespaced for each sub-namespace.
	chainTables, chainTableNames, err := ql.GetState_Namespaced(
		ctx,
		request.ChainTables,
		chainNamespace,
		worldNamespace,
	)
	if err != nil {
		ql.logger.Error("GetState(): error while executing GetState_Namespaced for chain namespace", zap.Error(err))
		return nil, err
	}
	worldTables, worldTableNames, err := ql.GetState_Namespaced(
		ctx,
		request.WorldTables,
		worldNamespace,
		worldNamespace,
	)
	if err != nil {
		ql.logger.Error("GetState(): error while executing GetState_Namespaced for world namespace", zap.Error(err))
		return nil, err
	}

	// Build the state response from the tables and return.
	return StateResponseFromTables(chainTables, worldTables, chainTableNames, worldTableNames), nil
}

// StreamState streams incremental updates to the state of the tables specified in the given state request.
//
// Parameters:
// - request (*pb_mode.StateRequest): The state request.
// - stateStream (pb_mode.QueryLayer_StreamStateServer): The server stream for streaming state updates.
//
// Returns:
// - (error): Returns an error if there was an error while streaming the state.
func (ql *Layer) StreamState(request *pb_mode.StateRequest, stateStream pb_mode.QueryLayer_StreamStateServer) error {
	if err := mode.ValidateNamespace__State(request.Namespace); err != nil {
		return fmt.Errorf("invalid namespace for StreamState(): %w", err)
	}

	// Check if request can be processed.
	isSyncing, err := ql.rl.GetSyncStatus(request.Namespace.ChainId)
	if err != nil {
		ql.logger.Error("GetState(): error while getting sync status", zap.Error(err))
		return err
	}
	if isSyncing {
		ql.logger.Info("GetState(): cannot process request while syncing")
		return fmt.Errorf("cannot process request while syncing")
	}

	// The stream for all events.
	eventStream := ql.dl.Stream()

	// Build a streaming builder. This is slightly different from a query builder in that it is
	// not responsible for building a query, but rather serves as a utility for deciding whether
	// to include an event in the stream response.
	builder := stream.NewBuilder(
		request.Namespace, // Namespace from stream query / request.
		request.ChainTables,
		request.WorldTables,
	)

	// Keep track of events that are for all tables other than the block number table. Once the block number table is
	// updated, we package all events into a single response and send it to the client. The events themselves are
	// serialized into a GenericTable.
	inserted := NewBufferedEvents(builder)
	updated := NewBufferedEvents(builder)
	deleted := NewBufferedEvents(builder)

	// For each event, serialize the event and either
	// 1. store and wait for block number event to send
	// 2. send the stored events if the event is the block number
	for {
		select {
		case event := <-eventStream:
			// Get the Table that the event is directed at.
			table, tableErr := ql.tableStore.GetTable(request.Namespace.ChainId, request.Namespace.WorldAddress, event.TableName)
			if tableErr != nil {
				ql.logger.Error("StreamState(): no table matching chainId, worldAddress, and table name", zap.Error(tableErr))
				continue
			}
			serializedTable, serializeErr := table.SerializeStreamEvent(event, make(map[string]string))
			if serializeErr != nil {
				ql.logger.Error("StreamState(): error while serializing stream event", zap.Error(serializeErr))
				continue
			}

			// Check if the event is for the block number table.
			if ql.tableStore.IsBlockNumberTable(request.Namespace.ChainId, event.TableName) {
				// Append the block number event to the response as a single update event.
				updated.AddChainTable(serializedTable, table)

				// Send the stored events as a single response. Every buffered event is combined into
				// a single response and sent to the client.
				stateStream.Send(StateStreamResponseFromTables(inserted, updated, deleted))

				// Clear the buffers.
				inserted.Clear()
				updated.Clear()
				deleted.Clear()
			} else {
				// Process the event and store in a "buffer" awaiting the block number event. We append
				// the serialized table to the appropriate list to differentiate between inserts, updates,
				// and deletes.
				if ql.tableStore.IsInternalTable(event.TableName) {
					if event.Type == db.StreamEventTypeInsert {
						inserted.AddChainTable(serializedTable, table)
					} else if event.Type == db.StreamEventTypeUpdate {
						updated.AddChainTable(serializedTable, table)
					} else if event.Type == db.StreamEventTypeDelete {
						deleted.AddChainTable(serializedTable, table)
					}
				} else {
					if event.Type == db.StreamEventTypeInsert {
						inserted.AddWorldTable(serializedTable, table)
					} else if event.Type == db.StreamEventTypeUpdate {
						updated.AddWorldTable(serializedTable, table)
					} else if event.Type == db.StreamEventTypeDelete {
						deleted.AddWorldTable(serializedTable, table)
					}
				}
			}
		}
	}
}

// Single__GetState returns the state for a single table specified in the request. The table name and namespace are
// specified in the request. A SQL query is built from the request using a builder, and the query is executed to
// retrieve the state of the table. The retrieved state is then serialized into a GenericTable and returned as part of
// the QueryLayerStateResponse.
//
// If an error is encountered during validation, query building, or execution, this function returns a nil response and
// an error message.
//
// Parameters:
// - ctx (context.Context): The context of the request.
// - request (*pb_mode.Single__StateRequest): The request for a single table state.
//
// Returns:
// - (*pb_mode.QueryLayerStateResponse): The response containing the single table state.
// - (error): An error encountered during validation, query building, or execution.
func (ql *Layer) Single__GetState(
	_ context.Context,
	request *pb_mode.Single__StateRequest,
) (*pb_mode.QueryLayerStateResponse, error) {
	if err := mode.ValidateNamespace__SingleState(request.Namespace); err != nil {
		return nil, fmt.Errorf("invalid namespace for Single__GetState(): %w", err)
	}

	// Get a string namespace for the request.
	namespace, err := mode.NamespaceFromNamespaceObject(request.Namespace)
	if err != nil {
		ql.logger.Error("Single__GetState(): error while getting namespace", zap.Error(err))
		return nil, err
	}

	// Create a "builder" for the request.
	builder := find.New__FromSingle__StateRequest(request, namespace)

	// Build a query from the request.
	query, err := builder.ToSQLQuery()
	if err != nil {
		ql.logger.Error("Single__GetState(): error while building query", zap.Error(err))
		return nil, err
	}
	ql.logger.Info("Single__GetState(): built query from request", zap.String("query", query))

	// Get the Table that the query is directed at and execute the built query.
	table, err := ql.tableStore.GetTable(request.Namespace.ChainId, request.Namespace.WorldAddress, request.Table)
	if err != nil {
		ql.logger.Error("Single__GetState(): error while getting table schema", zap.Error(err))
		return nil, err
	}

	serializedTable, err := ql.ExecuteSQL(query, table, builder.GetFieldProjections())
	if err != nil {
		ql.logger.Error("Single__GetState(): error while executing query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	// Build the response from the single table and return.
	return StateResponseFromTable(serializedTable, request.Table, ql.tableStore.IsInternalTable(request.Table)), nil
}

// Single__StreamState streams incremental updates for a single table specified in the request. The table name and
// namespace are specified in the request. The function listens to the stream of events from the database layer and
// serializes any events that match the table in the request. Once a block number event is encountered, all buffered
// events are combined into a single response and sent to the client as part of the QueryLayerStateStreamResponse. If
// an error is encountered during validation or execution, the function returns an error message and closes the stream.
//
// Parameters:
// - request (*pb_mode.Single__StateRequest): The request for a single table state.
// - stateStream (pb_mode.QueryLayer_Single__StreamStateServer): The stream to send incremental updates to the client.
//
// Returns:
// - (error): An error encountered during validation or execution.
func (ql *Layer) Single__StreamState(
	request *pb_mode.Single__StateRequest,
	stream pb_mode.QueryLayer_Single__StreamStateServer,
) error {
	// TODO: implement
	return nil
}
