package read

import (
	"errors"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/ops/find"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"math/big"

	"go.uber.org/zap"
)

// GetAllTables returns a slice of table names from the specified namespace
// using the ReadLayer's database connection. The function constructs a
// plain SQL query to retrieve table names from the system-specific table
// 'pg_tables', which is executed using Query() method of the database
// connection. The returned slice of table names is empty if no tables are
// found in the specified namespace.
//
// Parameters:
//   - namespace (string): represents the namespace from which to retrieve
//     table names.
//
// Returns:
//   - ([]string): a slice of table names from the specified namespace.
//   - (error): if any error occurs while executing the query, it is returned
//     as an error object. Otherwise, nil is returned.
func (rl *Layer) GetAllTables(namespace string) ([]string, error) {
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
		scanErr := rows.Scan(&tableName)
		if scanErr != nil {
			rl.logger.Error("GetAllTables(): error while scanning row", zap.Error(scanErr))
			continue
		}
		tableNames = append(tableNames, tableName)
	}
	if iterErr := rows.Err(); iterErr != nil {
		rl.logger.Error("GetAllTables(): error while iterating over rows", zap.Error(iterErr))
		return tableNames, iterErr
	}

	return tableNames, nil
}

// DoesRowExist checks if a row exists in the specified table using the
// provided filter criteria. The function constructs a find builder using
// the table name and filter criteria, then uses the builder's ToSQLQuery()
// method to generate a SQL query. This query is then executed using the
// Query() method of the database connection. If the query returns any rows,
// the function returns true indicating that the row exists. If the query
// returns no rows, the function returns false indicating that the row does
// not exist.
//
// Parameters:
//   - tableSchema (*mode.TableSchema): a pointer to the table schema that contains
//     the name and namespace of the table.
//   - filter ([]*pb_mode.Filter): a slice of pointers to filter objects used to
//     filter rows in the table.
//
// Returns:
//   - (bool): a boolean value indicating if the row exists or not.
//   - (error): if any error occurs while executing the query, it is returned
//     as an error object. Otherwise, nil is returned.
func (rl *Layer) DoesRowExist(table *mode.Table, filter map[string]interface{}) (bool, error) {
	// Query the database layer to check if the row exists.
	exists, err := rl.dl.Exists(table.Namespace+`."`+table.Name+`"`, filter)

	if err != nil {
		rl.logger.Error("DoesRowExist(): error while executing query",
			zap.String("table", table.NamespacedName()),
			zap.Error(err),
		)
		return false, err
	}
	return exists, nil
}

// GetBlockNumber retrieves the block number for the specified chain ID
// from the internal 'block_number' table. The function constructs a find
// builder using the table name, and then uses the builder's ToSQLQuery()
// method to generate a SQL query. This query is then executed using the
// Query() method of the database connection. If the query returns a row,
// the function returns the block number as a big.Int object. If the query
// returns no rows, the function returns nil, nil indicating that the block
// number does not exist. If any error occurs while executing the query or
// parsing the block number, it is returned as an error object.
//
// Parameters:
//   - chainID (string): a string that represents the ID of the chain for
//     which to retrieve the block number.
//
// Returns:
//   - (*big.Int): a pointer to a big.Int object that represents the block
//     number for the specified chain ID. If the block number
//     does not exist, nil is returned.
//   - (error): if any error occurs while executing the query or parsing the
//     block number, it is returned as an error object. Otherwise,
//     nil is returned.
func (rl *Layer) GetBlockNumber(chainID string) (*big.Int, error) {
	// Create a find builder.
	blockNumberTable := mode.BlockNumberTable(chainID)

	findBuilder := find.NewBuilderFromFindRequest(&pb_mode.FindRequest{
		From: blockNumberTable.Name,
	}, blockNumberTable.Namespace)

	selectRowQuery, err := findBuilder.ToSQLQuery()
	if err != nil {
		rl.logger.Error("GetBlockNumber(): error while building query", zap.Error(err))
		return nil, err
	}

	// TODO: namespace
	doesTableExist := rl.dl.TableExists(blockNumberTable.Namespace + "." + blockNumberTable.Name)
	if !doesTableExist {
		rl.logger.Warn("GetBlockNumber(): block number table does not exist")
		return nil, nil
	}

	// Execute the query.
	rows, err := rl.dl.Query(selectRowQuery)
	if err != nil {
		rl.logger.Error("GetBlockNumber(): error while executing query",
			zap.String("query", selectRowQuery),
			zap.Error(err),
		)
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
	blockNumberBase := 10
	blockNumber, ok := new(big.Int).SetString(blockNumberStr, blockNumberBase)
	if !ok {
		rl.logger.Error("GetBlockNumber(): error while parsing block number",
			zap.String("block_number", blockNumberStr),
		)
		return nil, errors.New("error while parsing block number")
	}

	return blockNumber, nil
}

// GetSyncStatus retrieves the sync status for the specified chain ID
// from the internal 'sync_status' table. The function constructs a find
// builder using the table name, and then uses the builder's ToSQLQuery()
// method to generate a SQL query. This query is then executed using the
// Query() method of the database connection. If the query returns a row,
// the function returns the sync status as a boolean value. If the query
// returns no rows, the function returns false, nil indicating that the sync
// status does not exist. If any error occurs while executing the query or
// scanning the row, it is returned as an error object.
//
// Parameters:
//   - chainID (string): a string that represents the ID of the chain for
//     which to retrieve the sync status.
//
// Returns:
//   - (bool): a boolean value that represents the sync status for the
//     specified chain ID. If the sync status does not exist,
//     false is returned.
//   - (error): if any error occurs while executing the query or scanning
//     the row, it is returned as an error object. Otherwise,
//     nil is returned.
func (rl *Layer) GetSyncStatus(chainID string) (bool, error) {
	// Create a find builder.
	syncStatusTable := mode.SyncStatusTable(chainID)

	findBuilder := find.NewBuilderFromFindRequest(&pb_mode.FindRequest{
		From: syncStatusTable.Name,
	}, syncStatusTable.Namespace)

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
	query, err := rl.dl.Select(syncStatusTable.NamespacedName(), map[string]interface{}{
		"chain_id": chainID,
	},
	)
	if err != nil {
		rl.logger.Error("GetSyncStatus(): error while building query", zap.Error(err))
		return false, err
	}
	var syncStatus SyncStatus
	query.Find(&syncStatus)

	return syncStatus.Syncing, nil
}
