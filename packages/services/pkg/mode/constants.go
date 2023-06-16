package mode

import (
	"github.com/ethereum/go-ethereum/common"
)

const CONNECTOR string = "__"

//nolint:revive,stylecheck // constants
const TABLE_PREFIX string = "mode"

//nolint:revive,stylecheck // constants
const DEFAULT_RIGHT_PAD_LENGTH int = 16

// BlockNumberTable keeps track of the current block number on chain with `chainID`.
func BlockNumberTable(chainID string) *Table {
	return &Table{
		Name: "block_number",
		KeyNames: []string{
			"chain_id",
		},
		FieldNames: []string{
			"block_number",
		},
		PostgresTypes: map[string]string{
			"block_number": "text",
			"chain_id":     "text",
		},
		SolidityTypes: map[string]string{
			"block_number": "uint256",
			"chain_id":     "string",
		},
		Namespace: Namespace(chainID, ""),
		Metadata: &TableMetadata{
			ColumnMetadata: map[string]*ColumnMetadata{
				"chain_id": {
					IsKey:               true,
					ColumnFormattedName: "chain_id",
				},
			},
		},
	}
}

// SyncStatusTable keeps track of whether the chain with `chainID` is currently syncing.
func SyncStatusTable(chainID string) *Table {
	return &Table{
		Name: "sync_status",
		KeyNames: []string{
			"chain_id",
		},
		FieldNames: []string{
			"syncing",
		},
		PostgresTypes: map[string]string{
			"syncing":  "boolean",
			"chain_id": "text",
		},
		SolidityTypes: map[string]string{
			"syncing":  "bool",
			"chain_id": "string",
		},
		Namespace: Namespace(chainID, ""),
		Metadata: &TableMetadata{
			ColumnMetadata: map[string]*ColumnMetadata{
				"chain_id": {
					IsKey:               true,
					ColumnFormattedName: "chain_id",
				},
			},
		},
	}
}

// SchemasTable keeps track of the schemas for all tables synced on chain with `chainID`.
func SchemasTable(chainID string) *Table {
	tableKeyNames := []string{
		"world_address",
		"namespace",
		"table_name",
	}
	table := &Table{
		Name:     "schemas",
		KeyNames: tableKeyNames,
		FieldNames: []string{
			"key_schema",
			"fields_schema",
			"table_json",
		},
		PostgresTypes: map[string]string{
			"world_address": "text",
			"namespace":     "text",
			"table_name":    "text",
			"key_schema":    "text",
			"fields_schema": "text",
			"table_json":    "jsonb",
		},
		SolidityTypes: map[string]string{
			"world_address": "address",
			"namespace":     "string",
			"table_name":    "string",
			"key_schema":    "bytes32",
			"fields_schema": "bytes32",
			"table_json":    "bytes",
		},
		Namespace: Namespace(chainID, ""),
		Metadata: &TableMetadata{
			ColumnMetadata: map[string]*ColumnMetadata{},
		},
	}

	for _, keyName := range tableKeyNames {
		table.SetIsKey(keyName, true)
	}

	return table
}

func MUDStoreSchemaTableID() string {
	return "0x" + common.Bytes2Hex(append(RightPadString("mudstore"), RightPadString("schema")...))
}

func MUDStoreStoreMetadataTableID() string {
	return "0x" + common.Bytes2Hex(append(RightPadString("mudstore"), RightPadString("StoreMetadata")...))
}
