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

func Internal__SyncStatusTableSchema(chainId string) *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "sync_status",
		FieldNames: []string{
			"syncing",
		},
		PostgresTypes: map[string]string{
			"syncing": "boolean",
		},
		SolidityTypes: map[string]string{
			"syncing": "bool",
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
			"schema":        "bytes",
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

func NamespaceObjectFromNamespace(namespace string) (*pb_mode.Namespace, error) {
	if namespace == "" {
		return nil, fmt.Errorf("namespace is empty")
	}
	if !strings.HasPrefix(namespace, TABLE_PREFIX) {
		return nil, fmt.Errorf("namespace does not start with %s", TABLE_PREFIX)
	}
	chainId := ""
	worldAddress := ""
	components := strings.Split(namespace, CONNECTOR)
	if len(components) > 1 {
		chainId = components[1]
	}
	if len(components) > 2 {
		worldAddress = components[2]
	}
	return &pb_mode.Namespace{
		ChainId:      chainId,
		WorldAddress: worldAddress,
	}, nil
}

func IsNamespaceEqual(namespace1 *pb_mode.Namespace, namespace2 *pb_mode.Namespace) bool {
	if err := ValidateNamespace(namespace1); err != nil {
		return false
	}
	if err := ValidateNamespace(namespace2); err != nil {
		return false
	}
	return strings.EqualFold(namespace1.ChainId, namespace2.ChainId) && strings.EqualFold(namespace1.WorldAddress, namespace2.WorldAddress)
}

func NamespaceToSubNamespaces(namespace *pb_mode.Namespace) (chainNamespace *pb_mode.Namespace, worldNamespace *pb_mode.Namespace) {
	chainNamespace = &pb_mode.Namespace{
		ChainId:      namespace.ChainId,
		WorldAddress: "",
	}
	worldNamespace = &pb_mode.Namespace{
		ChainId:      namespace.ChainId,
		WorldAddress: namespace.WorldAddress,
	}
	return
}

func ValidateNamespace(namespace *pb_mode.Namespace) error {
	if namespace == nil {
		return fmt.Errorf("namespace is nil")
	}
	return nil
}

func ValidateNamespace__State(namespace *pb_mode.Namespace) error {
	if err := ValidateNamespace(namespace); err != nil {
		return err
	}
	if namespace.ChainId == "" {
		return fmt.Errorf("chainId is empty")
	}
	if namespace.WorldAddress == "" {
		return fmt.Errorf("worldAddress is empty")
	}
	return nil
}
