package schema

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

const CONNECTOR string = "__"
const TABLE_PREFIX string = "mode"

func BlockNumberTableSchema() *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "block_numbers",
		FieldNames: []string{
			"chain_id",
			"block_number",
		},
		PostgresTypes: map[string]string{
			"chain_id":     "text",
			"block_number": "text",
		},
		PrimaryKey: "chain_id",
		Namespace:  Namespace("", ""),
	}
}

func SchemaTableSchema(chainId string) *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "schemas",
		FieldNames: []string{
			"world_address",
			"namespace",
			"table_name",
			"schema",
		},
		PostgresTypes: map[string]string{
			"world_address": "text",
			"namespace":     "text",
			"table_name":    "text",
			"schema":        "jsonb",
		},
		Namespace: Namespace(chainId, ""),
	}
}

func NamespacesTableSchema() *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "namespaces",
		FieldNames: []string{
			"namespace",
		},
		PostgresTypes: map[string]string{
			"namespace": "text",
		},
		PrimaryKey: "namespace",
		Namespace:  Namespace("", ""),
	}
}

func Namespace(chainId string, worldAddress string) string {
	var str strings.Builder
	str.WriteString(TABLE_PREFIX)
	if chainId != "" {
		str.WriteString(CONNECTOR + chainId)
	}
	if worldAddress != "" {
		str.WriteString(CONNECTOR + strings.ToLower(worldAddress))
	}
	return str.String()
}

func NamespaceFromNamespaceObject(namespace *pb_mode.Namespace) (string, error) {
	if namespace == nil {
		return "", fmt.Errorf("namespace is nil")
	}
	if namespace.ChainId == "" {
		return "", fmt.Errorf("chainId is empty")
	}
	if namespace.WorldAddress == "" {
		return "", fmt.Errorf("worldAddress is empty")
	}
	return Namespace(namespace.ChainId, namespace.WorldAddress), nil
}
