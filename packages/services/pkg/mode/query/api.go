package query

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"latticexyz/mud/packages/services/pkg/mode"
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
	// Create a "builder" for the request.
	builder := mode.NewFindBuilder(request)

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

func (ql *QueryLayer) FindAll(ctx context.Context, request *pb_mode.FindAllRequest) (*pb_mode.QueryLayerResponse, error) {
	// Get a string namespace for the request.
	namespace, err := schema.NamespaceFromNamespaceObject(request.Namespace)
	if err != nil {
		ql.logger.Error("findAll(): error while getting namespace", zap.Error(err))
		return nil, err
	}

	// An up-to-date list of all tables is used to return the full state, if requested.
	allTables, err := ql.dl.GetAllTables(namespace)
	if err != nil {
		ql.logger.Error("findAll(): error while getting all tables", zap.Error(err))
		return nil, err
	}

	// Create a "builder" for the request.
	builder, err := mode.NewFindAllBuilder(request, namespace, allTables)
	if err != nil {
		ql.logger.Error("findAll(): error while creating builder", zap.Error(err))
		return nil, err
	}

	// Get a series of queries from the builder, since the request is for multiple tables.
	queries, tableNameList, err := builder.ToSQLQueryList()
	if err != nil {
		ql.logger.Error("findAll(): error while building queries", zap.Error(err))
		return nil, err
	}
	ql.logger.Info("findAll(): built queries from request", zap.Int("count", len(queries)))
	for idx, query := range queries {
		ql.logger.Info("findAll(): built query", zap.Int("index", idx), zap.String("query", query))
	}

	// Execute the queries and serialize each result into a GenericTable.
	serializedTables := []*pb_mode.GenericTable{}
	for idx, query := range queries {
		// Fetch the TableSchema for the table that the query is directed at and execute the built query.
		tableSchema, err := ql.schemaCache.GetTableSchema(request.Namespace.ChainId, request.Namespace.WorldAddress, tableNameList[idx])
		if err != nil {
			ql.logger.Error("findAll(): error while getting table schema", zap.Error(err))
			return nil, err
		}

		serializedTable, err := ql.ExecuteSQL(query, tableSchema, builder.GetFieldProjections())
		if err != nil {
			ql.logger.Error("findAll(): error while executing query", zap.String("query", query), zap.Error(err))
			return nil, err
		}
		serializedTables = append(serializedTables, serializedTable)
	}

	// Build the response from the multiple tables and return.
	// One extra step is to format the table list without the specific prefix namings.
	tableListFormatted := []string{}
	for _, tableName := range tableNameList {
		tableListFormatted = append(tableListFormatted, schema.TableNameToTableId(tableName))
	}
	return QueryLayerResponseFromTables(serializedTables, tableListFormatted), nil
}

func (ql *QueryLayer) Join(ctx context.Context, request *pb_mode.JoinRequest) (*pb_mode.QueryLayerResponse, error) {
	// Create a "builder" for the request.
	builder := mode.NewJoinBuilder(request)

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
	return QueryLayerResponseFromTable(serializedTable, joinedTableSchema.FullTableName()), nil
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
			// Get the TableSchema for the table that the event is directed at.
			tableSchema, err := ql.schemaCache.GetTableSchema(request.Namespace.ChainId, request.Namespace.WorldAddress, event.TableName)
			if err != nil {
				return err
			}
			serializedTable, err := mode.SerializeStreamEvent(event, tableSchema, make(map[string]string))
			if err != nil {
				return err
			}
			// The table name is appended with the event type to distinguish between different types of events.
			stream.Send(QueryLayerResponseFromTable(serializedTable, event.TableName+"_"+string(event.Type)))
		}
	}
}
