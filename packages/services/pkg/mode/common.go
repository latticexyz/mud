package mode

import (
	"fmt"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

// FieldToString converts a field struct to a string.
//
// Parameters:
// - field (*mode.Field): a pointer to a field struct that contains information about the field.
//
// Returns:
// - (string) a string that represents the table name and table field, concatenated with a dot (.)
func FieldToString(field *pb_mode.Field) string {
	return field.TableName + "." + field.TableField
}

// Namespace returns the namespace string for the specified chain ID and world address.
//
// Parameters:
// - chainID (string): The chain ID to include in the namespace.
// - worldAddress (string): The world address to include in the namespace.
//
// Returns:
// (string) - A string representing the namespace for the specified chain ID and world address.
func Namespace(chainID string, worldAddress string) string {
	var str strings.Builder
	str.WriteString(TABLE_PREFIX)
	if chainID != "" {
		str.WriteString(CONNECTOR + chainID)
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
	if err := RequireNamespace(namespace); err != nil {
		return "", err
	}
	return Namespace(namespace.ChainID, namespace.WorldAddress), nil
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
	chainID := ""
	worldAddress := ""
	components := strings.Split(namespace, CONNECTOR)
	if len(components) > 1 {
		chainID = components[1]
	}
	//nolint:gomnd // 2 is the max number of components
	if len(components) > 2 {
		worldAddress = components[2]
	}
	return &pb_mode.Namespace{
		ChainID:      chainID,
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
	if err := RequireNamespace(namespace1); err != nil {
		return false
	}
	if err := RequireNamespace(namespace2); err != nil {
		return false
	}
	return strings.EqualFold(namespace1.ChainID, namespace2.ChainID) &&
		strings.EqualFold(namespace1.WorldAddress, namespace2.WorldAddress)
}

// NamespaceToSubNamespaces splits the given Namespace instance into two separate namespaces representing the chain
// and world address.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to split.
//
// Returns:
// (chainNamespace *pb_mode.Namespace) - A pointer to a Namespace instance representing the chain.
// (worldNamespace *pb_mode.Namespace) - A pointer to a Namespace instance representing the world address.
func NamespaceToSubNamespaces(namespace *pb_mode.Namespace) (*pb_mode.Namespace, *pb_mode.Namespace) {
	chainNamespace := &pb_mode.Namespace{
		ChainID:      namespace.ChainID,
		WorldAddress: "",
	}
	worldNamespace := &pb_mode.Namespace{
		ChainID:      namespace.ChainID,
		WorldAddress: namespace.WorldAddress,
	}
	return chainNamespace, worldNamespace
}

// RequireNamespace validates the given Namespace instance.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to validate.
//
// Returns:
// (error) - An error, if any occurred during the validation.
func RequireNamespace(namespace *pb_mode.Namespace) error {
	if namespace == nil {
		return fmt.Errorf("namespace is nil")
	}
	return nil
}

// RequireWorldAddress validates the world address in the given Namespace instance.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to validate.
//
// Returns:
// (error) - An error, if any occurred during the validation.
func RequireWorldAddress(namespace *pb_mode.Namespace) error {
	if err := RequireNamespace(namespace); err != nil {
		return err
	}
	if namespace.WorldAddress == "" {
		return fmt.Errorf("worldAddress is empty")
	}
	return nil
}

// RequireChainID validates the chain ID in the given Namespace instance.
//
// Parameters:
// - namespace (*pb_mode.Namespace): A pointer to the Namespace instance to validate.
//
// Returns:
// (error) - An error, if any occurred during the validation.
func RequireChainID(namespace *pb_mode.Namespace) error {
	if err := RequireNamespace(namespace); err != nil {
		return err
	}
	if namespace.ChainID == "" {
		return fmt.Errorf("chainID is empty")
	}
	return nil
}
