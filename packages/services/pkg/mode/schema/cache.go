package schema

import (
	"encoding/json"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/config"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ops/find"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

// BuildInternalTableSchemas creates a map of internal table schemas for the specified ChainConfig slice.
// The function returns a map of strings to pointers to TableSchema instances.
//
// Parameters:
// - chains ([]config.ChainConfig): A slice of ChainConfig instances for which to build the internal table schemas.
//
// Returns:
// (map[string]*mode.TableSchema) - A map of strings to pointers to TableSchema instances representing the internal table schemas for the chains.
func BuildInternalTableSchemas(chains []config.ChainConfig) map[string]*mode.TableSchema {
	// Create references to all of the internal table schemas.
	tableSchemas := map[string]*mode.TableSchema{}
	for _, chain := range chains {
		// Add the block number table schema.
		blockNumberTableSchema := Internal__BlockNumberTableSchema(chain.Id)
		tableSchemas[blockNumberTableSchema.TableName] = blockNumberTableSchema

		// Add the sync status table schema.
		syncStatusTableSchema := Internal__SyncStatusTableSchema(chain.Id)
		tableSchemas[syncStatusTableSchema.TableName] = syncStatusTableSchema

		// Add the schema table schema.
		schemaTableSchema := Internal__SchemaTableSchema(chain.Id)
		tableSchemas[schemaTableSchema.TableName] = schemaTableSchema
	}
	return tableSchemas
}

// NewCache creates a new SchemaCache instance with the specified DatabaseLayer, ChainConfig slice, and Logger instances.
//
// Parameters:
// - dl (*db.DatabaseLayer): A pointer to the DatabaseLayer instance for the SchemaCache.
// - chains ([]config.ChainConfig): A slice of ChainConfig instances for the SchemaCache.
// - logger (*zap.Logger): A pointer to the Logger instance for the SchemaCache.
//
// Returns:
// (*SchemaCache) - A pointer to a SchemaCache instance.
func NewCache(dl *db.DatabaseLayer, chains []config.ChainConfig, logger *zap.Logger) *SchemaCache {
	return &SchemaCache{
		dl:                   dl,
		logger:               logger,
		internalTableSchemas: BuildInternalTableSchemas(chains),
	}
}

// IsInternal__BlockNumberTable determines whether the specified table name is for an internal block number table.
//
// Parameters:
// - chainId (string): The chain ID of the table.
// - tableName (string): The name of the table.
//
// Returns:
// (bool) - A boolean value indicating whether the specified table is for an internal block number table.
func (cache *SchemaCache) IsInternal__BlockNumberTable(chainId string, tableName string) bool {
	return tableName == Internal__BlockNumberTableSchema(chainId).TableName
}

// IsInternalTable determines whether the specified table name is for an internal table.
//
// Parameters:
// - tableName (string): The name of the table.
//
// Returns:
// (bool) - A boolean value indicating whether the specified table is for an internal table.
func (cache *SchemaCache) IsInternalTable(tableName string) bool {
	_, ok := cache.internalTableSchemas[tableName]
	return ok
}

// GetTableSchema retrieves the TableSchema instance for the specified chain ID, world address, and table name from the cache.
//
// Parameters:
// - chainId (string): The chain ID of the table.
// - worldAddress (string): The world address of the table.
// - tableName (string): The name of the table.
//
// Returns:
// (*mode.TableSchema) - A pointer to a TableSchema instance representing the schema for the table.
// (error) - An error, if any occurred during the operation.
func (cache *SchemaCache) GetTableSchema(chainId string, worldAddress string, tableName string) (*mode.TableSchema, error) {
	// If the table name is for an internal table, return schema directly.
	if cache.IsInternalTable(tableName) {
		return cache.internalTableSchemas[tableName], nil
	}

	// Otherwise lookup the schema from the internal schemas table.
	schemaTableSchema := Internal__SchemaTableSchema(chainId)
	schemaTableName := schemaTableSchema.TableName

	// Create a request builder for the table schema query.
	request := &pb_mode.FindRequest{
		From: schemaTableName,
		Filter: []*pb_mode.Filter{
			{
				Field: &pb_mode.Field{
					TableName:  schemaTableName,
					TableField: "world_address",
				},
				Operator: "=",
				Value:    worldAddress,
			},
			{
				Field: &pb_mode.Field{
					TableName:  schemaTableName,
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
					TableName:  schemaTableName,
					TableField: "schema",
				},
			},
		},
	}
	// Query the DB for the schema.
	builder := find.New__FromFindRequest(request, schemaTableSchema.Namespace)
	query, err := builder.ToSQLQuery()
	if err != nil {
		cache.logger.Error("failed to build query", zap.Error(err))
		return nil, err
	}
	schemaResponse := &SchemaCacheResponse{}
	err = cache.dl.Get(schemaResponse, query)
	if err != nil {
		cache.logger.Error("failed to get schema", zap.Error(err), zap.String("query", query))
		return nil, err
	}

	// Convert the schema string to a TableSchema.
	tableSchema := &mode.TableSchema{}
	err = json.Unmarshal([]byte(schemaResponse.Schema), &tableSchema)
	if err != nil {
		cache.logger.Error("failed to unmarshal schema", zap.Error(err))
		return nil, err
	}
	cache.logger.Info("got table schema", zap.String("schema", schemaResponse.Schema))

	return tableSchema, nil
}

// GetTableSchemas retrieves the TableSchema instances for the specified chain ID, world address, and table names from the cache.
//
// Parameters:
// - chainId (string): The chain ID of the tables.
// - worldAddress (string): The world address of the tables.
// - tableNames ([]string): A slice of table names for which the schema needs to be retrieved.
//
// Returns:
// ([]*mode.TableSchema) - A slice of pointers to TableSchema instances representing the schema for the tables.
// (error) - An error, if any occurred during the operation.
func (cache *SchemaCache) GetTableSchemas(chainId string, worldAddress string, tableNames []string) ([]*mode.TableSchema, error) {
	tableSchemas := []*mode.TableSchema{}
	for _, tableName := range tableNames {
		tableSchema, err := cache.GetTableSchema(chainId, worldAddress, tableName)
		if err != nil {
			return nil, err
		}
		tableSchemas = append(tableSchemas, tableSchema)
	}
	return tableSchemas, nil
}
