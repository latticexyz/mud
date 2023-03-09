package schema

import (
	"encoding/json"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"go.uber.org/zap"
)

func BuildTableSchemas() map[string]*mode.TableSchema {
	// TODO: fetch from DB.
	blockNumberTableSchema := BlockNumberTableSchema()

	return map[string]*mode.TableSchema{
		blockNumberTableSchema.TableName: blockNumberTableSchema,
	}
}

func NewCache(dl *db.DatabaseLayer, chains []mode.ChainConfig, logger *zap.Logger) *SchemaCache {
	return &SchemaCache{
		dl:           dl,
		logger:       logger,
		tableSchemas: BuildTableSchemas(),
	}
}

func (cache *SchemaCache) Update() error {
	return nil
}

func (cache *SchemaCache) GetTableSchema(chainId string, worldAddress string, tableName string) (*mode.TableSchema, error) {
	schemaTableName := SchemaTableSchema(chainId).TableName

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
	builder := mode.NewFindBuilder(request)
	query, err := builder.ToSQLQuery()
	if err != nil {
		cache.logger.Error("failed to build query", zap.Error(err))
		return nil, err
	}
	schemaResponse := &SchemaCacheResponse{}
	err = cache.dl.Get(schemaResponse, query)
	if err != nil {
		cache.logger.Error("failed to get schema", zap.Error(err))
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
