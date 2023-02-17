package query

import (
	"context"

	"go.uber.org/zap"

	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

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

	// Execute the query.
	rows, err := ql.db.Queryx(query)
	if err != nil {
		ql.logger.Error("find(): error while executing query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	defer rows.Close()

	// Get the TableSchema for the table that the query is directed at.
	tableSchema := ql.tableSchemas[request.From]

	// Serialize the rows into a QueryLayerResponse.
	queryResponse, err := mode.SerializeRows(rows, tableSchema)
	if err != nil {
		return nil, err
	}
	ql.logger.Info("find() OK")

	return queryResponse, nil
}
