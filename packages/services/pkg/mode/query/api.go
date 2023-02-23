package query

import (
	"context"

	"go.uber.org/zap"

	"latticexyz/mud/packages/services/pkg/mode"
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
	serializedTable, err := ql.ExecuteSQL(query, ql.tableSchemas[request.From], builder.GetFieldProjections())
	if err != nil {
		ql.logger.Error("find(): error while executing query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	// Build the response from the single table and return.
	return QueryLayerResponseFromTable(serializedTable, request.From), nil
}

func (ql *QueryLayer) FindAll(ctx context.Context, request *pb_mode.FindAllRequest) (*pb_mode.QueryLayerResponse, error) {
	// An up-to-date list of all tables is used to return the full state, if requested.
	allTables, err := ql.dl.GetAllTables()
	if err != nil {
		ql.logger.Error("findAll(): error while getting all tables", zap.Error(err))
		return nil, err
	}

	// Create a "builder" for the request.
	builder, err := mode.NewFindAllBuilder(request, allTables)
	if err != nil {
		ql.logger.Error("findAll(): error while creating builder", zap.Error(err))
		return nil, err
	}

	// Get a series of queries from the builder, since the request is for multiple tables.
	queries, tableList, err := builder.ToSQLQueryList()
	if err != nil {
		ql.logger.Error("findAll(): error while building queries", zap.Error(err))
		return nil, err
	}
	ql.logger.Info("findAll(): built queries from request", zap.Int("count", len(queries)))

	// Execute the queries and serialize each result into a GenericTable.
	serializedTables := []*pb_mode.GenericTable{}
	for idx, query := range queries {
		serializedTable, err := ql.ExecuteSQL(query, ql.tableSchemas[tableList[idx]], builder.GetFieldProjections())
		if err != nil {
			ql.logger.Error("findAll(): error while executing query", zap.String("query", query), zap.Error(err))
			return nil, err
		}
		serializedTables = append(serializedTables, serializedTable)
	}

	// Build the response from the multiple tables and return.
	return QueryLayerResponseFromTables(serializedTables, tableList), nil
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
	tableSchemas := mode.GetSchemasForTables(tableList, ql.tableSchemas)

	// Combine the table schemas and execute the built query.
	joinedTableSchema := mode.CombineSchemas(tableSchemas)
	serializedTable, err := ql.ExecuteSQL(query, joinedTableSchema, builder.GetFieldProjections())
	if err != nil {
		ql.logger.Error("join(): error while executing query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	// Build the response from the single joined table and return.
	return QueryLayerResponseFromTable(serializedTable, joinedTableSchema.TableName), nil
}

func (ql *QueryLayer) StreamAll(request *pb_mode.FindAllRequest, stream pb_mode.QueryLayer_StreamAllServer) error {
	eventStream := ql.dl.Stream()

	// For each event, serialize the event into a GenericTable and send it to the client.
	for {
		select {
		case event := <-eventStream:
			serializedTable, err := mode.SerializeStreamEvent(event, ql.tableSchemas[event.TableName], make(map[string]string))
			if err != nil {
				return err
			}
			// The table name is appended with the event type to distinguish between different types of events.
			stream.Send(QueryLayerResponseFromTable(serializedTable, event.TableName+"_"+string(event.Type)))
		}
	}
}
