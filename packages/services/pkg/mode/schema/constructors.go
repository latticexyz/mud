package schema

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

const CONNECTOR string = "__"
const TABLE_PREFIX string = "mode"

func Internal__BlockNumberTableSchema(chainId string) *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "block_number",
		FieldNames: []string{
			"block_number",
		},
		PostgresTypes: map[string]string{
			"block_number": "text",
		},
		SolidityTypes: map[string]string{
			"block_number": "uint256",
		},
		Namespace: Namespace(chainId, ""),
	}
}

func Internal__NamespacesTableSchema() *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "namespaces",
		FieldNames: []string{
			"namespace",
		},
		PostgresTypes: map[string]string{
			"namespace": "text",
		},
		SolidityTypes: map[string]string{
			"namespace": "string",
		},
		PrimaryKey: "namespace",
		Namespace:  Namespace("", ""),
	}
}

func Internal__SchemaTableSchema(chainId string) *mode.TableSchema {
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
		SolidityTypes: map[string]string{
			"world_address": "address",
			"namespace":     "string",
			"table_name":    "string",
			"schema":        "string",
		},
		Namespace: Namespace(chainId, ""),
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
	if err := ValidateNamespace(namespace); err != nil {
		return "", err
	}
	return Namespace(namespace.ChainId, namespace.WorldAddress), nil
}

func ValidateNamespace(namespace *pb_mode.Namespace) error {
	if namespace == nil {
		return fmt.Errorf("namespace is nil")
	}
	return nil
}
