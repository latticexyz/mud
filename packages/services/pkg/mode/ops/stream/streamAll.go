package stream

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

// StreamAllBuilder is a builder for streaming records from multiple tables.
type StreamAllBuilder struct {
	// Namespaces.
	QueryNamespace *pb_mode.Namespace
	ChainNamespace *pb_mode.Namespace
	WorldNamespace *pb_mode.Namespace

	ChainTables []string
	WorldTables []string

	TablesSet map[string]bool
}

// NewStreamAllBuilder returns a new StreamAllBuilder with the given parameters.
//
// Parameters:
//   - queryNamespace (*pb_mode.Namespace): The query namespace.
//   - chainTables ([]string): List of chain tables to stream.
//   - worldTables ([]string): List of world tables to stream.
//
// Returns:
//   - (*StreamAllBuilder): A pointer to the newly created StreamAllBuilder.
func NewStreamAllBuilder(queryNamespace *pb_mode.Namespace, chainTables []string, worldTables []string) *StreamAllBuilder {
	// Build a set of all tables that the client is interested in (if any).
	tableSet := make(map[string]bool)
	for _, tableName := range chainTables {
		tableSet[tableName] = true
	}
	for _, tableName := range worldTables {
		tableSet[tableName] = true
	}

	// Get sub-namespaces for the request. A namespace is a chainId and worldAddress pair.
	chainNamespace, worldNamespace := schema.NamespaceToSubNamespaces(queryNamespace)

	return &StreamAllBuilder{
		QueryNamespace: queryNamespace,
		ChainNamespace: chainNamespace,
		WorldNamespace: worldNamespace,
		ChainTables:    chainTables,
		WorldTables:    worldTables,
		TablesSet:      tableSet,
	}
}

// ShouldStream returns true if the table schema passes the table and namespace filters specified in the StreamAllBuilder
// instance.
//
// Parameters:
// - tableSchema (*mode.TableSchema): A mode.TableSchema instance containing metadata about the table being checked.
//
// Returns:
//   - (bool): A boolean indicating whether or not the table schema passes the table and namespace filters specified in the
//     StreamAllBuilder instance.
func (builder *StreamAllBuilder) ShouldStream(tableSchema *mode.TableSchema) bool {
	return builder.doesPassTableFilter(tableSchema.TableName) && builder.doesPassNamespaceFilter(tableSchema.Namespace)
}

// doesPassTableFilter returns true if the specified table name is in the list of table names to be streamed, or if the list
// of table names to be streamed is empty. Otherwise, it returns false.
//
// Parameters:
// - tableName (string): The name of the table being checked.
//
// Returns:
//   - (bool): A boolean indicating whether or not the specified table name is in the list of table names to be streamed, or
//     if the list of table names to be streamed is empty.
func (builder *StreamAllBuilder) doesPassTableFilter(tableName string) bool {
	if len(builder.TablesSet) == 0 {
		return true
	} else {
		return builder.TablesSet[tableName]
	}
}

// doesPassNamespaceFilter returns whether the given namespace string matches the namespace filter by the query. The namespace
// filter is determined by the namespace specified in the query. If the namespace is a chain namespace, then the namespace
// filter is the chainId. If the namespace is a world namespace, then the namespace filter is chainId and worldAddress (WorldNamespace).
//
// Parameters:
// - namespaceString (string): The namespace string being checked.
//
// Returns:
//   - (bool): A boolean indicating whether or not the specified namespace string matches the namespace filter by the
//     query.
func (builder *StreamAllBuilder) doesPassNamespaceFilter(namespaceString string) bool {
	// Convert a namespace string to a namespace object.
	incomingEventTableNamespace, err := schema.NamespaceObjectFromNamespace(namespaceString)
	if err != nil {
		return false
	}
	if incomingEventTableNamespace.WorldAddress != "" {
		// If the incoming event is for a world table, then it must match the world address in the query.
		return schema.IsNamespaceEqual(builder.WorldNamespace, incomingEventTableNamespace)
	}
	// If the incoming event is for a chain table, then it must match the chainId in the query.
	return schema.IsNamespaceEqual(builder.ChainNamespace, incomingEventTableNamespace)
}
