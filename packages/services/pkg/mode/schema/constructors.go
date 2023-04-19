package schema

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

const CONNECTOR string = "__"
const TABLE_PREFIX string = "mode"

////////////////////////////
// Internal Table Schemas //
////////////////////////////

func Internal__BlockNumberTableSchema(chainId string) *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "block_number",
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
		IsKey: map[string]bool{
			"chain_id": true,
		},
		Namespace: Namespace(chainId, ""),
	}
}

func Internal__SyncStatusTableSchema(chainId string) *mode.TableSchema {
	return &mode.TableSchema{
		TableName: "sync_status",
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
		IsKey: map[string]bool{
			"chain_id": true,
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
		KeyNames: []string{
			"world_address",
			"namespace",
			"table_name",
		},
		FieldNames: []string{
			"key_schema",
			"value_schema",
			"schema",
		},
		PostgresTypes: map[string]string{
			"world_address": "text",
			"namespace":     "text",
			"table_name":    "text",
			"key_schema":    "text",
			"value_schema":  "text",
			"schema":        "jsonb",
		},
		SolidityTypes: map[string]string{
			"world_address": "address",
			"namespace":     "string",
			"table_name":    "string",
			"key_schema":    "bytes32",
			"value_schema":  "bytes32",
			"schema":        "bytes",
		},
		IsKey: map[string]bool{
			"world_address": true,
			"namespace":     true,
			"table_name":    true,
		},
		Namespace: Namespace(chainId, ""),
	}
}

////////////////////////////
// Namespace Manipulation //
////////////////////////////

// Namespace returns the namespace string for the specified chain ID and world address.
//
// Parameters:
// - chainId (string): The chain ID to include in the namespace.
// - worldAddress (string): The world address to include in the namespace.
//
// Returns:
// (string) - A string representing the namespace for the specified chain ID and world address.
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

// NamespaceFromNamespaceObject returns the namespace string for the specified pb_mode.Namespace instance.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to convert to a namespace string.
//
// Returns:
// (string) - A string representing the namespace for the specified pb_mode.Namespace instance.
// (error) - An error, if any occurred during the conversion.
func NamespaceFromNamespaceObject(namespace *pb_mode.Namespace) (string, error) {
	if err := ValidateNamespace(namespace); err != nil {
		return "", err
	}
	return Namespace(namespace.ChainId, namespace.WorldAddress), nil
}

// NamespaceObjectFromNamespace converts the specified namespace string into a pb_mode.Namespace instance.
//
// Parameters:
// - namespace (string): The namespace string to convert to a pb_mode.Namespace instance.
//
// Returns:
// (*pb_mode.Namespace) - A pointer to a pb_mode.Namespace instance representing the specified namespace string.
// (error) - An error, if any occurred during the conversion.
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

// IsNamespaceEqual determines whether two pb_mode.Namespace instances are equal.
//
// Parameters:
// - namespace1 (*pb_mode.Namespace): A pointer to the first Namespace instance to compare.
// - namespace2 (*pb_mode.Namespace): A pointer to the second Namespace instance to compare.
//
// Returns:
// (bool) - A boolean value indicating whether the two namespaces are equal.
func IsNamespaceEqual(namespace1 *pb_mode.Namespace, namespace2 *pb_mode.Namespace) bool {
	if err := ValidateNamespace(namespace1); err != nil {
		return false
	}
	if err := ValidateNamespace(namespace2); err != nil {
		return false
	}
	return strings.EqualFold(namespace1.ChainId, namespace2.ChainId) && strings.EqualFold(namespace1.WorldAddress, namespace2.WorldAddress)
}

// NamespaceToSubNamespaces splits the given Namespace instance into two separate namespaces representing the chain and world address.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to split.
//
// Returns:
// (chainNamespace *pb_mode.Namespace) - A pointer to a Namespace instance representing the chain.
// (worldNamespace *pb_mode.Namespace) - A pointer to a Namespace instance representing the world address.
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

// ValidateNamespace validates the given Namespace instance.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to validate.
//
// Returns:
// (error) - An error, if any occurred during the validation.
func ValidateNamespace(namespace *pb_mode.Namespace) error {
	if namespace == nil {
		return fmt.Errorf("namespace is nil")
	}
	return nil
}

// ValidateNamespace__State validates the given Namespace instance for state-related operations.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to validate.
//
// Returns:
// (error) - An error, if any occurred during the validation.
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

// ValidateNamespace__State validates the given Namespace instance for state-related operations on
// a single table.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to validate.
//
// Returns:
// (error) - An error, if any occurred during the validation.
func ValidateNamespace__SingleState(namespace *pb_mode.Namespace) error {
	if err := ValidateNamespace(namespace); err != nil {
		return err
	}
	if namespace.ChainId == "" {
		return fmt.Errorf("chainId is empty")
	}
	return nil
}
