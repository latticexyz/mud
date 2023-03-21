package query

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ops/find"
	"latticexyz/mud/packages/services/pkg/mode/ops/join"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

func (ql *QueryLayer) ExecuteSQL(sqlQuery string, tableSchema *mode.TableSchema, fieldProjections map[string]string) (*pb_mode.GenericTable, error) {
	rows, err := ql.dl.Query(sqlQuery)
	if err != nil {
		ql.logger.Error("executeSQL(): error while executing query", zap.String("query", sqlQuery), zap.Error(err))
		return nil, err
	}

	defer rows.Close()

	// Serialize the rows into a GenericTable.
	serializedTable, err := mode.SerializeRows(rows, tableSchema, fieldProjections)
	if err != nil {
		return nil, err
	}
	ql.logger.Info("executeSQL() OK", zap.String("query", sqlQuery))
	return serializedTable, nil
}

func (ql *QueryLayer) Find(ctx context.Context, request *pb_mode.FindRequest) (*pb_mode.QueryLayerResponse, error) {
	// Get a string namespace for the request.
	namespace, err := schema.NamespaceFromNamespaceObject(request.Namespace)
	if err != nil {
		ql.logger.Error("find(): error while getting namespace", zap.Error(err))
		return nil, err
	}

	// Create a "builder" for the request.
	builder := find.NewFindBuilder(request, namespace)

	// Build a query from the request.
	query, err := builder.ToSQLQuery()
	if err != nil {
		ql.logger.Error("find(): error while building query", zap.Error(err))
		return nil, err
	}
	ql.logger.Info("find(): built query from request", zap.String("query", query))

	// Get the TableSchema for the table that the query is directed at and execute the built query.
	tableSchema, err := ql.schemaCache.GetTableSchema(request.Namespace.ChainId, request.Namespace.WorldAddress, request.From)
	if err != nil {
		ql.logger.Error("find(): error while getting table schema", zap.Error(err))
		return nil, err
	}

	serializedTable, err := ql.ExecuteSQL(query, tableSchema, builder.GetFieldProjections())
	if err != nil {
		ql.logger.Error("find(): error while executing query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	// Build the response from the single table and return.
	return QueryLayerResponseFromTable(serializedTable, request.From), nil
}

// func (ql *QueryLayer) FindAll_Namespaced(ctx context.Context, request *pb_mode.FindAllRequest, namespace string) (tables []*pb_mode.GenericTable, tableNames []string, err error) {
// 	// An up-to-date list of all tables is used to return the full state, if requested.
// 	allTables, err := ql.rl.GetAllTables(namespace)
// 	if err != nil {
// 		ql.logger.Error("findAll(): error while getting all tables", zap.Error(err))
// 		return
// 	}

// 	// Create a "builder" for the request.
// 	builder, err := find.NewFindAllBuilder(request, namespace, allTables)
// 	if err != nil {
// 		ql.logger.Error("findAll(): error while creating builder", zap.Error(err))
// 		return
// 	}

// 	// Get a series of queries from the builder, since the request is for multiple tables.
// 	queries, tableNameList, err := builder.ToSQLQueryList()
// 	if err != nil {
// 		ql.logger.Error("findAll(): error while building queries", zap.Error(err))
// 		return
// 	}
// 	ql.logger.Info("findAll(): built queries from request", zap.Int("count", len(queries)))
// 	for idx, query := range queries {
// 		ql.logger.Info("findAll(): built query", zap.Int("index", idx), zap.String("query", query))
// 	}

// 	// Execute the queries and serialize each result into a GenericTable.
// 	tableListFormatted := []string{}
// 	// One extra step is to format the table list to preserve casing, so we use the table names
// 	// directly from schema as opposed to from the GetAllTables() which reads from the DB.
// 	serializedTables := []*pb_mode.GenericTable{}
// 	for idx, query := range queries {
// 		// Fetch the TableSchema for the table that the query is directed at and execute the built query.
// 		tableSchema, err := ql.schemaCache.GetTableSchema(request.Namespace.ChainId, request.Namespace.WorldAddress, tableNameList[idx])
// 		if err != nil {
// 			ql.logger.Error("findAll(): error while getting table schema", zap.Error(err))
// 			return tables, tableNames, err
// 		}

// 		serializedTable, err := ql.ExecuteSQL(query, tableSchema, builder.GetFieldProjections())
// 		if err != nil {
// 			ql.logger.Error("findAll(): error while executing query", zap.String("query", query), zap.Error(err))
// 			return tables, tableNames, err
// 		}
// 		serializedTables = append(serializedTables, serializedTable)
// 		tableListFormatted = append(tableListFormatted, tableSchema.TableName)
// 	}

// 	return serializedTables, tableListFormatted, nil
// }

// func (ql *QueryLayer) FindAll(ctx context.Context, request *pb_mode.FindAllRequest) (*pb_mode.QueryLayerResponse, error) {
// 	if schema.ValidateNamespace(request.Namespace) != nil {
// 		return nil, fmt.Errorf("invalid namespace")
// 	}

// 	// Get namespaces for the request.
// 	chainNamespace := schema.Namespace(request.Namespace.ChainId, "")
// 	worldNamespace := schema.Namespace(request.Namespace.ChainId, request.Namespace.WorldAddress)

// 	// Execute FindAll_Namespaced for each namespace.
// 	chainTables, chainTableNames, err := ql.FindAll_Namespaced(ctx, request, chainNamespace)
// 	if err != nil {
// 		ql.logger.Error("findAll(): error while executing FindAll_Namespaced for chain namespace", zap.Error(err))
// 		return nil, err
// 	}
// 	worldTables, worldTableNames, err := ql.FindAll_Namespaced(ctx, request, worldNamespace)
// 	if err != nil {
// 		ql.logger.Error("findAll(): error while executing FindAll_Namespaced for world namespace", zap.Error(err))
// 		return nil, err
// 	}

// 	// Combine the tables and table names from the two namespaces.
// 	tables := append(chainTables, worldTables...)
// 	tableNames := append(chainTableNames, worldTableNames...)

// 	// Build the response from the tables and return.
// 	return QueryLayerResponseFromTables(tables, tableNames), nil
// }

func (ql *QueryLayer) Join(ctx context.Context, request *pb_mode.JoinRequest) (*pb_mode.QueryLayerResponse, error) {
	if schema.ValidateNamespace(request.Namespace) != nil {
		return nil, fmt.Errorf("invalid namespace")
	}

	// Create a "builder" for the request.
	builder := join.NewJoinBuilder(request)

	// Build a query from the request.
	query, err := builder.ToSQLQuery()
	if err != nil {
		ql.logger.Error("join(): error while building query", zap.Error(err))
		return nil, err
	}
	ql.logger.Info("join(): built query from request", zap.String("query", query))

	tableList := builder.GetTableList()
	tableSchemas, err := ql.schemaCache.GetTableSchemas(request.Namespace.ChainId, request.Namespace.WorldAddress, tableList)
	if err != nil {
		ql.logger.Error("join(): error while getting table schemas", zap.Error(err))
		return nil, err
	}

	// Combine the table schemas and execute the built query.
	joinedTableSchema := mode.CombineSchemas(tableSchemas)
	serializedTable, err := ql.ExecuteSQL(query, joinedTableSchema, builder.GetFieldProjections())
	if err != nil {
		ql.logger.Error("join(): error while executing query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	// Build the response from the single joined table and return.
	return QueryLayerResponseFromTable(serializedTable, joinedTableSchema.NamespacedTableName()), nil
}

func (ql *QueryLayer) StreamAll(request *pb_mode.FindAllRequest, stream pb_mode.QueryLayer_StreamAllServer) error {
	if schema.ValidateNamespace(request.Namespace) != nil {
		return fmt.Errorf("invalid namespace")
	}

	eventStream := ql.dl.Stream()

	// For each event, serialize the event into a GenericTable and send it to the client.
	for {
		select {
		case event := <-eventStream:
			// Avoid streaming internal table updates.
			if ql.schemaCache.IsInternalTable(event.TableName) {
				ql.logger.Info("streamAll(): skipping internal table update", zap.String("table", event.TableName))
				continue
			}

			// Get the TableSchema for the table that the event is directed at.
			tableSchema, err := ql.schemaCache.GetTableSchema(request.Namespace.ChainId, request.Namespace.WorldAddress, event.TableName)
			if err != nil {
				ql.logger.Error("streamAll(): no schema matching chainId, worldAddress, and table name", zap.Error(err))
				continue
			}
			serializedTable, err := mode.SerializeStreamEvent(event, tableSchema, make(map[string]string))
			if err != nil {
				ql.logger.Error("streamAll(): error while serializing stream event", zap.Error(err))
				continue
			}
			// The table name is appended with the event type to distinguish between different types of events.
			stream.Send(QueryLayerResponseFromTable(serializedTable, event.TableName+"_"+string(event.Type)))
		}
	}
}

///
/// GetState_Namespaced returns the state in a given namespace. Used with GetState to get the state across the chain and world namespaces.
///

func (ql *QueryLayer) GetState_Namespaced(ctx context.Context, tablesFilter []string, queryNamespace *pb_mode.Namespace, worldNamespace *pb_mode.Namespace) (tables []*pb_mode.GenericTable, tableNames []string, err error) {
	// Get a string representation of the query namespace.
	queryNamespaceString := schema.Namespace(queryNamespace.ChainId, queryNamespace.WorldAddress)
	// Get a string representation of the world namespace.
	worldNamespaceString := schema.Namespace(worldNamespace.ChainId, worldNamespace.WorldAddress)

	// An up-to-date list of all tables is used to return the full state, if requested.
	tablesInNamespace, err := ql.rl.GetAllTables(queryNamespaceString)
	if err != nil {
		ql.logger.Error("GetState_Namespaced(): error while getting all tables in namespace", zap.Error(err))
		return
	}

	// Create a "builder" for the request.
	builder, err := find.NewFindAllBuilder(queryNamespaceString, worldNamespaceString, tablesInNamespace, tablesFilter)
	if err != nil {
		ql.logger.Error("GetState_Namespaced(): error while creating builder", zap.Error(err))
		return
	}

	// Get a series of queries from the builder, since the request is for multiple tables.
	queries, tableNameList, err := builder.ToSQLQueryList()
	if err != nil {
		ql.logger.Error("GetState_Namespaced(): error while building queries", zap.Error(err))
		return
	}
	ql.logger.Info("GetState_Namespaced(): built queries from request", zap.Int("count", len(queries)))
	for idx, query := range queries {
		ql.logger.Info("GetState_Namespaced(): built query", zap.Int("index", idx), zap.String("query", query))
	}

	// Execute the queries and serialize each result into a GenericTable.
	tableListFormatted := []string{}
	// One extra step is to format the table list to preserve casing, so we use the table names
	// directly from schema as opposed to from the GetAllTables() which reads from the DB.
	serializedTables := []*pb_mode.GenericTable{}
	for idx, query := range queries {
		// Fetch the TableSchema for the table that the query is directed at and execute the built query.
		tableSchema, err := ql.schemaCache.GetTableSchema(queryNamespace.ChainId, queryNamespace.WorldAddress, tableNameList[idx])
		if err != nil {
			ql.logger.Error("GetState_Namespaced(): error while getting table schema", zap.Error(err))
			return tables, tableNames, err
		}

		serializedTable, err := ql.ExecuteSQL(query, tableSchema, builder.GetFieldProjections())
		if err != nil {
			ql.logger.Error("GetState_Namespaced(): error while executing query", zap.String("query", query), zap.Error(err))
			return tables, tableNames, err
		}
		serializedTables = append(serializedTables, serializedTable)
		tableListFormatted = append(tableListFormatted, tableSchema.TableName)
	}

	return serializedTables, tableListFormatted, nil
}

///
/// GetState returns the full state given a chain + world namespace. Allows for filtering if only a subset of the state is desired.
///

func (ql *QueryLayer) GetState(ctx context.Context, request *pb_mode.StateRequest) (*pb_mode.QueryLayerStateResponse, error) {
	// Validate the namespace.
	if schema.ValidateNamespace(request.Namespace) != nil {
		return nil, fmt.Errorf("invalid namespace")
	}

	// Get namespaces for the request. A namespace is a chainId and worldAddress pair.
	chainNamespace := &pb_mode.Namespace{
		ChainId:      request.Namespace.ChainId,
		WorldAddress: "",
	}
	worldNamespace := &pb_mode.Namespace{
		ChainId:      request.Namespace.ChainId,
		WorldAddress: request.Namespace.WorldAddress,
	}

	// Execute GetState_Namespaced for each namespace.
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
	return QueryLayerStateResponseFromTables(chainTables, worldTables, chainTableNames, worldTableNames), nil
}

///
/// StreamState streams changes to the full state given a namespace. Allows for filtering if only a subset of the state is desired.
///

func (ql *QueryLayer) StreamState(request *pb_mode.StateRequest, stream pb_mode.QueryLayer_StreamStateServer) error {
	if schema.ValidateNamespace(request.Namespace) != nil {
		return fmt.Errorf("invalid namespace")
	}

	// The stream for all events.
	eventStream := ql.dl.Stream()

	// Keep track of events that are for all tables other than the block number table. Once the block number table is
	// updated, we package all events into a single response and send it to the client. The events themselves are
	// serialized into a GenericTable.
	inserted := NewBufferedEvents()
	updated := NewBufferedEvents()
	deleted := NewBufferedEvents()

	// For each event, serialize the event and either
	// 1. store and wait for block number event to send
	// 2. send the stored events if the event is the block number
	for {
		select {
		case event := <-eventStream:
			// Get the TableSchema for the table that the event is directed at.
			tableSchema, err := ql.schemaCache.GetTableSchema(request.Namespace.ChainId, request.Namespace.WorldAddress, event.TableName)
			if err != nil {
				ql.logger.Error("StreamState(): no schema matching chainId, worldAddress, and table name", zap.Error(err))
				continue
			}
			serializedTable, err := mode.SerializeStreamEvent(event, tableSchema, make(map[string]string))
			if err != nil {
				ql.logger.Error("StreamState(): error while serializing stream event", zap.Error(err))
				continue
			}

			// Check if the event is for the block number table.
			if ql.schemaCache.IsInternal__BlockNumberTable(request.Namespace.ChainId, event.TableName) {
				// Append the block number event to the response as a single update event.
				updated.AddChainTable(serializedTable, tableSchema.TableName)

				// Send the stored events as a single response. Every buffered event is combined into
				// a single response and sent to the client.
				stream.Send(QueryLayerStateStreamResponseFromTables(inserted, updated, deleted))

				// Clear the buffers.
				inserted = NewBufferedEvents()
				updated = NewBufferedEvents()
				deleted = NewBufferedEvents()
			} else {
				// Process the event and store in a "buffer" awaiting the block number event. We append
				// the serialized table to the appropriate list to differentiate between inserts, updates,
				// and deletes.
				if ql.schemaCache.IsInternalTable(event.TableName) {
					if event.Type == db.StreamEventTypeInsert {
						inserted.AddChainTable(serializedTable, tableSchema.TableName)
					} else if event.Type == db.StreamEventTypeUpdate {
						updated.AddChainTable(serializedTable, tableSchema.TableName)
					} else if event.Type == db.StreamEventTypeDelete {
						deleted.AddChainTable(serializedTable, tableSchema.TableName)
					}
				} else {
					if event.Type == db.StreamEventTypeInsert {
						inserted.AddWorldTable(serializedTable, tableSchema.TableName)
					} else if event.Type == db.StreamEventTypeUpdate {
						updated.AddWorldTable(serializedTable, tableSchema.TableName)
					} else if event.Type == db.StreamEventTypeDelete {
						deleted.AddWorldTable(serializedTable, tableSchema.TableName)
					}
				}
			}
		}
	}
}
