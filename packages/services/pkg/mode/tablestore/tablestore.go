package tablestore

import (
	"encoding/json"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/config"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ops/find"
	"latticexyz/mud/packages/services/pkg/utils"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

func NewStore(dl *db.DatabaseLayer, chains []config.ChainConfig, logger *zap.Logger) *Store {
	return &Store{
		dl:             dl,
		logger:         logger,
		internalTables: InternalTables(chains),
	}
}

func InternalTables(chains []config.ChainConfig) map[string]*mode.Table {
	// Create references to all of the internal tables.
	tables := map[string]*mode.Table{}
	for _, chain := range chains {
		// Add the block number table.
		blockNumberTableSchema := mode.BlockNumberTable(chain.Id)
		tables[blockNumberTableSchema.Name] = blockNumberTableSchema

		// Add the sync status table.
		syncStatusTableSchema := mode.SyncStatusTable(chain.Id)
		tables[syncStatusTableSchema.Name] = syncStatusTableSchema

		// Add the schemas table.
		schemasTableSchema := mode.SchemasTable(chain.Id)
		tables[schemasTableSchema.Name] = schemasTableSchema
	}
	return tables
}

func (store *Store) IsInternalTable(tableName string) bool {
	_, ok := store.internalTables[tableName]
	return ok
}

func (store *Store) IsBlockNumberTable(chainId string, tableName string) bool {
	return tableName == mode.BlockNumberTable(chainId).Name
}

func (store *Store) IsSyncStatusTable(chainId string, tableName string) bool {
	return tableName == mode.SyncStatusTable(chainId).Name
}

func (store *Store) IsSchemasTable(chainId string, tableName string) bool {
	return tableName == mode.SchemasTable(chainId).Name
}

func (store *Store) GetTable(chainId string, worldAddress string, tableName string) (*mode.Table, error) {
	// If the table name is for an internal table, return schema directly.
	if store.IsInternalTable(tableName) {
		return store.internalTables[tableName], nil
	}

	// Otherwise lookup the schema from the schemas table.
	schemasTable := mode.SchemasTable(chainId)
	schemasTableName := schemasTable.Name

	// Create a request builder for the table schema query.
	request := &pb_mode.FindRequest{
		From: schemasTableName,
		Filter: []*pb_mode.Filter{
			{
				Field: &pb_mode.Field{
					TableName:  schemasTableName,
					TableField: "world_address",
				},
				Operator: "=",
				Value:    utils.ChecksumAddressString(worldAddress),
			},
			{
				Field: &pb_mode.Field{
					TableName:  schemasTableName,
					TableField: "table_name",
				},
				Operator: "=",
				Value:    tableName,
				Function: "LOWER",
			},
		},
		Project: []*pb_mode.ProjectedField{
			{
				Field: &pb_mode.Field{
					TableName:  schemasTableName,
					TableField: "table_json",
				},
			},
		},
	}
	// Query the DB for the schema.
	builder := find.NewBuilderFromFindRequest(request, schemasTable.Namespace)
	query, err := builder.ToSQLQuery()
	if err != nil {
		store.logger.Error("failed to build query", zap.Error(err))
		return nil, err
	}

	storeResponse := &StoreResponse{}
	err = store.dl.Get(storeResponse, query)
	if err != nil {
		store.logger.Error("failed to get table", zap.Error(err), zap.String("query", query))
		return nil, err
	}

	// Convert the table string as its saved in DB to a Table.
	tableSchema := &mode.Table{}
	err = json.Unmarshal([]byte(storeResponse.Table), &tableSchema)
	if err != nil {
		store.logger.Error("failed to unmarshal store", zap.Error(err))
		return nil, err
	}

	return tableSchema, nil
}

func (store *Store) GetTables(chainId string, worldAddress string, tableNames []string) ([]*mode.Table, error) {
	tableSchemas := []*mode.Table{}
	for _, tableName := range tableNames {
		tableSchema, err := store.GetTable(chainId, worldAddress, tableName)
		if err != nil {
			return nil, err
		}
		tableSchemas = append(tableSchemas, tableSchema)
	}
	return tableSchemas, nil
}

func (store *Store) MustGetTable(chainId string, worldAddress string, tableName string) *mode.Table {
	tableSchema, err := store.GetTable(chainId, worldAddress, tableName)
	if err != nil {
		store.logger.Fatal("failed to get table", zap.Error(err))
	}
	return tableSchema
}
