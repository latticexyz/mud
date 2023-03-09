package schema

import (
	"latticexyz/mud/packages/services/pkg/mode"
)

const CONNECTOR string = "__"
const TABLE_PREFIX string = "mode"

func BlockNumberTableSchema() *mode.TableSchema {
	return &mode.TableSchema{
		TableName: TABLE_PREFIX + CONNECTOR + "block_number",
		FieldNames: []string{
			"chain_id",
			"block_number",
		},
		PostgresTypes: map[string]string{
			"chain_id":     "text",
			"block_number": "text",
		},
		PrimaryKey: "chain_id",
	}
}

func SchemaTableSchema(chainId string) *mode.TableSchema {
	return &mode.TableSchema{
		TableName: ChainTable(chainId) + CONNECTOR + "schemas",
		FieldNames: []string{
			"world_address",
			"table_name",
			"schema",
		},
		PostgresTypes: map[string]string{
			"world_address": "text",
			"table_name":    "text",
			"schema":        "jsonb",
		},
	}
}
