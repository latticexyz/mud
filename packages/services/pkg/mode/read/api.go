package read

import (
	"errors"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/ops/find"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"math/big"

	"go.uber.org/zap"
)

func (rl *ReadLayer) GetAllTables(namespace string) ([]string, error) {
	var tableNames []string

	// Since we want to query from a system-specific table 'pg_tables',
	// we construct the query in plain SQL here instead of using a query builder.
	query := "SELECT tablename FROM pg_tables WHERE schemaname = '" + namespace + "'"
	rows, err := rl.dl.Query(query)
	if err != nil {
		rl.logger.Error("GetAllTables(): error while executing query", zap.String("query", query), zap.Error(err))
		return tableNames, err
	}
	defer rows.Close()

	for rows.Next() {
		var tableName string
		err := rows.Scan(&tableName)
		if err != nil {
			rl.logger.Error("GetAllTables(): error while scanning row", zap.Error(err))
			continue
		}
		tableNames = append(tableNames, tableName)
	}
	if err := rows.Err(); err != nil {
		rl.logger.Error("GetAllTables(): error while iterating over rows", zap.Error(err))
		return tableNames, err
	}

	return tableNames, nil
}

func (rl *ReadLayer) DoesRowExist(tableSchema *mode.TableSchema, filter []*pb_mode.Filter) (bool, error) {
	// Create a find builder.
	findBuilder := find.NewFindBuilder(&pb_mode.FindRequest{
		From:   tableSchema.TableName,
		Filter: filter,
	}, tableSchema.Namespace)

	selectRowQuery, err := findBuilder.ToSQLQuery()
	if err != nil {
		rl.logger.Error("DoesRowExist(): error while building query", zap.Error(err))
		return false, err
	}

	// Execute the query.
	rows, err := rl.dl.Query(selectRowQuery)
	if err != nil {
		rl.logger.Error("DoesRowExist(): error while executing query", zap.String("query", selectRowQuery), zap.Error(err))
		return false, err
	}
	defer rows.Close()

	// If there are no rows, then the row does not exist.
	if !rows.Next() {
		return false, nil
	}

	// If there is a row, then the row exists.
	return true, nil
}

func (rl *ReadLayer) GetBlockNumber(chainId string) (*big.Int, error) {
	// Create a find builder.
	blockNumberTableSchema := schema.Internal__BlockNumberTableSchema(chainId)

	findBuilder := find.NewFindBuilder(&pb_mode.FindRequest{
		From: blockNumberTableSchema.TableName,
	}, blockNumberTableSchema.Namespace)

	selectRowQuery, err := findBuilder.ToSQLQuery()
	if err != nil {
		rl.logger.Error("GetBlockNumber(): error while building query", zap.Error(err))
		return nil, err
	}

	// Execute the query.
	rows, err := rl.dl.Query(selectRowQuery)
	if err != nil {
		rl.logger.Error("GetBlockNumber(): error while executing query", zap.String("query", selectRowQuery), zap.Error(err))
		return nil, err
	}
	defer rows.Close()

	// If there are no rows, then the block number does not exist.
	if !rows.Next() {
		rl.logger.Error("GetBlockNumber(): block number does not exist")
		return nil, nil
	}

	// If there is a row, then the block number exists.
	var blockNumberStr string
	err = rows.Scan(&blockNumberStr)
	if err != nil {
		rl.logger.Error("GetBlockNumber(): error while scanning row", zap.Error(err))
		return nil, err
	}

	// Parse the block number.
	blockNumber, ok := new(big.Int).SetString(blockNumberStr, 10)
	if !ok {
		rl.logger.Error("GetBlockNumber(): error while parsing block number", zap.String("block_number", blockNumberStr))
		return nil, errors.New("error while parsing block number")
	}

	return blockNumber, nil
}

func (rl *ReadLayer) GetSyncStatus(chainId string) (bool, error) {
	// Create a find builder.
	syncStatusTableSchema := schema.Internal__SyncStatusTableSchema(chainId)

	findBuilder := find.NewFindBuilder(&pb_mode.FindRequest{
		From: syncStatusTableSchema.TableName,
	}, syncStatusTableSchema.Namespace)

	selectRowQuery, err := findBuilder.ToSQLQuery()
	if err != nil {
		rl.logger.Error("GetSyncStatus(): error while building query", zap.Error(err))
		return false, err
	}

	// Execute the query.
	rows, err := rl.dl.Query(selectRowQuery)
	if err != nil {
		rl.logger.Error("GetSyncStatus(): error while executing query", zap.String("query", selectRowQuery), zap.Error(err))
		return false, err
	}
	defer rows.Close()

	// If there are no rows, then the sync status does not exist.
	if !rows.Next() {
		rl.logger.Error("GetSyncStatus(): sync status does not exist")
		return false, nil
	}

	// If there is a row, then the sync status exists.
	var syncStatus bool
	err = rows.Scan(&syncStatus)
	if err != nil {
		rl.logger.Error("GetSyncStatus(): error while scanning row", zap.Error(err))
		return false, err
	}

	return syncStatus, nil
}
