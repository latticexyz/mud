package query

import (
	"context"

	"go.uber.org/zap"

	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

func (ql *QueryLayer) ExecuteSQL(sqlQuery string, tableSchema *mode.TableSchema) (*pb_mode.GenericTable, error) {
	rows, err := ql.db.Queryx(sqlQuery)
	if err != nil {
		ql.logger.Error("executeSQL(): error while executing query", zap.String("query", sqlQuery), zap.Error(err))
		return nil, err
	}

	defer rows.Close()

	// Serialize the rows into a GenericTable.
	serializedTable, err := mode.SerializeRows(rows, tableSchema)
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
	serializedTable, err := ql.ExecuteSQL(query, ql.tableSchemas[request.From])
	if err != nil {
		ql.logger.Error("find(): error while executing query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	// Build the response from the single table and return.
	return QueryLayerResponseFromTable(serializedTable, request.From), nil
}

func (ql *QueryLayer) FindAll(ctx context.Context, request *pb_mode.FindAllRequest) (*pb_mode.QueryLayerResponse, error) {
	// Create a "builder" for the request.
	builder, err := mode.NewFindAllBuilder(request, ql.db)
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
		serializedTable, err := ql.ExecuteSQL(query, ql.tableSchemas[tableList[idx]])
		if err != nil {
			ql.logger.Error("findAll(): error while executing query", zap.String("query", query), zap.Error(err))
			return nil, err
		}
		serializedTables = append(serializedTables, serializedTable)
	}

	// Build the response from the multiple tables and return.
	return QueryLayerResponseFromTables(serializedTables, tableList), nil
}
